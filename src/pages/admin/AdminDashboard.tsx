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
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import StatCard from "../../components/ui/StatCard";
import SectionCard from "../../components/ui/SectionCard";

interface Stats {
  requests: number;
  associations: number;
  users: number;
  planUsage: number;
  userUsage: number;
  requestLimit: number;
  userLimit: number;
}

interface Association {
  id: string;
  name: string;
  address?: string;
  email: string;
  phone: string;
}

interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  association_id?: string;
}

interface Form {
  id: string;
  name: string;
  description: string;
  created_at: string;
  status: string; // "open" | "closed"
}

export default function AdminDashboard() {
  const { signOut, profile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    requests: 0,
    associations: 0,
    users: 0,
    planUsage: 0,
    userUsage: 0,
    requestLimit: 0,
    userLimit: 0,
  });

  const [associations, setAssociations] = useState<Association[]>([]);
  const [newAssociation, setNewAssociation] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });

  const [users, setUsers] = useState<AppUser[]>([]);
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    role: "client",
    association_id: "",
  });

  const [forms, setForms] = useState<Form[]>([]);
  const [newForm, setNewForm] = useState({ name: "", description: "" });

  useEffect(() => {
    if (!profile?.company_id) return;
    loadDashboard();
  }, [profile]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadAssociations(),
        loadUsers(),
        loadForms(),
      ]);
    } catch (err) {
      console.error("❌ Eroare la încărcarea dashboardului:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= STATS =================
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
      .select("request_limit, user_limit")
      .eq("id", profile.company_id)
      .single();

    const usageRequests =
      company && requestsCount
        ? Math.min(Math.round((requestsCount / company.request_limit) * 100), 100)
        : 0;
    const usageUsers =
      company && usersCount
        ? Math.min(Math.round((usersCount / company.user_limit) * 100), 100)
        : 0;

    setStats({
      requests: requestsCount || 0,
      associations: associationsCount || 0,
      users: usersCount || 0,
      planUsage: usageRequests,
      userUsage: usageUsers,
      requestLimit: company?.request_limit || 0,
      userLimit: company?.user_limit || 0,
    });
  };

  // ================= ASSOCIATIONS =================
  const loadAssociations = async () => {
    if (!profile?.company_id) return;
    const { data, error } = await supabase
      .from("associations")
      .select("id, name, address, email, phone, company_id")
      .eq("company_id", profile.company_id);

    if (error) {
      console.error("❌ Eroare fetch associations:", error.message);
    }
    setAssociations(data || []);
  };

  const handleCreateAssociation = async () => {
    if (!newAssociation.name || !newAssociation.email || !newAssociation.phone) {
      return alert("⚠️ Nume, email și telefon sunt obligatorii");
    }

    const { error } = await supabase.from("associations").insert({
      name: newAssociation.name,
      address: newAssociation.address,
      email: newAssociation.email,
      phone: newAssociation.phone,
      company_id: profile?.company_id,
    });

    if (error) {
      alert("❌ Eroare la creare asociație: " + error.message);
    } else {
      setNewAssociation({ name: "", address: "", email: "", phone: "" });
      loadAssociations();
    }
  };

  const handleDeleteAssociation = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi această asociație?")) return;
    await supabase.from("associations").delete().eq("id", id);
    loadAssociations();
  };

  // ================= USERS =================
  const loadUsers = async () => {
    if (!profile?.company_id) return;
    const { data, error } = await supabase
      .from("app_users")
      .select("id, full_name, role, association_id, email")
      .eq("company_id", profile.company_id);

    if (error) {
      console.error("❌ Eroare fetch users:", error.message);
    }
    setUsers(data || []);
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.full_name) {
      return alert("⚠️ Nume și email sunt obligatorii");
    }

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/create-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: newUser.email,
          password: "Parola123!",
          full_name: newUser.full_name,
          role: newUser.role,
          company_id: profile?.company_id,
          association_id: newUser.association_id || null,
        }),
      }
    );

    const data = await res.json();
    if (data.success) {
      alert("✅ User creat cu succes!");
      setNewUser({ email: "", full_name: "", role: "client", association_id: "" });
      loadUsers();
    } else {
      alert("❌ Eroare la creare user: " + data.error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi acest utilizator?")) return;
    await supabase.from("app_users").delete().eq("id", id);
    loadUsers();
  };

  // ================= FORMS =================
  const loadForms = async () => {
    if (!profile?.company_id) return;
    const { data, error } = await supabase
      .from("forms")
      .select("id, name, description, created_at, fields, status")
      .eq("company_id", profile.company_id);

    if (error) {
      console.error("❌ Eroare fetch forms:", error.message);
    }
    setForms(data || []);
  };

  const handleCreateForm = async () => {
    if (!newForm.name.trim()) return alert("⚠️ Numele formularului este obligatoriu");

    const { error } = await supabase.from("forms").insert({
      name: newForm.name,
      description: newForm.description,
      company_id: profile?.company_id,
      fields: JSON.stringify([
        { type: "textarea", label: "Descriere constatare" },
        { type: "signature", label: "Semnătura reprezentant firmă" },
        { type: "signature", label: "Semnătura client" },
      ]),
      status: "open",
    });

    if (error) {
      alert("❌ Eroare la creare formular: " + error.message);
    } else {
      setNewForm({ name: "", description: "" });
      loadForms();
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi acest formular?")) return;
    await supabase.from("forms").delete().eq("id", id);
    loadForms();
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

      {/* Loader */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      )}

      {!loading && (
        <>
          {/* Statistici */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <StatCard
              icon={<FileText className="text-indigo-600 mb-2" size={28} />}
              label="Total Cereri"
              value={stats.requests}
            />
            <StatCard
              icon={<Building2 className="text-green-600 mb-2" size={28} />}
              label="Asociații"
              value={stats.associations}
            />
            <StatCard
              icon={<Users className="text-blue-600 mb-2" size={28} />}
              label="Utilizatori"
              value={stats.users}
            />
            <StatCard
              icon={<Gauge className="text-purple-600 mb-2" size={28} />}
              label="Consum Plan"
              value={`${stats.planUsage}%`}
            />
          </div>

          {/* Grafic consum */}
          <SectionCard title="Grafic consum plan" color="text-indigo-700">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  {
                    name: "Cereri",
                    folosit: stats.requests,
                    limita: stats.requestLimit,
                  },
                  {
                    name: "Utilizatori",
                    folosit: stats.users,
                    limita: stats.userLimit,
                  },
                ]}
              >
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="folosit" stroke="#4f46e5" />
                <Line type="monotone" dataKey="limita" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* Asociații */}
          <SectionCard title="Administrare Asociații" color="text-green-700">
            {/* cod ca înainte */}
          </SectionCard>

          {/* Utilizatori */}
          <SectionCard title="Administrare Utilizatori" color="text-blue-700">
            {/* cod ca înainte */}
          </SectionCard>

          {/* Formulare */}
          <SectionCard title="Administrare Formulare" color="text-purple-700">
            <div className="flex gap-4 mb-6 flex-wrap">
              <input
                type="text"
                placeholder="Nume formular"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                className="border p-2 rounded w-1/4 min-w-[200px]"
              />
              <input
                type="text"
                placeholder="Descriere"
                value={newForm.description}
                onChange={(e) =>
                  setNewForm({ ...newForm, description: e.target.value })
                }
                className="border p-2 rounded w-1/2 min-w-[200px]"
              />
              <button
                onClick={handleCreateForm}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={16} /> Creează
              </button>
            </div>

            {forms.length === 0 ? (
              <p className="text-gray-500 italic">Nu există formulare încă.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-2 border">Nume</th>
                      <th className="p-2 border">Descriere</th>
                      <th className="p-2 border">Status</th>
                      <th className="p-2 border">Creat la</th>
                      <th className="p-2 border">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forms.map((f) => (
                      <tr key={f.id} className="border-t">
                        <td className="p-2">{f.name}</td>
                        <td className="p-2">{f.description || "-"}</td>
                        <td className="p-2">
                          {f.status === "closed"
                            ? "Închis (read-only)"
                            : "Deschis"}
                        </td>
                        <td className="p-2">
                          {new Date(f.created_at).toLocaleDateString("ro-RO")}
                        </td>
                        <td className="p-2">
                          {f.status === "open" ? (
                            <button
                              onClick={() => handleDeleteForm(f.id)}
                              className="text-red-500 hover:text-red-700 flex items-center gap-1"
                            >
                              <Trash2 size={16} /> Șterge
                            </button>
                          ) : (
                            <span className="text-gray-400 italic">
                              Doar vizualizare
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
