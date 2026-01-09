import { Toaster } from "@/components/ui/toaster";
import OrderDetail from "./pages/OrderDetail";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CartDrawer from "./components/shop/CartDrawer";
import ScrollToTop from "./components/ScrollToTop";
import CookieConsent from "./components/CookieConsent";
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
import Onboarding from "./pages/Onboarding";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import ProductPage from "./pages/Product";
import LegalNotice from "./pages/LegalNotice";
import TermsOfSale from "./pages/TermsOfSale";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Brands from "./pages/Brands";
import Contact from "./pages/Contact";
import Guides from "./pages/Guides";
import GuideArticle from "./pages/GuideArticle";
import FAQ from "./pages/FAQ";
import OrderConfirmed from "./pages/OrderConfirmed";
import OrderPreparation from "./pages/OrderPreparation";
import EmailPreview from "./pages/admin/EmailPreview";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminCustomers from "./pages/admin/Customers";
import AdminPages from "./pages/admin/Pages";
import AdminMedia from "./pages/admin/Media";
import AdminHeroMedia from "./pages/admin/HeroMedia";
import AdminSettings from "./pages/admin/Settings";
import AdminPrescribers from "./pages/admin/Prescribers";
import AdminCommissions from "./pages/admin/Commissions";
import AdminPrescriberApplications from "./pages/admin/PrescriberApplications";
import AdminGuides from "./pages/admin/Guides";
import AdminCategories from "./pages/admin/Categories";
import AdminReviews from "./pages/admin/Reviews";
import AdminPreparations from "./pages/admin/Preparations";
import AdminSuppliers from "./pages/admin/Suppliers";
import AdminReorders from "./pages/admin/Reorders";
import AdminPreparationAnalytics from "./pages/admin/PreparationAnalytics";
const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CartDrawer />
            <CookieConsent />
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
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/mon-compte" element={<Account />} />
              <Route path="/mon-compte/commande/:id" element={<OrderDetail />} />
              <Route path="/produit/:slug" element={<ProductPage />} />
              <Route path="/mentions-legales" element={<LegalNotice />} />
              <Route path="/cgv" element={<TermsOfSale />} />
              <Route path="/cgu" element={<TermsOfUse />} />
              <Route path="/confidentialite" element={<PrivacyPolicy />} />
              <Route path="/marques" element={<Brands />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/guides/:slug" element={<GuideArticle />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/commande-confirmee" element={<OrderConfirmed />} />
              <Route path="/commande-preparation/:orderId" element={<OrderPreparation />} />
              <Route path="/compte" element={<Account />} />
              

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
                <Route path="candidatures" element={<AdminPrescriberApplications />} />
                <Route path="commissions" element={<AdminCommissions />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="guides" element={<AdminGuides />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="avis" element={<AdminReviews />} />
                <Route path="preparations" element={<AdminPreparations />} />
              <Route path="analytics-preparations" element={<AdminPreparationAnalytics />} />
              <Route path="fournisseurs" element={<AdminSuppliers />} />
              <Route path="reassort" element={<AdminReorders />} />
              <Route path="medias" element={<AdminMedia />} />
              <Route path="hero-media" element={<AdminHeroMedia />} />
              <Route path="emails" element={<EmailPreview />} />
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
