import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartDrawer } from "@/components/CartDrawer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageLoading } from "@/components/ui/page-loading";

// Critical pages - loaded immediately
import Index from "./pages/Index";
import Microgreens from "./pages/Microgreens";
import ProductDetail from "./pages/ProductDetail";

// Non-critical pages - lazy loaded
const ChiSiamo = lazy(() => import("./pages/ChiSiamo"));
const MicrogreensCustom = lazy(() => import("./pages/MicrogreensCustom"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const Contatti = lazy(() => import("./pages/Contatti"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages - lazy loaded (rarely accessed)
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminResetPassword = lazy(() => import("./pages/admin/ResetPassword"));
const AdminEmailConfirmation = lazy(() => import("./pages/admin/EmailConfirmation"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminProductEdit = lazy(() => import("./pages/admin/ProductEdit"));
const AdminBlog = lazy(() => import("./pages/admin/Blog"));
const AdminBlogEdit = lazy(() => import("./pages/admin/BlogEdit"));
const AdminRedirects = lazy(() => import("./pages/admin/Redirects"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminPages = lazy(() => import("./pages/admin/Pages"));
const AdminPageEdit = lazy(() => import("./pages/admin/PageEdit"));
const AdminMedia = lazy(() => import("./pages/admin/Media"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminHomepage = lazy(() => import("./pages/admin/Homepage"));
const AdminChiSiamo = lazy(() => import("./pages/admin/ChiSiamo"));
const AdminMicrogreensPage = lazy(() => import("./pages/admin/Microgreens"));
const AdminMicrogreensCustom = lazy(() => import("./pages/admin/MicrogreensCustom"));
const AdminContatti = lazy(() => import("./pages/admin/Contatti"));
const AdminBlogOverview = lazy(() => import("./pages/admin/BlogOverview"));

// Preview pages - lazy loaded
const ProductPreview = lazy(() => import("./pages/preview/ProductPreview"));
const BlogPreview = lazy(() => import("./pages/preview/BlogPreview"));
const PagePreview = lazy(() => import("./pages/preview/PagePreview"));
const HomepagePreview = lazy(() => import("./pages/preview/HomepagePreview"));
const ChiSiamoPreview = lazy(() => import("./pages/preview/ChiSiamoPreview"));
const MicrogreensPreview = lazy(() => import("./pages/preview/MicrogreensPreview"));
const MicrogreensCustomPreview = lazy(() => import("./pages/preview/MicrogreensCustomPreview"));
const ContattiPreview = lazy(() => import("./pages/preview/ContattiPreview"));
const BlogOverviewPreview = lazy(() => import("./pages/preview/BlogOverviewPreview"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <CartDrawer />
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/chi-siamo" element={<ChiSiamo />} />
                <Route path="/microgreens" element={<Microgreens />} />
                <Route path="/microgreens-su-misura" element={<MicrogreensCustom />} />
                <Route path="/microgreens/:slug" element={<ProductDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogArticle />} />
                <Route path="/contatti" element={<Contatti />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/email-confirmation" element={<AdminEmailConfirmation />} />
                <Route path="/admin/reset-password" element={<AdminResetPassword />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/homepage" element={<AdminHomepage />} />
                <Route path="/admin/chi-siamo" element={<AdminChiSiamo />} />
                <Route path="/admin/microgreens" element={<AdminMicrogreensPage />} />
                <Route path="/admin/microgreens-su-misura" element={<AdminMicrogreensCustom />} />
                <Route path="/admin/contatti" element={<AdminContatti />} />
                <Route path="/admin/blog-overview" element={<AdminBlogOverview />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/:id" element={<AdminProductEdit />} />
                <Route path="/admin/blog" element={<AdminBlog />} />
                <Route path="/admin/blog/:id" element={<AdminBlogEdit />} />
                <Route path="/admin/pages" element={<AdminPages />} />
                <Route path="/admin/pages/:id" element={<AdminPageEdit />} />
                <Route path="/admin/media" element={<AdminMedia />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/redirects" element={<AdminRedirects />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                
                {/* Preview Routes (authenticated) */}
                <Route path="/preview/homepage" element={<HomepagePreview />} />
                <Route path="/preview/chi-siamo" element={<ChiSiamoPreview />} />
                <Route path="/preview/microgreens" element={<MicrogreensPreview />} />
                <Route path="/preview/microgreens-su-misura" element={<MicrogreensCustomPreview />} />
                <Route path="/preview/contatti" element={<ContattiPreview />} />
                <Route path="/preview/blog-overview" element={<BlogOverviewPreview />} />
                <Route path="/preview/microgreens/:slug" element={<ProductPreview />} />
                <Route path="/preview/blog/:slug" element={<BlogPreview />} />
                <Route path="/preview/page/:slug" element={<PagePreview />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
