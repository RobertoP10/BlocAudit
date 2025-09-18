import { useState } from "react";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
      bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 
      bg-[url('/blocuri.png')] bg-cover bg-center bg-blend-overlay 
      animate-fade-in-down">
      
      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg 
        shadow-2xl rounded-2xl p-8 border border-indigo-100 animate-fade-in-up">
        
        {/* Titlu */}
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-4 tracking-tight animate-pulse-scale">
          BlocAudit 🚀
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Conectează-te la contul tău
        </p>

        {/* Formular */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative animate-fade-in-up">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:shadow-md outline-none transition"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="relative animate-fade-in-up delay-150">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:shadow-md outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 bg-[length:200%_200%] animate-gradient-x text-white py-3 rounded-lg font-semibold shadow-md hover:scale-105 hover:shadow-xl transition"
          >
            Conectează-te
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-2 text-gray-400 text-sm">sau</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Link către register */}
        <div className="text-center text-sm text-gray-600">
          Nu ai cont?{" "}
          <a href="/register" className="text-indigo-600 font-medium hover:underline">
            Creează unul
          </a>
        </div>
      </div>
    </div>
  );
}
