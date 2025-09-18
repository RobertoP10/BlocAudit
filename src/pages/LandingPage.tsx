import { useState } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-blue-600/90 relative text-gray-900">
      {/* Fundal */}
      <img
        src="/fundal.png"
        alt="Blocuri"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />

      {/* HERO */}
      <header className="relative z-10 text-center py-24 px-6 animate-fade-in-down">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
          🚀 Noul standard pentru <br /> managementul asociațiilor
        </h1>
        <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
          BlocAudit – Platforma digitală pentru întreținere și asociații de locatari.
          Gestionează cereri, inspecții și rapoarte într-un singur loc. Rapid, sigur și mobil-first.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/register"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-700 hover:scale-105 transition"
          >
            Începe gratuit
          </a>
          <a
            href="#pricing"
            className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold shadow hover:scale-105 transition"
          >
            Vezi planurile
          </a>
        </div>
      </header>

      {/* FUNNEL Conversational */}
      <section className="relative z-10 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-6 animate-fade-in-up">
          Alege ce vrei să faci 👇
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <a
            href="/login"
            className="bg-white/90 text-indigo-600 px-6 py-4 rounded-xl shadow-lg hover:scale-105 transition"
          >
            Sunt deja utilizator
          </a>
          <a
            href="/register"
            className="bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg hover:scale-105 transition"
          >
            Creează cont nou
          </a>
          <a
            href="#pricing"
            className="bg-purple-500 text-white px-6 py-4 rounded-xl shadow-lg hover:scale-105 transition"
          >
            Vreau să văd planurile
          </a>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative z-10 py-20 px-6 bg-white text-gray-800">
        <h2 className="text-4xl font-bold text-center mb-12">Alege planul potrivit</h2>
        <div className="flex justify-center gap-4 mb-8">
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${billing === "monthly" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
            onClick={() => setBilling("monthly")}
          >
            Lunar
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${billing === "yearly" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
            onClick={() => setBilling("yearly")}
          >
            Anual -10%
          </button>
        </div>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { title: "Basic", price: "€49", features: ["1000 cereri", "50 utilizatori", "10 asociații"] },
            { title: "Premium", price: "€99", features: ["5000 cereri", "200 utilizatori", "25 asociații"] },
            { title: "Enterprise", price: "€199", features: ["10.000 cereri", "500 utilizatori", "50 asociații"] },
            { title: "Enterprise+", price: "€299", features: ["20.000+ cereri", "1000+ utilizatori", "100+ asociații"] },
          ].map((plan, idx) => (
            <div key={idx} className="border rounded-2xl shadow-lg p-6 hover:scale-105 transition bg-white">
              <h3 className="text-2xl font-bold text-indigo-600">{plan.title}</h3>
              <p className="text-3xl font-extrabold my-4">{plan.price}<span className="text-lg">/lună</span></p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="text-green-500" size={18} /> {f}
                  </li>
                ))}
              </ul>
              <a
                href="/register"
                className="block text-center bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Alege planul
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-gray-900 text-gray-300 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2025 BlocAudit. Toate drepturile rezervate.</p>
          <div className="flex gap-6">
            <a href="/gdpr" className="hover:text-white">GDPR</a>
            <a href="/terms" className="hover:text-white">Termeni și condiții</a>
            <a href="/contact" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
