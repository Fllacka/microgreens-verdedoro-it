import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartDrawer } from "@/components/CartDrawer";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import ChiSiamo from "./pages/ChiSiamo";
import Microgreens from "./pages/Microgreens";
import MicrogreensCustom from "./pages/MicrogreensCustom";
import ProductDetail from "./pages/ProductDetail";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import Contatti from "./pages/Contatti";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminProductEdit from "./pages/admin/ProductEdit";
import AdminBlog from "./pages/admin/Blog";
import AdminBlogEdit from "./pages/admin/BlogEdit";
import AdminRedirects from "./pages/admin/Redirects";
import AdminUsers from "./pages/admin/Users";
import AdminPages from "./pages/admin/Pages";
import AdminPageEdit from "./pages/admin/PageEdit";
import AdminMedia from "./pages/admin/Media";

const queryClient = new QueryClient();

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
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chi-siamo" element={<ChiSiamo />} />
              <Route path="/microgreens" element={<Microgreens />} />
              <Route path="/microgreens-su-misura" element={<MicrogreensCustom />} />
              <Route path="/prodotto/:id" element={<ProductDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogArticle />} />
              <Route path="/contatti" element={<Contatti />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/products/:id" element={<AdminProductEdit />} />
              <Route path="/admin/blog" element={<AdminBlog />} />
              <Route path="/admin/blog/:id" element={<AdminBlogEdit />} />
              <Route path="/admin/pages" element={<AdminPages />} />
              <Route path="/admin/pages/:id" element={<AdminPageEdit />} />
              <Route path="/admin/media" element={<AdminMedia />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/redirects" element={<AdminRedirects />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
