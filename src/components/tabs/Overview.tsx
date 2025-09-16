import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Usage = {
  company_id: string;
  requests_used: number;
  requests_limit: number;
  users_used: number;
  users_limit: number;
  subscription_plan: string;
};

export default function Overview({ companyId }: { companyId: string }) {
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      const { data, error } = await supabase.rpc("get_company_usage", {
        p_company_id: companyId,
      });
      if (!error && data && data.length > 0) {
        setUsage(data[0]);
      }
    };
    fetchUsage();
  }, [companyId]);

  if (!usage) return <p>Loading usage...</p>;

  const requestsPercent = Math.round(
    (usage.requests_used / usage.requests_limit) * 100
  );
  const usersPercent = Math.round(
    (usage.users_used / usage.users_limit) * 100
  );

  const userData = [
    { name: "Used", value: usage.users_used },
    { name: "Limit", value: usage.users_limit },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* KPI numeric + grafice */}
      <div className="grid grid-cols-2 gap-4">
        {/* Requests */}
        <Card>
          <CardHeader>Requests This Month</CardHeader>
          <CardContent>
            <Progress value={requestsPercent} className="w-full mb-2" />
            <p>
              {usage.requests_used} / {usage.requests_limit}
            </p>
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader>Users</CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={userData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
            <p>{usersPercent}% of limit</p>
          </CardContent>
        </Card>
      </div>

      {/* Abonament */}
      <Card>
        <CardHeader>Subscription Plan</CardHeader>
        <CardContent>
          <p className="capitalize">{usage.subscription_plan}</p>
        </CardContent>
      </Card>
    </div>
  );
}
