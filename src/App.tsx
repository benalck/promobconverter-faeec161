
import React, { ReactNode, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Plans from "@/pages/Plans";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import "./App.css";

// Simple loading component
const LoadingScreen = () => (
  <div className="h-screen w-full flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
  </div>
);

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isInitialized } = useAuth();
  
  console.log("ProtectedRoute - User:", user ? "Existe" : "Não existe");
  console.log("ProtectedRoute - isInitialized:", isInitialized);

  if (!isInitialized) {
    console.log("ProtectedRoute - Não inicializado, mostrando loading");
    return <LoadingScreen />;
  }

  if (!user) {
    console.log("ProtectedRoute - Não autenticado, redirecionando para /register");
    return <Navigate to="/register" replace />;
  }

  console.log("ProtectedRoute - Renderizando conteúdo protegido");
  return <>{children}</>;
};

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isInitialized } = useAuth();
  
  console.log("AdminRoute - User:", user ? "Existe" : "Não existe");
  console.log("AdminRoute - isAdmin:", user?.role === 'admin');

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!user || !user.role || user.role !== 'admin') {
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
};

function App() {
  useEffect(() => {
    console.log("App montado");
    return () => console.log("App desmontado");
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <div className="app-container">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Suspense>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
