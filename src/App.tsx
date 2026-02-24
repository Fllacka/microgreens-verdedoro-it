import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageLoading } from "@/components/ui/page-loading";
import { TooltipProvider } from "@/components/ui/tooltip";

// All pages lazy loaded to minimize initial JS bundle and improve FCP
const Index = lazy(() => import("./pages/Index"));
const Microgreens = lazy(() => import("./pages/Microgreens"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const ChiSiamo = lazy(() => import("./pages/ChiSiamo"));
const CosaSonoMicrogreens = lazy(() => import("./pages/CosaSonoMicrogreens"));
const MicrogreensCustom = lazy(() => import("./pages/MicrogreensCustom"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const Contatti = lazy(() => import("./pages/Contatti"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy-loaded non-critical UI
const CartDrawer = lazy(() => import("./components/CartDrawer").then(m => ({ default: m.CartDrawer })));
const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));


// Admin/Preview wrappers
const AdminRoutesWrapper = lazy(() => import("./components/AdminRoutesWrapper"));
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
    <Suspense fallback={null}>
      <TooltipProvider>
        <CartProvider>
          <Suspense fallback={null}>
            <Toaster />
            <Sonner />
          </Suspense>
          <RouterProvider router={router} />
        </CartProvider>
      </TooltipProvider>
    </Suspense>
  </QueryClientProvider>
);

export default App;
