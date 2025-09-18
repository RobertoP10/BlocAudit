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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8">
        {/* Titlu */}
        <h1 className="text-3xl font-bold text-center text-emerald-600 mb-2">
          Creează cont BlocAudit
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Completează toate câmpurile pentru a-ți crea un cont
        </p>

        {/* Formular */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Prenume */}
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

          {/* Nume */}
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

          {/* Email */}
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

          {/* Adresă */}
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

          {/* Telefon */}
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

          {/* Parolă */}
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

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 hover:scale-105 transition"
          >
            Creează cont
          </button>
        </form>

        {/* Link către login */}
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
