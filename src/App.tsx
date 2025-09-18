import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";

// Dashboards
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TechnicalDashboard from "./pages/technical/TechnicalDashboard";
import ServiceDashboard from "./pages/service/ServiceDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Pages
import LandingPage from "./pages/LandingPage";
import FunnelPage from "./pages/FunnelPage";

// Legal
import GDPR from "./pages/legal/GDPR";
import Terms from "./pages/legal/Terms";
import Contact from "./pages/legal/Contact";

function Layout() {
  const location = useLocation();

  // rute unde nu vrem Sidebar
  const noSidebarRoutes = [
    "/",           // Funnel
    "/landing",    // LandingPage
    "/login",
    "/register",
    "/gdpr",
    "/terms",
    "/contact",
  ];

  const hideSidebar = noSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex">
      {!hideSidebar && <Sidebar />}
      <main className="flex-1 bg-gray-50 min-h-screen">
        <Routes>
          {/* Prima pagină → FunnelPage */}
          <Route path="/" element={<FunnelPage />} />

          {/* LandingPage */}
          <Route path="/landing" element={<LandingPage />} />

          {/* Dashboards */}
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/technical" element={<TechnicalDashboard />} />
          <Route path="/service" element={<ServiceDashboard />} />
          <Route path="/client" element={<ClientDashboard />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Legal */}
          <Route path="/gdpr" element={<GDPR />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
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
