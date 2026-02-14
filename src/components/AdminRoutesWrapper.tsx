import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageLoading } from "@/components/ui/page-loading";

const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminResetPassword = lazy(() => import("@/pages/admin/ResetPassword"));
const AdminEmailConfirmation = lazy(() => import("@/pages/admin/EmailConfirmation"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/Products"));
const AdminProductEdit = lazy(() => import("@/pages/admin/ProductEdit"));
const AdminBlog = lazy(() => import("@/pages/admin/Blog"));
const AdminBlogEdit = lazy(() => import("@/pages/admin/BlogEdit"));
const AdminRedirects = lazy(() => import("@/pages/admin/Redirects"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminPages = lazy(() => import("@/pages/admin/Pages"));
const AdminPageEdit = lazy(() => import("@/pages/admin/PageEdit"));
const AdminMedia = lazy(() => import("@/pages/admin/Media"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminHomepage = lazy(() => import("@/pages/admin/Homepage"));
const AdminChiSiamo = lazy(() => import("@/pages/admin/ChiSiamo"));
const AdminMicrogreensPage = lazy(() => import("@/pages/admin/Microgreens"));
const AdminMicrogreensCustom = lazy(() => import("@/pages/admin/MicrogreensCustom"));
const AdminContatti = lazy(() => import("@/pages/admin/Contatti"));
const AdminBlogOverview = lazy(() => import("@/pages/admin/BlogOverview"));
const AdminCosaSonoMicrogreens = lazy(() => import("@/pages/admin/CosaSonoMicrogreens"));

const AdminRoutesWrapper = () => (
  <AuthProvider>
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route path="email-confirmation" element={<AdminEmailConfirmation />} />
        <Route path="reset-password" element={<AdminResetPassword />} />
        <Route path="" element={<AdminDashboard />} />
        <Route path="homepage" element={<AdminHomepage />} />
        <Route path="chi-siamo" element={<AdminChiSiamo />} />
        <Route path="microgreens" element={<AdminMicrogreensPage />} />
        <Route path="microgreens-su-misura" element={<AdminMicrogreensCustom />} />
        <Route path="contatti" element={<AdminContatti />} />
        <Route path="blog-overview" element={<AdminBlogOverview />} />
        <Route path="cosa-sono-i-microgreens" element={<AdminCosaSonoMicrogreens />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/:id" element={<AdminProductEdit />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="blog/:id" element={<AdminBlogEdit />} />
        <Route path="pages" element={<AdminPages />} />
        <Route path="pages/:id" element={<AdminPageEdit />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="redirects" element={<AdminRedirects />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </Suspense>
  </AuthProvider>
);

export default AdminRoutesWrapper;
