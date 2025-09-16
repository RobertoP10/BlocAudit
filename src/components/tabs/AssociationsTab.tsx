import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

type Association = {
  id: string;
  name: string;
  request_limit: number;
  user_limit: number;
  requests_used?: number;
  users_used?: number;
};

export default function AssociationsTab({ companyId }: { companyId: string }) {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [newAssoc, setNewAssoc] = useState({
    name: "",
    request_limit: 100,
    user_limit: 10,
  });

  // Fetch associations
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("associations")
        .select("*")
        .eq("company_id", companyId);

      if (!error && data) setAssociations(data);
    };
    fetchData();
  }, [companyId]);

  // Add new association
  const addAssociation = async () => {
    const { error } = await supabase.from("associations").insert([
      {
        company_id: companyId,
        name: newAssoc.name,
        request_limit: newAssoc.request_limit,
        user_limit: newAssoc.user_limit,
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setNewAssoc({ name: "", request_limit: 100, user_limit: 10 });
      const { data } = await supabase
        .from("associations")
        .select("*")
        .eq("company_id", companyId);
      if (data) setAssociations(data);
    }
  };

  // Update limits
  const updateLimits = async (id: string, request_limit: number, user_limit: number) => {
    const { error } = await supabase
      .from("associations")
      .update({ request_limit, user_limit })
      .eq("id", id);

    if (error) {
      alert("Error updating: " + error.message);
    } else {
      const { data } = await supabase
        .from("associations")
        .select("*")
        .eq("company_id", companyId);
      if (data) setAssociations(data);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* List Associations */}
      <Card>
        <CardHeader>Associations</CardHeader>
        <CardContent>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Requests Limit</th>
                <th className="p-2 text-left">Users Limit</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {associations.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{a.name}</td>
                  <td className="p-2">{a.request_limit}</td>
                  <td className="p-2">{a.user_limit}</td>
                  <td className="p-2">
                    <button
                      onClick={() =>
                        updateLimits(
                          a.id,
                          a.request_limit + 50,
                          a.user_limit + 5
                        )
                      }
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Add Limits
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Association */}
      <Card>
        <CardHeader>Add Association</CardHeader>
        <CardContent className="space-y-2">
          <input
            type="text"
            placeholder="Association Name"
            value={newAssoc.name}
            onChange={(e) => setNewAssoc({ ...newAssoc, name: e.target.value })}
            className="border p-2 w-full"
          />
          <input
            type="number"
            placeholder="Request Limit"
            value={newAssoc.request_limit}
            onChange={(e) =>
              setNewAssoc({ ...newAssoc, request_limit: Number(e.target.value) })
            }
            className="border p-2 w-full"
          />
          <input
            type="number"
            placeholder="User Limit"
            value={newAssoc.user_limit}
            onChange={(e) =>
              setNewAssoc({ ...newAssoc, user_limit: Number(e.target.value) })
            }
            className="border p-2 w-full"
          />
          <button
            onClick={addAssociation}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Association
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
