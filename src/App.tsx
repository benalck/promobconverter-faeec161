import React, { ReactNode, useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import LoadingAnimation from "@/components/LoadingAnimation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import "./App.css";

// Lazy loading dos componentes
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const Admin = lazy(() => import("@/pages/Admin"));
const Dashboard = lazy(() => import("@/pages/DashboardPage"));
const UserDashboard = lazy(() => import("@/pages/UserDashboard"));
const HistoryPage = lazy(() => import("@/pages/HistoryPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Index = lazy(() => import("@/pages/Index"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPassword"));

// Componente de fallback para Suspense
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
    <div className="animate-pulse text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-200"></div>
      <p className="text-blue-700">Carregando página...</p>
    </div>
  </div>
);

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isInitialized } = useAuth();

  if (!isInitialized) {
    return <PageLoadingFallback />;
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
    return <PageLoadingFallback />;
  }

  if (!user || (user.role !== 'admin' && user.role !== 'ceo')) {
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const preloadMainResources = async () => {
      try {
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
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Rotas para verificação de email */}
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
    </>
  );
}

export default App;