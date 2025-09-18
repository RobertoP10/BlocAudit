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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        {/* Logo / Titlu */}
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
          BlocAudit
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Conectează-te la contul tău
        </p>

        {/* Formular */}
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

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 hover:scale-105 transition"
          >
            Conectează-te
          </button>
        </form>

        {/* Link register */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Nu ai cont?{" "}
          <a href="/register" className="text-indigo-600 font-medium hover:underline">
            Creează unul
          </a>
        </div>
      </div>
    </div>
  );
}
