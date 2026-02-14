import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageLoading } from "@/components/ui/page-loading";

const ProductPreview = lazy(() => import("@/pages/preview/ProductPreview"));
const BlogPreview = lazy(() => import("@/pages/preview/BlogPreview"));
const PagePreview = lazy(() => import("@/pages/preview/PagePreview"));
const HomepagePreview = lazy(() => import("@/pages/preview/HomepagePreview"));
const ChiSiamoPreview = lazy(() => import("@/pages/preview/ChiSiamoPreview"));
const MicrogreensPreview = lazy(() => import("@/pages/preview/MicrogreensPreview"));
const MicrogreensCustomPreview = lazy(() => import("@/pages/preview/MicrogreensCustomPreview"));
const ContattiPreview = lazy(() => import("@/pages/preview/ContattiPreview"));
const CosaSonoMicrogreensPreview = lazy(() => import("@/pages/preview/CosaSonoMicrogreensPreview"));
const BlogOverviewPreview = lazy(() => import("@/pages/preview/BlogOverviewPreview"));

const PreviewRoutesWrapper = () => (
  <AuthProvider>
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="homepage" element={<HomepagePreview />} />
        <Route path="chi-siamo" element={<ChiSiamoPreview />} />
        <Route path="microgreens" element={<MicrogreensPreview />} />
        <Route path="microgreens-su-misura" element={<MicrogreensCustomPreview />} />
        <Route path="contatti" element={<ContattiPreview />} />
        <Route path="blog-overview" element={<BlogOverviewPreview />} />
        <Route path="cosa-sono-i-microgreens" element={<CosaSonoMicrogreensPreview />} />
        <Route path="microgreens/:slug" element={<ProductPreview />} />
        <Route path="blog/:slug" element={<BlogPreview />} />
        <Route path="page/:slug" element={<PagePreview />} />
      </Routes>
    </Suspense>
  </AuthProvider>
);

export default PreviewRoutesWrapper;
