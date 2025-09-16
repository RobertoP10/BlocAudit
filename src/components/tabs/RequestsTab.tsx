import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

type Request = {
  id: string;
  description: string;
  status: string;
  created_at: string;
  association_id: string | null;
  assigned_to: string | null;
};

export default function RequestsTab({ companyId }: { companyId: string }) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [associationFilter, setAssociationFilter] = useState<string>("all");
  const [associations, setAssociations] = useState<any[]>([]);

  // Fetch requests + associations
  useEffect(() => {
    const fetchData = async () => {
      let query = supabase.from("requests").select("*").eq("company_id", companyId);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (associationFilter !== "all") {
        query = query.eq("association_id", associationFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data) setRequests(data);

      const { data: assocData } = await supabase
        .from("associations")
        .select("id, name")
        .eq("company_id", companyId);
      if (assocData) setAssociations(assocData);
    };

    fetchData();
  }, [companyId, statusFilter, associationFilter]);

  return (
    <div className="p-4 space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>Filters</CardHeader>
        <CardContent className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={associationFilter}
            onChange={(e) => setAssociationFilter(e.target.value)}
            className="border p-2"
          >
            <option value="all">All Associations</option>
            {associations.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>Requests</CardHeader>
        <CardContent>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Association</th>
                <th className="p-2 text-left">Assigned To</th>
                <th className="p-2 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.description}</td>
                  <td className="p-2 capitalize">{r.status}</td>
                  <td className="p-2">{r.association_id || "-"}</td>
                  <td className="p-2">{r.assigned_to || "-"}</td>
                  <td className="p-2">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
