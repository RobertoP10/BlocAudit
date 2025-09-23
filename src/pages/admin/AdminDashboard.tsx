import { useEffect, useState } from "react";
import jsPDF from "jspdf";   // ⬅️ adaugă import sus, lângă celelalte
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

import StatCard from "../../components/ui/StatCard";
import SectionCard from "../../components/ui/SectionCard";

interface Stats {
  requests: number;
  associations: number;
  users: number;
  planUsage: number;
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
  type: string;
  client_id: string;
  status: "open" | "closed";
  created_at: string;
}

export default function AdminDashboard() {
  const { signOut, profile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    requests: 0,
    associations: 0,
    users: 0,
    planUsage: 0,
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
  const [newForm, setNewForm] = useState({
    name: "",
    type: "",
    client_id: "",
  });

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

  // ---------------- STATISTICI ----------------
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
        ? Math.min(
            Math.round((requestsCount / company.request_limit) * 100),
            100
          )
        : 0;

    setStats({
      requests: requestsCount || 0,
      associations: associationsCount || 0,
      users: usersCount || 0,
      planUsage: usagePercent,
    });
  };

  // ---------------- ASOCIAȚII ----------------
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

  // ---------------- UTILIZATORI ----------------
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
      setNewUser({
        email: "",
        full_name: "",
        role: "client",
        association_id: "",
      });
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

  // ---------------- FORMULARE ----------------
  const loadForms = async () => {
    if (!profile?.company_id) return;
    const { data, error } = await supabase
      .from("forms")
      .select("id, name, type, client_id, status, created_at")
      .eq("company_id", profile.company_id);

    if (error) {
      console.error("❌ Eroare fetch forms:", error.message);
    }
    setForms(data || []);
  };

  const handleCreateForm = async () => {
    if (!newForm.name || !newForm.client_id) {
      return alert("⚠️ Nume și client sunt obligatorii");
    }

    const { error } = await supabase.from("forms").insert({
      name: newForm.name,
      type: newForm.type,
      client_id: newForm.client_id,
      status: "open",
      company_id: profile?.company_id,
    });

    if (error) {
      alert("❌ Eroare la creare formular: " + error.message);
    } else {
      setNewForm({ name: "", type: "", client_id: "" });
      loadForms();
    }
  };

  const handleCloseForm = async (id: string) => {
    await supabase.from("forms").update({ status: "closed" }).eq("id", id);
    loadForms();
  };

  const handleDeleteForm = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi acest formular?")) return;
    await supabase.from("forms").delete().eq("id", id);
    loadForms();
  };

  import jsPDF from "jspdf";   // ⬅️ adaugă import sus, lângă celelalte

...

  // ---------------- EXPORT ----------------
  const exportCSV = () => {
    if (forms.length === 0) {
      alert("⚠️ Nu există formulare de exportat.");
      return;
    }

    const header = ["Nume", "Tip", "Client", "Status", "Creat la"];
    const rows = forms.map((f) => {
      const client = users.find((c) => c.id === f.client_id);
      return [
        f.name,
        f.type || "-",
        client?.full_name || "-",
        f.status,
        new Date(f.created_at).toLocaleDateString("ro-RO"),
      ];
    });

    const csvContent =
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "formulare.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (forms.length === 0) {
      alert("⚠️ Nu există formulare de exportat.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Raport Formulare", 14, 20);

    let y = 30;
    forms.forEach((f, index) => {
      const client = users.find((c) => c.id === f.client_id);
      doc.text(
        `${index + 1}. ${f.name} | ${f.type || "-"} | ${
          client?.full_name || "-"
        } | ${f.status} | ${new Date(f.created_at).toLocaleDateString("ro-RO")}`,
        14,
        y
      );
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("formulare.pdf");
  };

  // ---------------- RENDER ----------------
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

          {/* Asociații */}
          <SectionCard title="Administrare Asociații" color="text-green-700">
            <div className="flex gap-4 mb-6 flex-wrap">
              <input
                type="text"
                placeholder="Nume Asociație"
                value={newAssociation.name}
                onChange={(e) =>
                  setNewAssociation({ ...newAssociation, name: e.target.value })
                }
                className="border p-2 rounded w-1/4 min-w-[200px]"
              />
              <input
                type="text"
                placeholder="Adresă"
                value={newAssociation.address}
                onChange={(e) =>
                  setNewAssociation({ ...newAssociation, address: e.target.value })
                }
                className="border p-2 rounded w-1/4 min-w-[200px]"
              />
              <input
                type="email"
                placeholder="Email"
                value={newAssociation.email}
                onChange={(e) =>
                  setNewAssociation({ ...newAssociation, email: e.target.value })
                }
                className="border p-2 rounded w-1/4 min-w-[200px]"
              />
              <input
                type="tel"
                placeholder="Telefon"
                value={newAssociation.phone}
                onChange={(e) =>
                  setNewAssociation({ ...newAssociation, phone: e.target.value })
                }
                className="border p-2 rounded w-1/4 min-w-[200px]"
              />
              <button
                onClick={handleCreateAssociation}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={16} /> Creează
              </button>
            </div>

            {associations.length === 0 ? (
              <p className="text-gray-500 italic">Nu există asociații încă.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-2 border">Nume</th>
                      <th className="p-2 border">Adresă</th>
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Telefon</th>
                      <th className="p-2 border">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {associations.map((a) => (
                      <tr key={a.id} className="border-t">
                        <td className="p-2">{a.name}</td>
                        <td className="p-2">{a.address || "-"}</td>
                        <td className="p-2">{a.email}</td>
                        <td className="p-2">{a.phone}</td>
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
            )}
          </SectionCard>

          {/* Utilizatori */}
          <SectionCard title="Administrare Utilizatori" color="text-blue-700">
            <div className="flex gap-4 mb-6 flex-wrap">
              <input
                type="text"
                placeholder="Nume complet"
                value={newUser.full_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, full_name: e.target.value })
                }
                className="border p-2 rounded w-1/4 min-w-[200px]"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="border p-2 rounded w-1/4 min-w-[200px]"
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="border p-2 rounded"
              >
                <option value="client">Client</option>
                <option value="technical">Technical</option>
                <option value="service">Service</option>
              </select>

              {newUser.role === "client" && (
                <select
                  value={newUser.association_id}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      association_id: e.target.value,
                    })
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

            {users.length === 0 ? (
              <p className="text-gray-500 italic">Nu există utilizatori încă.</p>
            ) : (
              <div className="overflow-x-auto">
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
                        <td className="p-2">{u.email}</td>
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
            )}
          </SectionCard>

          {/* Formulare */}
          <SectionCard title="Administrare Formulare" color="text-purple-700">
            <div className="flex gap-4 mb-6 flex-wrap">
              <input
                type="text"
                placeholder="Nume Formular"
                value={newForm.name}
                onChange={(e) =>
                  setNewForm({ ...newForm, name: e.target.value })
                }
                className="border p-2 rounded w-1/4 min-w-[200px]"
              />
              <input
                type="text"
                placeholder="Tip Formular"
                value={newForm.type}
                onChange={(e) =>
                  setNewForm({ ...newForm, type: e.target.value })
                }
                className="border p-2 rounded w-1/4 min-w-[200px]"
              />
              <select
                value={newForm.client_id}
                onChange={(e) =>
                  setNewForm({ ...newForm, client_id: e.target.value })
                }
                className="border p-2 rounded"
              >
                <option value="">Selectează Client</option>
                {users
                  .filter((u) => u.role === "client")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}
                    </option>
                  ))}
              </select>
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
                      <th className="p-2 border">Tip</th>
                      <th className="p-2 border">Client</th>
                      <th className="p-2 border">Status</th>
                      <th className="p-2 border">Creat la</th>
                      <th className="p-2 border">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forms.map((f) => {
                      const client = users.find((c) => c.id === f.client_id);
                      return (
                        <tr key={f.id} className="border-t">
                          <td className="p-2">{f.name}</td>
                          <td className="p-2">{f.type || "-"}</td>
                          <td className="p-2">{client?.full_name || "-"}</td>
                          <td className="p-2">
                            {f.status === "closed"
                              ? "Închis (read-only)"
                              : "Deschis"}
                          </td>
                          <td className="p-2">
                            {new Date(f.created_at).toLocaleDateString("ro-RO")}
                          </td>
                          <td className="p-2 flex gap-2">
                            {f.status === "open" ? (
                              <>
                                <button
                                  onClick={() => handleCloseForm(f.id)}
                                  className="text-orange-500 hover:text-orange-700"
                                >
                                  Închide
                                </button>
                                <button
                                  onClick={() => handleDeleteForm(f.id)}
                                  className="text-red-500 hover:text-red-700 flex items-center gap-1"
                                >
                                  <Trash2 size={16} /> Șterge
                                </button>
                              </>
                            ) : (
                              <span className="text-gray-400 italic">
                                Doar vizualizare
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Export Formulare */}
          <SectionCard title="Export Formulare" color="text-pink-700">
            <div className="flex gap-4">
              <button
                onClick={exportCSV}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
              >
                Export CSV
              </button>
              <button
                onClick={exportPDF}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                Export PDF
              </button>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
