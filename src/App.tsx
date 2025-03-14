
import React, { ReactNode, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
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
  
  if (!isInitialized) {
    console.log("ProtectedRoute - Not initialized, showing loading");
    return <LoadingScreen />;
  }

  if (!user) {
    console.log("ProtectedRoute - Not authenticated, redirecting to /register");
    return <Navigate to="/register" replace />;
  }

  console.log("ProtectedRoute - Rendering protected content");
  return <>{children}</>;
};

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isInitialized } = useAuth();
  
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
    console.log("App mounted");
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
