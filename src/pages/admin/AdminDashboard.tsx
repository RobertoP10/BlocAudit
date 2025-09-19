import { useAuth } from "../../context/AuthContext";
import { Building2, Users, FileText, Gauge } from "lucide-react";

export default function AdminDashboard() {
  const { signOut, profile } = useAuth();

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-indigo-700">
            Company Admin Dashboard
          </h1>
          <p className="text-gray-500">
            Bine ai venit, <span className="font-semibold">{profile?.full_name}</span>
          </p>
        </div>
        <button
          onClick={signOut}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition"
        >
          Logout
        </button>
      </div>

      {/* Statistici principale */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="p-6 bg-white shadow rounded-xl flex flex-col items-center">
          <FileText className="text-indigo-600 mb-2" size={28} />
          <p className="text-sm text-gray-500">Total Cereri</p>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="p-6 bg-white shadow rounded-xl flex flex-col items-center">
          <Building2 className="text-green-600 mb-2" size={28} />
          <p className="text-sm text-gray-500">Asociații</p>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="p-6 bg-white shadow rounded-xl flex flex-col items-center">
          <Users className="text-blue-600 mb-2" size={28} />
          <p className="text-sm text-gray-500">Utilizatori</p>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="p-6 bg-white shadow rounded-xl flex flex-col items-center">
          <Gauge className="text-purple-600 mb-2" size={28} />
          <p className="text-sm text-gray-500">Consum Plan</p>
          <p className="text-2xl font-bold">0%</p>
        </div>
      </div>

      {/* Secțiuni administrare */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white shadow rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-indigo-700">
            Administrare Companie
          </h2>
          <p className="text-gray-500 mb-2">
            Gestionează detaliile companiei și planul de abonament.
          </p>
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow">
            Detalii Companie
          </button>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-green-700">
            Administrare Asociații
          </h2>
          <p className="text-gray-500 mb-2">
            Creează și gestionează asociațiile conectate la compania ta.
          </p>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow">
            Gestionează Asociații
          </button>
        </div>
      </div>
    </div>
  );
}
