import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
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

// 🧹 helper: șterge toate cheile Supabase token din localStorage și sessionStorage
const clearSupabaseTokens = () => {
  [localStorage, sessionStorage].forEach((storage) => {
    Object.keys(storage).forEach((key) => {
      if (key.startsWith("sb-") && key.includes("-auth-token")) {
        storage.removeItem(key);
        console.log("🧹 Removed token:", key);
      }
    });
  });
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("⚠️ Session error, forcing signOut...");
          await supabase.auth.signOut();
          clearSupabaseTokens();
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (!data.session) {
          console.log("ℹ️ No session yet, waiting for SIGNED_IN event...");
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        console.log("✅ Active session:", data.session.user.email);
        setUser(data.session.user);
        await loadProfile(data.session.user.id);
      } catch (err) {
        console.error("❌ initAuth failed:", err);
        clearSupabaseTokens();
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 📡 subscribe la evenimentele de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 Auth event:", event);

      if (event === "SIGNED_OUT" || !session) {
        clearSupabaseTokens();
        setUser(null);
        setProfile(null);
        setLoading(false);
        navigate("/login", { replace: true });
        return;
      }

      if (["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event) && session) {
        console.log("🔄 Session updated:", session.user.email);
        setUser(session.user);
        await loadProfile(session.user.id);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
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
    } else {
      console.warn("⚠️ Profile not found for user:", userId);
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
