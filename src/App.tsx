import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TechnicalDashboard from "./pages/technical/TechnicalDashboard";
import ServiceDashboard from "./pages/service/ServiceDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

function Layout() {
  const location = useLocation();
  const authRoutes = ["/login", "/register"];

  // dacă suntem pe login sau register => fără sidebar
  const hideSidebar = authRoutes.includes(location.pathname);

  return (
    <div className="flex">
      {!hideSidebar && <Sidebar />}
      <main className="flex-1 bg-gray-50 p-6">
        <Routes>
          {/* Dashboard routes */}
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/technical" element={<TechnicalDashboard />} />
          <Route path="/service" element={<ServiceDashboard />} />
          <Route path="/client" element={<ClientDashboard />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
