import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
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
const CosaSonoMicrogreens = lazy(() => import("./pages/CosaSonoMicrogreens"));
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

// Root layout component that wraps all routes
const RootLayout = () => (
  <>
    <ScrollToTop />
    <CartDrawer />
    <Suspense fallback={<PageLoading />}>
      <Outlet />
    </Suspense>
  </>
);

// Create data router with routes configuration
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/chi-siamo", element: <ChiSiamo /> },
      { path: "/cosa-sono-i-microgreens", element: <CosaSonoMicrogreens /> },
      { path: "/microgreens", element: <Microgreens /> },
      { path: "/microgreens-su-misura", element: <MicrogreensCustom /> },
      { path: "/microgreens/:slug", element: <ProductDetail /> },
      { path: "/blog", element: <Blog /> },
      { path: "/blog/:slug", element: <BlogArticle /> },
      { path: "/contatti", element: <Contatti /> },
      
      // Admin Routes
      { path: "/admin/login", element: <AdminLogin /> },
      { path: "/admin/email-confirmation", element: <AdminEmailConfirmation /> },
      { path: "/admin/reset-password", element: <AdminResetPassword /> },
      { path: "/admin", element: <AdminDashboard /> },
      { path: "/admin/homepage", element: <AdminHomepage /> },
      { path: "/admin/chi-siamo", element: <AdminChiSiamo /> },
      { path: "/admin/microgreens", element: <AdminMicrogreensPage /> },
      { path: "/admin/microgreens-su-misura", element: <AdminMicrogreensCustom /> },
      { path: "/admin/contatti", element: <AdminContatti /> },
      { path: "/admin/blog-overview", element: <AdminBlogOverview /> },
      { path: "/admin/products", element: <AdminProducts /> },
      { path: "/admin/products/:id", element: <AdminProductEdit /> },
      { path: "/admin/blog", element: <AdminBlog /> },
      { path: "/admin/blog/:id", element: <AdminBlogEdit /> },
      { path: "/admin/pages", element: <AdminPages /> },
      { path: "/admin/pages/:id", element: <AdminPageEdit /> },
      { path: "/admin/media", element: <AdminMedia /> },
      { path: "/admin/users", element: <AdminUsers /> },
      { path: "/admin/redirects", element: <AdminRedirects /> },
      { path: "/admin/settings", element: <AdminSettings /> },
      
      // Preview Routes (authenticated)
      { path: "/preview/homepage", element: <HomepagePreview /> },
      { path: "/preview/chi-siamo", element: <ChiSiamoPreview /> },
      { path: "/preview/microgreens", element: <MicrogreensPreview /> },
      { path: "/preview/microgreens-su-misura", element: <MicrogreensCustomPreview /> },
      { path: "/preview/contatti", element: <ContattiPreview /> },
      { path: "/preview/blog-overview", element: <BlogOverviewPreview /> },
      { path: "/preview/microgreens/:slug", element: <ProductPreview /> },
      { path: "/preview/blog/:slug", element: <BlogPreview /> },
      { path: "/preview/page/:slug", element: <PagePreview /> },
      
      // Catch-all route
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
