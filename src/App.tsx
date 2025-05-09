
import React, { ReactNode, useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import LoadingAnimation from "@/components/LoadingAnimation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./App.css";

// Lazy loading dos componentes
const Register = lazy(() => import("@/pages/Register"));
const Login = lazy(() => import("@/pages/Login"));
const Home = lazy(() => import("@/pages/Home"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Admin = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const DehashAdmin = lazy(() => import("@/pages/DehashAdmin"));
const DehashLogin = lazy(() => import("@/pages/DehashLogin"));

// Componente de fallback para Suspense
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
    <div className="animate-pulse text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-200 dark:bg-blue-700"></div>
      <p className="text-blue-700 dark:text-blue-300">Carregando página...</p>
    </div>
  </div>
);

interface ProtectedRouteProps {
  children: ReactNode;
  allowUnverified?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowUnverified = false }) => {
  const { user, isInitialized } = useAuth();

  if (!isInitialized) {
    return <PageLoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isInitialized } = useAuth();

  if (!isInitialized) {
    return <PageLoadingFallback />;
  }

  if (!user || !user.role || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Precarregar os recursos mais importantes
    const preloadMainResources = async () => {
      try {
        // Simular pré-carregamento de recursos essenciais
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsLoading(false);
      } catch (error) {
        console.error("Erro no pré-carregamento:", error);
        setIsLoading(false);
      }
    };

    preloadMainResources();
  }, []);

  return (
    <>
      {isLoading && <LoadingAnimation />}
      <ThemeProvider defaultTheme="light">
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                <Route path="/dehash-login" element={<DehashLogin />} />
                <Route path="/dehash-admin" element={<DehashAdmin />} />
                
                {/* Rotas para verificação de email - consolidadas */}
                <Route path="/verify" element={<VerifyEmail />} />
                <Route path="/auth/confirm" element={<VerifyEmail />} />
                <Route path="/register/verify" element={<VerifyEmail />} />
                <Route path="/register/confirm" element={<VerifyEmail />} />
                <Route path="/register/auth/confirm" element={<VerifyEmail />} />
                <Route path="/register/access/*" element={<VerifyEmail />} />
                <Route path="/register/access" element={<VerifyEmail />} />
                <Route path="/access/*" element={<VerifyEmail />} />
                <Route path="/verify-email/*" element={<VerifyEmail />} />
                <Route path="/verify-redirect/*" element={<VerifyEmail />} />
                <Route path="/#access_token=*" element={<VerifyEmail />} />
                <Route path="/*access_token=*" element={<VerifyEmail />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
