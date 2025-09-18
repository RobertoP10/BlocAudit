import { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // aici integrezi serviciul de trimitere email (ex: EmailJS sau backend propriu)
    console.log("Trimite la contact@hubdevnest.com:", { name, email, message });
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Contactează-ne
        </h1>

        {sent ? (
          <p className="text-center text-green-600 font-semibold">
            ✅ Mesajul tău a fost trimis cu succes!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nume complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="email"
              placeholder="Adresa ta de email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
            <textarea
              placeholder="Mesajul tău"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              rows={5}
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Trimite mesaj
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
