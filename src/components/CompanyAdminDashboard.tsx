import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

// Importăm componentele pentru fiecare tab (le implementăm pe rând)
import Overview from "./tabs/Overview";
import UsersTab from "./tabs/UsersTab";
import AssociationsTab from "./tabs/AssociationsTab";
import RequestsTab from "./tabs/RequestsTab";
import NotificationsTab from "./tabs/NotificationsTab";
import ExportsTab from "./tabs/ExportsTab";

export default function CompanyAdminDashboard({ companyId }: { companyId: string }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "associations", label: "Associations" },
    { key: "requests", label: "Requests" },
    { key: "notifications", label: "Notifications" },
    { key: "exports", label: "Exports" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md ${
              activeTab === tab.key ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div>
        {activeTab === "overview" && <Overview companyId={companyId} />}
        {activeTab === "users" && <UsersTab companyId={companyId} />}
        {activeTab === "associations" && <AssociationsTab companyId={companyId} />}
        {activeTab === "requests" && <RequestsTab companyId={companyId} />}
        {activeTab === "notifications" && <NotificationsTab companyId={companyId} />}
        {activeTab === "exports" && <ExportsTab companyId={companyId} />}
      </div>
    </div>
  );
}
