import { useState } from "react";

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
    // TODO: Integrare Supabase Auth + insert în app_users
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-green-600">
          Creează cont BlocAudit
        </h1>
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Prenume */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prenume
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Ion"
              required
            />
          </div>

          {/* Nume */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nume
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Popescu"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Adresă */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adresă
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Str. Exemplu, Nr. 10, București"
              required
            />
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Telefon
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="07XXXXXXXX"
              required
            />
          </div>

          {/* Parolă */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Parolă
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Buton submit */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Creează cont
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          Ai deja cont?{" "}
          <a href="/login" className="text-green-600 hover:underline">
            Conectează-te
          </a>
        </div>
      </div>
    </div>
  );
}
