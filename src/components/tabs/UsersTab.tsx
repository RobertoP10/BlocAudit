import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

type User = {
  id: string;
  full_name: string;
  role: string;
  association_id: string | null;
};

export default function UsersTab({ companyId }: { companyId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    full_name: "",
    role: "technical",
    association_id: "",
  });
  const [associations, setAssociations] = useState<any[]>([]);

  // Fetch users & associations
  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData } = await supabase
        .from("app_users")
        .select("*")
        .eq("company_id", companyId);

      const { data: assocData } = await supabase
        .from("associations")
        .select("id, name")
        .eq("company_id", companyId);

      if (usersData) setUsers(usersData);
      if (assocData) setAssociations(assocData);
    };

    fetchData();
  }, [companyId]);

  // Add user
  const addUser = async () => {
    const payload: any = {
      company_id: companyId,
      full_name: newUser.full_name,
      role: newUser.role,
    };
    if (newUser.role === "client") {
      payload.association_id = newUser.association_id;
    }

    const { error } = await supabase.from("app_users").insert([payload]);
    if (error) {
      alert("Error: " + error.message);
    } else {
      setNewUser({ full_name: "", role: "technical", association_id: "" });
      const { data: usersData } = await supabase
        .from("app_users")
        .select("*")
        .eq("company_id", companyId);
      if (usersData) setUsers(usersData);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* User List */}
      <Card>
        <CardHeader>Users</CardHeader>
        <CardContent>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Association</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.full_name}</td>
                  <td className="p-2 capitalize">{u.role}</td>
                  <td className="p-2">
                    {u.association_id || (u.role === "client" ? "Not set" : "-")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add User Form */}
      <Card>
        <CardHeader>Add User</CardHeader>
        <CardContent className="space-y-2">
          <input
            type="text"
            placeholder="Full Name"
            value={newUser.full_name}
            onChange={(e) =>
              setNewUser({ ...newUser, full_name: e.target.value })
            }
            className="border p-2 w-full"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="border p-2 w-full"
          >
            <option value="technical">Technical</option>
            <option value="service">Service</option>
            <option value="client">Client</option>
          </select>

          {newUser.role === "client" && (
            <select
              value={newUser.association_id}
              onChange={(e) =>
                setNewUser({ ...newUser, association_id: e.target.value })
              }
              className="border p-2 w-full"
            >
              <option value="">Select Association</option>
              {associations.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={addUser}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add User
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
