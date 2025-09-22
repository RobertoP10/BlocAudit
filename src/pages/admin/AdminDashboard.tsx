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

  useEffect(() => {
    if (!profile?.company_id) return;
    loadDashboard();
  }, [profile]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadAssociations(), loadUsers()]);
    } catch (err) {
      console.error("❌ Eroare la încărcarea dashboardului:", err);
    } finally {
      setLoading(false);
    }
  };

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

  // Utilizatori
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
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: newUser.email,
          password: "Parola123!", // parola inițială dată de Admin
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
            {/* inputs pentru asociații */}
          </SectionCard>

          {/* Utilizatori */}
          <SectionCard title="Administrare Utilizatori" color="text-blue-700">
            {/* inputs pentru useri + tabel */}
          </SectionCard>
        </>
      )}
    </div>
  );
}
