import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import {
  Building2,
  Users,
  FileText,
  Gauge,
  LogOut,
  Plus,
  Trash2,
} from "lucide-react";

export default function AdminDashboard() {
  const { signOut, profile } = useAuth();

  const [stats, setStats] = useState({
    requests: 0,
    associations: 0,
    users: 0,
    planUsage: 0,
  });

  const [associations, setAssociations] = useState<any[]>([]);
  const [newAssociation, setNewAssociation] = useState({ name: "", address: "" });

  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    role: "client",
    association_id: "",
  });

  // 📥 încarcă statistici + asociații + utilizatori
  useEffect(() => {
    if (!profile?.company_id) return;
    loadStats();
    loadAssociations();
    loadUsers();
  }, [profile]);

  // Statistici
  const loadStats = async () => {
    if (!profile?.company_id) return;

    const { count: requestsCount } = await supabase
      .from("requests")
      .select("*", { count: "exact", head: true })
      .eq("company_id", profile.company_id);

    const { count: associationsCount } = await supabase
      .from("associations")
      .select("*", { count: "exact", head: true })
      .eq("company_id", profile.company_id);

    const { count: usersCount } = await supabase
      .from("app_users")
      .select("*", { count: "exact", head: true })
      .eq("company_id", profile.company_id);

    const { data: company } = await supabase
      .from("companies")
      .select("request_limit")
      .eq("id", profile.company_id)
      .single();

    const usagePercent =
      company && requestsCount
        ? Math.min(Math.round((requestsCount / company.request_limit) * 100), 100)
        : 0;

    setStats({
      requests: requestsCount || 0,
      associations: associationsCount || 0,
      users: usersCount || 0,
      planUsage: usagePercent,
    });
  };

  // Asociații
  const loadAssociations = async () => {
    if (!profile?.company_id) return;
    const { data, error } = await supabase
      .from("associations")
      .select("id, name")
      .eq("company_id", profile.company_id);

    if (error) {
      console.error("❌ Eroare fetch associations:", error.message);
    }
    setAssociations(data || []);
  };

  const handleCreateAssociation = async () => {
    if (!newAssociation.name) return;
    await supabase.from("associations").insert({
      name: newAssociation.name,
      company_id: profile?.company_id,
    });
    setNewAssociation({ name: "", address: "" });
    loadAssociations();
  };

  const handleDeleteAssociation = async (id: string) => {
    await supabase.from("associations").delete().eq("id", id);
    loadAssociations();
  };

  // Utilizatori
  const loadUsers = async () => {
    if (!profile?.company_id) return;
    const { data, error } = await supabase
      .from("app_users")
      .select(`
        id,
        full_name,
        role,
        association_id,
        auth:auth.users(email)
      `)
      .eq("company_id", profile.company_id);

    if (error) {
      console.error("❌ Eroare fetch users:", error.message);
    }
    setUsers(data || []);
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.full_name) return;

    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: newUser.email,
        password: "Parola123!", // parolă temporară
        full_name: newUser.full_name,
        role: newUser.role,
        company_id: profile?.company_id,
        association_id: newUser.association_id || null,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setNewUser({ email: "", full_name: "", role: "client", association_id: "" });
      loadUsers();
    } else {
      alert("Eroare la creare user: " + data.error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    await supabase.from("app_users").delete().eq("id", id);
    loadUsers();
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-indigo-700">Admin Dashboard</h1>
          <p className="text-gray-500">
            Bine ai venit,{" "}
            <span className="font-semibold">{profile?.full_name}</span>
          </p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Statistici */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="p-6 bg-white shadow rounded-xl flex flex-col items-center">
          <FileText className="text-indigo-600 mb-2" size={28} />
          <p className="text-sm text-gray-500">Total Cereri</p>
          <p className="text-2xl font-bold">{stats.requests}</p>
        </div>
        <div className="p-6 bg-white shadow rounded-xl flex flex-col items-center">
          <Building2 className="text-green-600 mb-2" size={28} />
          <p className="text-sm text-gray-500">Asociații</p>
          <p className="text-2xl font-bold">{stats.associations}</p>
        </div>
        <div className="p-6 bg-white shadow rounded-xl flex flex-col items-center">
          <Users className="text-blue-600 mb-2" size={28} />
          <p className="text-sm text-gray-500">Utilizatori</p>
          <p className="text-2xl font-bold">{stats.users}</p>
        </div>
        <div className="p-6 bg-white shadow rounded-xl flex flex-col items-center">
          <Gauge className="text-purple-600 mb-2" size={28} />
          <p className="text-sm text-gray-500">Consum Plan</p>
          <p className="text-2xl font-bold">{stats.planUsage}%</p>
        </div>
      </div>

      {/* Asociații */}
      <div className="p-6 bg-white shadow rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4 text-green-700">
          Administrare Asociații
        </h2>

        {/* Formular creare */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Nume Asociație"
            value={newAssociation.name}
            onChange={(e) =>
              setNewAssociation({ ...newAssociation, name: e.target.value })
            }
            className="border p-2 rounded w-1/4"
          />
          <button
            onClick={handleCreateAssociation}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={16} /> Creează
          </button>
        </div>

        {/* Lista Asociații */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Nume</th>
              <th className="p-2 border">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {associations.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.name}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDeleteAssociation(a.id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Șterge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Utilizatori */}
      <div className="p-6 bg-white shadow rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-700">
          Administrare Utilizatori
        </h2>

        {/* Formular creare */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Nume complet"
            value={newUser.full_name}
            onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
            className="border p-2 rounded w-1/4"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="border p-2 rounded w-1/4"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="client">Client</option>
            <option value="technical">Technical</option>
            <option value="service">Service</option>
          </select>

          {/* Dacă e client → selectează asociație */}
          {newUser.role === "client" && (
            <select
              value={newUser.association_id}
              onChange={(e) =>
                setNewUser({ ...newUser, association_id: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="">Fără asociație</option>
              {associations.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleCreateUser}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={16} /> Creează
          </button>
        </div>

        {/* Lista utilizatori */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Nume</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Rol</th>
              <th className="p-2 border">Asociație</th>
              <th className="p-2 border">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.full_name}</td>
                <td className="p-2">{u.auth?.email || "-"}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">
                  {associations.find((a) => a.id === u.association_id)?.name ||
                    "-"}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Șterge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
