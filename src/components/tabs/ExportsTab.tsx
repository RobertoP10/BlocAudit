import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

type ExportRecord = {
  id: string;
  format: string;
  file_url: string;
  created_at: string;
};

export default function ExportsTab({ companyId }: { companyId: string }) {
  const [exportsList, setExportsList] = useState<ExportRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("exports")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (!error && data) setExportsList(data);
    };

    fetchData();
  }, [companyId]);

  // Într-un caz real, aici ai avea butoane care trimit request la backend/edge func
  const exportData = async (format: string) => {
    alert(`Trigger export to ${format} (to be implemented)`);

    // Exemplu de insert in exports (simulare)
    await supabase.from("exports").insert([
      {
        company_id: companyId,
        format,
        file_url: `/mock/${format}-${Date.now()}.csv`,
      },
    ]);

    const { data } = await supabase
      .from("exports")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (data) setExportsList(data);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Export buttons */}
      <Card>
        <CardHeader>Export Data</CardHeader>
        <CardContent className="flex space-x-2">
          <button
            onClick={() => exportData("csv")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Export CSV
          </button>
          <button
            onClick={() => exportData("excel")}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Export Excel
          </button>
          <button
            onClick={() => exportData("pdf")}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Export PDF
          </button>
        </CardContent>
      </Card>

      {/* Export history */}
      <Card>
        <CardHeader>Export History</CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {exportsList.map((e) => (
              <li key={e.id} className="p-2 border rounded bg-gray-50">
                <a href={e.file_url} className="text-blue-600 underline">
                  {e.format.toUpperCase()} export
                </a>{" "}
                – {new Date(e.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
