import { ArrowDown, CheckCircle, Building2, Wrench, ClipboardList, Laptop } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FunnelPage() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full text-gray-800">
      {/* 1. Hero */}
      <section
        className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 relative text-white"
        style={{
          backgroundImage: "url('/fundal.png')",
          backgroundSize: "cover",
          backgroundBlendMode: "overlay",
        }}
      >
        <h1 className="text-5xl font-extrabold mb-6 animate-fade-in-down">
          Audit clar, rapid și automatizat
        </h1>
        <p className="text-lg max-w-2xl mb-8 animate-fade-in-up">
          Auditul nu trebuie să fie complicat. Cu BlocAudit, devine clar, rapid și complet automatizat.
        </p>
        <button
          onClick={() => scrollTo("about")}
          className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition"
        >
          Vezi cum funcționează
        </button>
        <ArrowDown className="mt-10 animate-bounce" size={32} />
      </section>

      {/* 2. Ce este BlocAudit */}
      <section id="about" className="py-20 px-6 bg-white text-center">
        <h2 className="text-4xl font-bold mb-6">Ce este BlocAudit?</h2>
        <p className="max-w-3xl mx-auto mb-10 text-lg text-gray-600">
          BlocAudit este platforma care transformă verificările tehnice în procese simple, transparente și scalabile.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
          <p className="flex items-center gap-3">
            <CheckCircle className="text-green-500" /> Multi-tenant logică cu izolare completă
          </p>
          <p className="flex items-center gap-3">
            <CheckCircle className="text-green-500" /> Audit trail automat și exporturi PDF/Excel
          </p>
          <p className="flex items-center gap-3">
            <CheckCircle className="text-green-500" /> Webhook-uri, notificări și corecții modulare
          </p>
          <p className="flex items-center gap-3">
            <CheckCircle className="text-green-500" /> Dashboard-uri personalizate pentru fiecare rol
          </p>
        </div>
        <button
          onClick={() => scrollTo("flow")}
          className="mt-10 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700"
        >
          Explorează funcționalitățile
        </button>
      </section>

      {/* 3. Cum funcționează */}
      <section id="flow" className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-4xl font-bold mb-12">Cum funcționează?</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="p-6 bg-white rounded-xl shadow-lg">
            1️⃣ Creezi o companie / asociație cu roluri și permisiuni
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            2️⃣ Adaugi cereri, documente, statusuri și notificări
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            3️⃣ Generezi rapoarte și exporturi automate
          </div>
        </div>
        <button
          onClick={() => navigate("/landing")}
          className="mt-10 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700"
        >
          Încearcă demo-ul
        </button>
      </section>

      {/* 4. Cui se adresează */}
      <section id="audience" className="py-20 px-6 bg-white text-center">
        <h2 className="text-4xl font-bold mb-12">Cui se adresează?</h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div>
            <Building2 className="mx-auto text-indigo-600" size={40} />
            <p className="mt-2">Asociații</p>
          </div>
          <div>
            <Wrench className="mx-auto text-indigo-600" size={40} />
            <p className="mt-2">Echipe tehnice</p>
          </div>
          <div>
            <ClipboardList className="mx-auto text-indigo-600" size={40} />
            <p className="mt-2">Auditori</p>
          </div>
          <div>
            <Laptop className="mx-auto text-indigo-600" size={40} />
            <p className="mt-2">Startup-uri</p>
          </div>
        </div>
      </section>

      {/* 5. Testimoniale */}
      <section id="testimonials" className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-4xl font-bold mb-12">Ce spun utilizatorii</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="p-6 bg-white rounded-xl shadow-lg">
            „BlocAudit ne-a redus timpul de audit cu 70%.” — Andrei
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            „Am integrat BlocAudit cu sistemele interne în 2 ore.” — Ioana
          </div>
        </div>
      </section>

      {/* 6. CTA final */}
      <section id="cta" className="py-20 px-6 bg-indigo-600 text-center text-white">
        <h2 className="text-4xl font-bold mb-6">Simplifică auditul. Scalează procesele.</h2>
        <p className="mb-8">BlocAudit e platforma care te duce acolo.</p>
        <button
          onClick={() => navigate("/landing")}
          className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-lg shadow-lg hover:scale-105 transition"
        >
          Intră în platformă
        </button>
      </section>
    </div>
  );
}
