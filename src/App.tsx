import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CartDrawer from "./components/shop/CartDrawer";
import ScrollToTop from "./components/ScrollToTop";
// Public pages
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import GuidedChoice from "./pages/GuidedChoice";
import Questionnaire from "./pages/Questionnaire";
import Prescribers from "./pages/Prescribers";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import ProductPage from "./pages/Product";

// Admin pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminCustomers from "./pages/admin/Customers";
import AdminPages from "./pages/admin/Pages";
import AdminMedia from "./pages/admin/Media";
import AdminSettings from "./pages/admin/Settings";
import AdminPrescribers from "./pages/admin/Prescribers";
import AdminCommissions from "./pages/admin/Commissions";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CartDrawer />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/boutique" element={<Shop />} />
              <Route path="/aide-au-choix" element={<GuidedChoice />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/prescripteurs" element={<Prescribers />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/connexion" element={<LoginPage />} />
              <Route path="/inscription" element={<RegisterPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/mon-compte" element={<Account />} />
              <Route path="/produit/:slug" element={<ProductPage />} />

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="produits" element={<AdminProducts />} />
                <Route path="commandes" element={<AdminOrders />} />
                <Route path="abonnements" element={<AdminSubscriptions />} />
                <Route path="clients" element={<AdminCustomers />} />
                <Route path="prescripteurs" element={<AdminPrescribers />} />
                <Route path="commissions" element={<AdminCommissions />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="medias" element={<AdminMedia />} />
                <Route path="parametres" element={<AdminSettings />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
