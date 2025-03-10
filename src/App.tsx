import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import DehashLogin from "@/pages/DehashLogin";
import DehashAdmin from "@/pages/DehashAdmin";
import ConverterForm from "@/components/ConverterForm";
import Navbar from "@/components/Navbar";
import BannedMessage from "@/components/BannedMessage";
import BanCheck from "@/components/BanCheck";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.isBanned) {
    return <BannedMessage />;
  }
  
  return (
    <BanCheck>
      <Navbar />
      {children}
    </BanCheck>
  );
}

function DehashAdminRoute({ children }: { children: React.ReactNode }) {
  const adminToken = localStorage.getItem("adminToken");
  
  if (!adminToken) {
    return <Navigate to="/dehash-login" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return <div>Carregando...</div>;
  }

  if (isAuthenticated && !user?.isBanned) {
    return <Navigate to="/converter" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return <div>Carregando...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/registro"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/converter"
        element={
          <PrivateRoute>
            <div className="container mx-auto py-8">
              <ConverterForm />
            </div>
          </PrivateRoute>
        }
      />
      <Route
        path="/dehash-login"
        element={<DehashLogin />}
      />
      <Route
        path="/dehash-admin"
        element={
          <DehashAdminRoute>
            <DehashAdmin />
          </DehashAdminRoute>
        }
      />
      <Route
        path="/"
        element={<Navigate to="/converter" replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
