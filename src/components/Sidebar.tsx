import { Link } from "react-router-dom";

export default function Sidebar() {
  const menuItems = [
    { label: "Super Admin", path: "/superadmin" },
    { label: "Admin", path: "/admin" },
    { label: "Technical", path: "/technical" },
    { label: "Service", path: "/service" },
    { label: "Client", path: "/client" },
  ];

  return (
    <aside className="w-60 bg-white shadow-md h-screen p-4">
      <h2 className="text-lg font-bold mb-6">BlocAudit</h2>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="block px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
