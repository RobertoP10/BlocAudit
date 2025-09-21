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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("❌ getSession error:", error.message);

        if (data.session?.user) {
          console.log("✅ Session found:", data.session.user.email);
          setUser(data.session.user);
          await loadProfile(data.session.user.id);
        } else {
          // fallback dacă sesiunea nu e încărcată corect
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            console.log("✅ getUser fallback:", userData.user.email);
            setUser(userData.user);
            await loadProfile(userData.user.id);
          } else {
            console.log("⚠️ No active session");
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error("❌ getInitialSession failed:", err);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // ascultă evenimentele de auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth event:", event);

        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          setProfile(null);
          navigate("/login", { replace: true });
          setLoading(false);
          return;
        }

        if (session?.user) {
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
      setProfile(null);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("❌ Logout error:", error.message);

    // curățăm orice sesiune Supabase salvată în localStorage
    for (const key in localStorage) {
      if (key.startsWith("sb-") && key.includes("-auth-token")) {
        localStorage.removeItem(key);
      }
    }

    setUser(null);
    setProfile(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
