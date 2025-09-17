import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TechnicalDashboard from "./pages/technical/TechnicalDashboard";
import ServiceDashboard from "./pages/service/ServiceDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/technical" element={<TechnicalDashboard />} />
        <Route path="/service" element={<ServiceDashboard />} />
        <Route path="/client" element={<ClientDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
