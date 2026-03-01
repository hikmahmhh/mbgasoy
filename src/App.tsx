import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { OrgProvider } from "@/hooks/useOrg";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import MenuPage from "./pages/MenuPage";
import InventoryPage from "./pages/InventoryPage";
import DistributionPage from "./pages/DistributionPage";
import ReportsPage from "./pages/ReportsPage";
import SchoolsPage from "./pages/SchoolsPage";
import SettingsPage from "./pages/SettingsPage";
import SuperAdminPage from "./pages/SuperAdminPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) return <Navigate to="/" replace />;

  return (
    <OrgProvider>
      <AppLayout>
        <Routes>
          <Route path="/dashboard" element={<Index />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/distribution" element={<DistributionPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/schools" element={<SchoolsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/super-admin" element={<SuperAdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </OrgProvider>
  );
}

function LandingRoute() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

function AuthRoute() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;
  return <AuthPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingRoute />} />
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
