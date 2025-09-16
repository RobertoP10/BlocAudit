import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

type Notification = {
  id: string;
  message: string;
  type: string;
  severity: string;
  created_at: string;
};

export default function NotificationsTab({ companyId }: { companyId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (!error && data) setNotifications(data);
    };

    fetchData();
  }, [companyId]);

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>Notifications</CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`p-2 rounded border ${
                  n.severity === "high"
                    ? "bg-red-100 border-red-400"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p>{n.message}</p>
                <small className="text-gray-500">
                  {new Date(n.created_at).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
