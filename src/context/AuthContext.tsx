import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

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

// 🧹 helper pentru curățarea tokenurilor supabase
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

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          clearSupabaseTokens();
          setUser(null);
          setProfile(null);
          return;
        }

        console.log("✅ Session active:", data.session.user.email);
        setUser(data.session.user);
        await loadProfile(data.session.user.id);
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

    // 📡 subscribe la schimbări de auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔔 Auth event:", event);

        if (event === "SIGNED_OUT" || !session) {
          clearSupabaseTokens();
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (session) {
          setUser(session.user);
          await loadProfile(session.user.id);
        }

        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
