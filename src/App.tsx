import {
  BrowserRouter as Router,
  Routes,
  Route,
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

// 🔒 Componentă pentru protecția rutelor
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: string[];
}) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Se încarcă...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // 🟢 FIX: așteptăm profilul, nu dăm redirect instant
  if (!profile) {
    return <div className="p-8 text-center">Se încarcă profilul...</div>;
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function Layout() {
  return (
    <div className="flex">
      <main className="flex-1 bg-gray-50 min-h-screen">
        <Routes>
          {/* Prima pagină → FunnelPage */}
          <Route path="/" element={<FunnelPage />} />

          {/* LandingPage */}
          <Route path="/landing" element={<LandingPage />} />

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
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  );
}

export default App;
