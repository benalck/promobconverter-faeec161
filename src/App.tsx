import React, { ReactNode, useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Plans from "@/pages/Plans";
import FAQ from "@/pages/FAQ";
import PaymentSuccess from "@/pages/PaymentSuccess";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoadingAnimation from "@/components/LoadingAnimation";
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
    return <Navigate to="/register" replace />;
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
        return <Navigate to="/register" replace />;
    }

    return <>{children}</>;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula um tempo de carregamento mínimo para garantir que
    // a animação seja visível mesmo em dispositivos rápidos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && <LoadingAnimation />}
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
            <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
