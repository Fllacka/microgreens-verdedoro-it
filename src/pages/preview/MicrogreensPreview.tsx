import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { Leaf, Star } from "lucide-react";
import varietiesImage from "@/assets/microgreens-varieties.jpg";
import chefImage from "@/assets/chef-microgreens.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  benefits: string[];
  uses: string[];
  rating: number;
  popular: boolean;
  media?: {
    file_path: string;
  };
}

interface SectionContent {
  [key: string]: any;
}

interface Section {
  id: string;
  content: SectionContent;
  is_visible: boolean;
}

const MicrogreensPreview = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, userRole } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (userRole !== "admin" && userRole !== "editor")) {
      navigate("/admin/login");
      return;
    }
    fetchData();
  }, [user, userRole, navigate]);

  const fetchData = async () => {
    try {
      const [productsRes, sectionsRes] = await Promise.all([
        supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            description,
            category,
            benefits,
            uses,
            rating,
            popular,
            media:media!products_image_id_fkey (
              file_path
            )
          `)
          .eq("published", true)
          .order("popular", { ascending: false })
          .order("name"),
        supabase
          .from("microgreens_sections")
          .select("*")
          .order("sort_order"),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (sectionsRes.error) throw sectionsRes.error;

      if (productsRes.data) setProducts(productsRes.data as any);

      const sectionsMap: Record<string, Section> = {};
      sectionsRes.data?.forEach((section) => {
        sectionsMap[section.id] = section as Section;
      });
      setSections(sectionsMap);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  };

  const seoSection = sections["seo"];
  const heroSection = sections["hero"];
  const infoSection = sections["info"];

  const currentUrl = window.location.origin + "/microgreens";
  const canonicalUrl = seoSection?.content?.canonical_url
    ? `${window.location.origin}${seoSection.content.canonical_url}`
    : currentUrl;

  return (
    <Layout>
      <Helmet>
        <title>{seoSection?.content?.meta_title || "I Nostri Microgreens - Verde D'Oro"}</title>
        <meta
          name="description"
          content={seoSection?.content?.meta_description || "Scopri la nostra selezione di microgreens biologici."}
        />
        <meta name="robots" content={seoSection?.content?.robots || "index, follow"} />
        <link rel="canonical" href={canonicalUrl} />
        {seoSection?.content?.og_title && (
          <meta property="og:title" content={seoSection.content.og_title} />
        )}
        {seoSection?.content?.og_description && (
          <meta property="og:description" content={seoSection.content.og_description} />
        )}
      </Helmet>

      {/* Preview Banner */}
      <div className="bg-yellow-500 text-black text-center py-2 px-4 font-semibold">
        Modalità Anteprima - Le modifiche non sono ancora pubblicate
      </div>

      {/* Hero Section */}
      {heroSection?.is_visible !== false && (
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width text-center">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary mb-6">
              {heroSection?.content?.title || "I Nostri Microgreens"}
            </h1>
            <p className="font-body text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
              {heroSection?.content?.subtitle ||
                "Scopri la nostra selezione di microgreens coltivati con passione nel cuore dell'Emilia-Romagna."}
            </p>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="section-padding bg-background">
        <div className="container-width">
          {loading ? (
            <p className="text-center">Caricamento prodotti...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  category={product.category}
                  description={product.description}
                  benefits={product.benefits}
                  uses={product.uses}
                  image={product.media?.file_path || chefImage}
                  rating={product.rating}
                  popular={product.popular}
                  onCardClick={() => navigate(`/prodotto/${product.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      {infoSection?.is_visible !== false && (
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-4xl font-bold text-primary mb-6">
                  {infoSection?.content?.title || "Perché i Nostri Microgreens Sono Speciali"}
                </h2>
                <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-verde-primary flex-shrink-0 mt-1">
                      <Leaf className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-2">
                        {infoSection?.content?.feature1_title || "Coltivazione Biologica"}
                      </h3>
                      <p className="text-muted-foreground">
                        {infoSection?.content?.feature1_description ||
                          "Utilizziamo esclusivamente semi biologici certificati e metodi di coltivazione naturali."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-oro-primary flex-shrink-0 mt-1">
                      <Star className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-2">
                        {infoSection?.content?.feature2_title || "Massima Freschezza"}
                      </h3>
                      <p className="text-muted-foreground">
                        {infoSection?.content?.feature2_description ||
                          "I nostri microgreens vengono raccolti al momento ottimale e consegnati entro 24 ore."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-verde-primary flex-shrink-0 mt-1">
                      <Leaf className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-2">
                        {infoSection?.content?.feature3_title || "Tradizione Italiana"}
                      </h3>
                      <p className="text-muted-foreground">
                        {infoSection?.content?.feature3_description ||
                          "Ogni varietà è selezionata per esaltare i sapori della cucina italiana."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="h-96 rounded-2xl bg-cover bg-center shadow-soft relative"
                style={{ backgroundImage: `url(${varietiesImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-verde/10 rounded-2xl" />
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default MicrogreensPreview;