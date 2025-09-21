import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

type Profile = {
  id: string;
  role: string;
  company_id: string | null;
  association_id: string | null;
  full_name: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

// 🧹 helper: șterge toate cheile Supabase token din localStorage
const clearSupabaseTokens = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("sb-") && key.includes("-auth-token")) {
      localStorage.removeItem(key);
      console.log("🧹 Removed token:", key);
    }
  });
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 🔄 verifică sesiunea la start
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("❌ getSession error:", error.message);

        if (data.session?.user) {
          console.log("✅ Session found:", data.session.user.email);
          setUser(data.session.user);
          await loadProfile(data.session.user.id);
        } else {
          console.log("⚠️ No active session, clearing tokens...");
          clearSupabaseTokens();
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("❌ getInitialSession failed:", err);
        clearSupabaseTokens();
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 📡 subscribe la evenimentele de auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔔 Auth event:", event);

        if (event === "SIGNED_OUT" || !session) {
          clearSupabaseTokens();
          setUser(null);
          setProfile(null);
          setLoading(false);
          navigate("/login", { replace: true });
          return;
        }

        if (event === "TOKEN_REFRESHED" && session) {
          console.log("🔄 Token refreshed");
          setUser(session.user);
          await loadProfile(session.user.id);
        }

        if (event === "SIGNED_IN" && session) {
          console.log("✅ Signed in:", session.user.email);
          setUser(session.user);
          await loadProfile(session.user.id);
        }

        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  // 📥 încarcă profilul din app_users
  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("app_users")
      .select("id, role, company_id, association_id, full_name")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  // 🚪 logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("❌ Logout error:", error.message);
    } catch (err) {
      console.error("❌ Logout exception:", err);
    } finally {
      clearSupabaseTokens();
      setUser(null);
      setProfile(null);
      navigate("/login", { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
