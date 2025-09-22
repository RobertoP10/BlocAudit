import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ReactNode } from "react";

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

// Context
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components
import Sidebar from "./components/Sidebar";

// 🔒 ProtectedRoute corectat
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: string[];
}) {
  const { user, profile, loading } = useAuth();

  // așteptăm sesiunea
  if (loading) return <div className="p-8 text-center">Se încarcă...</div>;

  // dacă nu există user → mergem la Funnel
  if (!user) return <Navigate to="/" replace />;

  // dacă userul există dar nu are rolul potrivit → tot la Funnel
  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  // altfel → afișăm dashboard-ul
  return <>{children}</>;
}

function Layout() {
  const location = useLocation();

  // rute unde nu vrem Sidebar
  const noSidebarRoutes = [
    "/", // Funnel
    "/landing",
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
          {/* Public */}
          <Route path="/" element={<FunnelPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/gdpr" element={<GDPR />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />

          {/* Dashboards protejate */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technical"
            element={
              <ProtectedRoute allowedRoles={["technical"]}>
                <TechnicalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service"
            element={
              <ProtectedRoute allowedRoles={["service"]}>
                <ServiceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          {/* fallback → duce spre Funnel */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  );
}

export default App;
