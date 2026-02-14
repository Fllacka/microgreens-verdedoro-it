import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
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

// Lazy-loaded CartDrawer - defers Sheet/ScrollArea/Separator UI imports
const CartDrawer = lazy(() => import("./components/CartDrawer").then(m => ({ default: m.CartDrawer })));

// Admin routes wrapper - lazy loaded, includes AuthProvider
const AdminRoutesWrapper = lazy(() => import("./components/AdminRoutesWrapper"));

// Preview routes wrapper - lazy loaded, includes AuthProvider
const PreviewRoutesWrapper = lazy(() => import("./components/PreviewRoutesWrapper"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

// Public layout - no AuthProvider needed
const PublicLayout = () => (
  <>
    <ScrollToTop />
    <Suspense fallback={null}>
      <CartDrawer />
    </Suspense>
    <Suspense fallback={<PageLoading />}>
      <Outlet />
    </Suspense>
  </>
);

// Admin/Preview layout - no cart needed
const AuthLayout = () => (
  <>
    <ScrollToTop />
    <Suspense fallback={<PageLoading />}>
      <Outlet />
    </Suspense>
  </>
);

// Create data router with routes configuration
const router = createBrowserRouter([
  {
    element: <PublicLayout />,
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
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      // Admin Routes - AuthProvider loaded inside AdminRoutesWrapper
      { path: "/admin/*", element: <AdminRoutesWrapper /> },
      // Preview Routes - AuthProvider loaded inside PreviewRoutesWrapper
      { path: "/preview/*", element: <PreviewRoutesWrapper /> },
    ],
  },
  // Catch-all route
  { path: "*", element: <NotFound /> },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
