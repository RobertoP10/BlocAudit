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
    console.log("Register:", {
      firstName,
      lastName,
      email,
      address,
      phone,
      password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 relative">
      {/* 👇 Buton înapoi la homepage */}
      <a
        href="/"
        className="absolute top-4 left-4 text-white bg-emerald-600 px-3 py-1 rounded-lg text-sm hover:bg-emerald-700 transition"
      >
        ← Înapoi la Homepage
      </a>

      {/* Card register */}
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 animate-fade-in-down">
        <h1 className="text-3xl font-bold text-center text-emerald-600 mb-2">
          Creează cont BlocAudit
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Completează toate câmpurile pentru a-ți crea un cont
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Prenume"
              required
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Nume"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="relative">
            <Home className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Str. Exemplu, Nr. 10, București"
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="07XXXXXXXX"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 rounded-lg font-semibold shadow-md hover:scale-105 hover:shadow-xl transition"
          >
            Creează cont
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Ai deja cont?{" "}
          <a href="/login" className="text-emerald-600 font-medium hover:underline">
            Conectează-te
          </a>
        </div>
      </div>
    </div>
  );
}
