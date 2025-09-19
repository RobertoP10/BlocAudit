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
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        // dacă nu există sesiune validă → logout curat
        await supabase.auth.signOut();
        localStorage.removeItem("supabase.auth.token");
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const session: Session = data.session;
      setUser(session.user);
      await loadProfile(session.user.id);
      setLoading(false);
    };

    getInitialSession();

    // ascultă evenimentele de auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          localStorage.removeItem("supabase.auth.token");
          navigate("/login", { replace: true });
          return;
        }

        if (event === "TOKEN_REFRESHED" && session) {
          setUser(session.user);
          await loadProfile(session.user.id);
        }

        if (event === "SIGNED_IN" && session) {
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
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();

    // curățăm și manual localStorage
    localStorage.removeItem("supabase.auth.token");

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
