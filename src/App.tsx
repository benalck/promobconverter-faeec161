
import { ReactNode, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AppLayout from "./components/AppLayout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreditPurchase from "./pages/CreditPurchase";
import AdminRedirect from "./components/AdminRedirect";

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  if (!isAdmin) {
    window.location.href = "/";
    return null;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<p>Carregando...</p>}>
          <RouterProvider router={router} />
          <Toaster />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout><Outlet /></AppLayout>,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Index /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "admin", element: <AdminRoute><Admin /></AdminRoute> },
      { path: "adminaccess", element: <AdminRedirect /> },
      { path: "creditos", element: <CreditPurchase /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default App;
