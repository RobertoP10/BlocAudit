import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TechnicalDashboard from "./pages/technical/TechnicalDashboard";
import ServiceDashboard from "./pages/service/ServiceDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";

function App() {
  return (
    <Router>
      <div className="flex">
        {/* Sidebar fix */}
        <Sidebar />

        {/* Conținut pagină */}
        <main className="flex-1 bg-gray-50 p-6">
          <Routes>
            <Route path="/superadmin" element={<SuperAdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/technical" element={<TechnicalDashboard />} />
            <Route path="/service" element={<ServiceDashboard />} />
            <Route path="/client" element={<ClientDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
