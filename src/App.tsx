
import React, { ReactNode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import AuthLogin from "@/pages/AuthLogin";
import AuthRegister from "@/pages/AuthRegister";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import "./App.css";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isInitialized } = useAuth();

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
};

interface AdminRouteProps {
    children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, isInitialized } = useAuth();

    if (!isInitialized) {
        return <div>Loading...</div>;
    }

    if (!user || !user.role || user.role !== 'admin') {
        window.location.href = '/login';
        return null;
    }

    return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/auth/register" element={<AuthRegister />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
