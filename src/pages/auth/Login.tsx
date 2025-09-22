import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { profile } = useAuth();

  // 🔄 Dacă ești deja logat, te redirecționează automat
  useEffect(() => {
    if (profile?.role) {
      switch (profile.role) {
        case "admin":
          navigate("/admin");
          break;
        case "technical":
          navigate("/technical");
          break;
        case "service":
          navigate("/service");
          break;
        case "client":
          navigate("/client");
          break;
        case "superadmin":
          navigate("/superadmin");
          break;
        default:
          break;
      }
    }
  }, [profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error("Login error:", loginError.message);
      setError(loginError.message);
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#9333EA] relative">
      {/* Buton înapoi (Link, nu href) */}
      <Link
        to="/"
        className="absolute top-4 left-4 text-white bg-indigo-600 px-3 py-1 rounded-lg text-sm hover:bg-indigo-700 transition"
      >
        ← Înapoi la Homepage
      </Link>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-indigo-100 animate-fade-in-down">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
          BlocAudit
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Conectează-te la contul tău
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-medium text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg font-semibold shadow-md hover:scale-105 transition"
          >
            Conectează-te
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-2 text-gray-400 text-sm">sau</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div className="text-center text-sm text-gray-500">
          Nu ai cont?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-medium hover:underline"
          >
            Creează unul
          </Link>
        </div>
      </div>
    </div>
  );
}
