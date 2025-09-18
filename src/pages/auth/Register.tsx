import { useState } from "react";
import { User, Mail, Home, Phone, Lock } from "lucide-react";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register:", { firstName, lastName, email, address, phone, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
      bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 
      bg-[url('/blocuri.png')] bg-cover bg-center bg-blend-overlay 
      animate-fade-in-down">

      <div className="w-full max-w-lg bg-white/80 backdrop-blur-lg 
        shadow-2xl rounded-2xl p-8 border border-emerald-100 animate-fade-in-up">
        
        {/* Titlu */}
        <h1 className="text-4xl font-extrabold text-center text-emerald-600 mb-4 tracking-tight animate-pulse-scale">
          Creează cont BlocAudit 🌱
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Completează toate câmpurile pentru a-ți crea un cont
        </p>

        {/* Formular */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="relative animate-fade-in-up">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:shadow-md outline-none transition"
              placeholder="Prenume"
              required
            />
          </div>

          <div className="relative animate-fade-in-up delay-100">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:shadow-md outline-none transition"
              placeholder="Nume"
              required
            />
          </div>

          <div className="relative animate-fade-in-up delay-200">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:shadow-md outline-none transition"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="relative animate-fade-in-up delay-300">
            <Home className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:shadow-md outline-none transition"
              placeholder="Str. Exemplu, Nr. 10, București"
              required
            />
          </div>

          <div className="relative animate-fade-in-up delay-400">
            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:shadow-md outline-none transition"
              placeholder="07XXXXXXXX"
              required
            />
          </div>

          <div className="relative animate-fade-in-up delay-500">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:shadow-md outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 bg-[length:200%_200%] animate-gradient-x text-white py-3 rounded-lg font-semibold shadow-md hover:scale-105 hover:shadow-xl transition"
          >
            Creează cont
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-2 text-gray-400 text-sm">sau</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Link către login */}
        <div className="text-center text-sm text-gray-600">
          Ai deja cont?{" "}
          <a href="/login" className="text-emerald-600 font-medium hover:underline">
            Conectează-te
          </a>
        </div>
      </div>
    </div>
  );
}
