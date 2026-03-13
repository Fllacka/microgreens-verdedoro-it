import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Leaf, Star, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import varietiesImage from "@/assets/microgreens-varieties.jpg";
import chefImage from "@/assets/chef-microgreens.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { generateBreadcrumbSchema } from "@/lib/seo";
import { isCtaButtonVisible } from "@/lib/cta-utils";
import { PageLoading } from "@/components/ui/page-loading";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  grid_description?: string;
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

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

const Microgreens = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, sectionsRes] = await Promise.all([
          supabase
            .from("products")
            .select(
              `
              id,
              name,
              slug,
              description,
              grid_description,
              category,
              benefits,
              uses,
              rating,
              popular,
              media:media!products_image_id_fkey (
                file_path,
                optimized_urls
              )
            `,
            )
            .eq("published", true)
            .order("popular", { ascending: false })
            .order("name"),
          supabase.from("microgreens_sections").select("*").order("sort_order"),
        ]);

        if (productsRes.error) throw productsRes.error;
        if (sectionsRes.error) throw sectionsRes.error;

        if (productsRes.data) setProducts(productsRes.data as any);

        const sectionsMap: Record<string, Section> = {};
        sectionsRes.data?.forEach((section) => {
          sectionsMap[section.id] = section as Section;
        });
        setSections(sectionsMap);

        // Get categories from CMS configuration
        const categoriesContent = sectionsMap["categories"]?.content as { items?: CategoryItem[] } | null;
        if (categoriesContent?.items) {
          // Filter to only show categories that have published products AND have valid names
          const categoriesWithProducts = categoriesContent.items
            .filter((cat) => cat.name?.trim())
            .filter((cat) => productsRes.data?.some((product) => product.category === cat.name));
          setCategories(categoriesWithProducts);
        }

        // Fetch hero background image if set
        const heroImageId = sectionsMap["hero"]?.content?.background_image_id;
        if (heroImageId) {
          const { data: mediaData } = await supabase
            .from("media")
            .select("file_path")
            .eq("id", heroImageId)
            .maybeSingle();
          if (mediaData) {
            setHeroImageUrl(mediaData.file_path);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Errore nel caricamento dei dati");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const seoSection = sections["seo"];
  const heroSection = sections["hero"];
  const infoSection = sections["info"];
  const categoriesSection = sections["categories"];
  const ctaSection = sections["cta"];

  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  const currentUrl = window.location.origin + "/microgreens";
  const canonicalUrl = seoSection?.content?.canonical_url
    ? `${window.location.origin}${seoSection.content.canonical_url}`
    : currentUrl;

  if (loading || Object.keys(sections).length === 0) {
    return (
      <Layout>
        <PageLoading />
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{seoSection?.content?.meta_title || "I Nostri Microgreens - Verde D'Oro"}</title>
        <meta
          name="description"
          content={
            seoSection?.content?.meta_description ||
            "Scopri la nostra selezione di microgreens biologici coltivati a Reggio Emilia."
          }
        />
        <meta name="robots" content={seoSection?.content?.robots || "index, follow"} />
        <link rel="canonical" href={canonicalUrl} />
        <meta
          property="og:title"
          content={
            seoSection?.content?.og_title || seoSection?.content?.meta_title || "I Nostri Microgreens - Verde D'Oro"
          }
        />
        <meta
          property="og:description"
          content={
            seoSection?.content?.og_description ||
            seoSection?.content?.meta_description ||
            "Scopri la nostra selezione di microgreens biologici"
          }
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:locale" content="it_IT" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={
            seoSection?.content?.og_title || seoSection?.content?.meta_title || "I Nostri Microgreens - Verde D'Oro"
          }
        />
        <meta
          name="twitter:description"
          content={
            seoSection?.content?.og_description ||
            seoSection?.content?.meta_description ||
            "Scopri la nostra selezione di microgreens biologici"
          }
        />
        <script type="application/ld+json">
          {JSON.stringify(
            generateBreadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Microgreens", url: "/microgreens" },
            ]),
          )}
        </script>
      </Helmet>

      {/* Hero Section */}
      {heroSection?.is_visible !== false && (
        <section className="section-padding relative overflow-hidden">
          {/* Hero Background Image - Optimized for LCP */}
          {heroImageUrl && (
            <img
              src={heroImageUrl}
              alt={heroSection?.content?.background_image_alt || "Microgreens hero background"}
              className="absolute inset-0 w-full h-full object-cover"
              fetchPriority="high"
              loading="eager"
              width={1920}
              height={600}
              decoding="async"
            />
          )}
          {/* Overlay for background image */}
          {heroImageUrl && <div className="absolute inset-0 bg-gradient-hero" />}
          {/* Gradient fallback when no image */}
          {!heroImageUrl && <div className="absolute inset-0 bg-gradient-subtle" />}

          <div className="container-width text-center relative z-10">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary mb-6">
              {heroSection?.content?.title || "I Nostri Microgreens"}
            </h1>
            <div
              className="font-body text-xl text-muted-foreground max-w-4xl mx-auto mb-8 prose prose-lg max-w-none [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{
                __html:
                  heroSection?.content?.subtitle ||
                  "Scopri la nostra selezione di microgreens coltivati con passione nel cuore dell'Emilia-Romagna. Ogni varietà è scelta per il suo sapore unico e i suoi benefici nutrizionali eccezionali.",
              }}
            />

            {/* Category filters in hero */}
            {categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
                <Button
                  variant={selectedCategory === null ? "verde" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-full"
                >
                  Tutti
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.name ? "verde" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.name)}
                    className="rounded-full"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="section-padding bg-background">
        <div className="container-width">
          {loading ? (
            <p className="text-center">Caricamento prodotti...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-muted-foreground">Nessun prodotto trovato in questa categoria.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  category={product.category}
                  description={product.description}
                  gridDescription={product.grid_description}
                  benefits={product.benefits}
                  uses={product.uses}
                  image={product.media?.file_path || chefImage}
                  rating={product.rating}
                  popular={product.popular}
                  slug={product.slug}
                  priority={index < 3}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {ctaSection?.is_visible !== false && (
        <section className="section-padding bg-gradient-verde">
          <div className="container-width text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              {ctaSection?.content?.title || "Non Trovi la Varietà che Cerchi?"}
            </h2>
            <div
              className="font-body text-lg text-primary-foreground/90 max-w-3xl mx-auto mb-8 prose prose-lg prose-invert max-w-none [&_a]:text-oro-primary [&_a]:underline [&_p]:my-2"
              dangerouslySetInnerHTML={{
                __html:
                  ctaSection?.content?.description ||
                  "<p>La nostra selezione è in continua crescita, ma sappiamo che le tue esigenze possono essere uniche. Scopri le nostre coltivazioni personalizzate o contattaci direttamente per discutere le tue necessità.</p>",
              }}
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isCtaButtonVisible(
                ctaSection?.content?.primary_button_visible,
                ctaSection?.content?.primary_button_text,
                ctaSection?.content?.primary_button_link,
              ) && (
                <Button
                  asChild
                  variant="oro"
                  size="lg"
                  className="group h-auto py-4 px-8 text-xl md:text-2xl font-bold shadow-xl hover:scale-105 transition-all"
                >
                  <Link to={ctaSection?.content?.primary_button_link || "/microgreens-su-misura"}>
                    {ctaSection?.content?.primary_button_text || "Esplora Microgreens su Misura"}
                    <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                  </Link>
                </Button>
              )}
              {isCtaButtonVisible(
                ctaSection?.content?.secondary_button_visible,
                ctaSection?.content?.secondary_button_text,
                ctaSection?.content?.secondary_button_link,
              ) && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-background text-primary border-transparent hover:bg-background/95 hover:text-primary"
                >
                  <Link to={ctaSection?.content?.secondary_button_link || "/contatti"}>
                    <Mail className="mr-2 h-5 w-5" />
                    {ctaSection?.content?.secondary_button_text || "Contattaci Direttamente"}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

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
                      <div
                        className="text-muted-foreground prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline"
                        dangerouslySetInnerHTML={{
                          __html:
                            infoSection?.content?.feature1_description ||
                            "Utilizziamo esclusivamente semi biologici certificati e metodi di coltivazione naturali, senza pesticidi o fertilizzanti chimici.",
                        }}
                      />
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
                      <div
                        className="text-muted-foreground prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline"
                        dangerouslySetInnerHTML={{
                          __html:
                            infoSection?.content?.feature2_description ||
                            "I nostri microgreens vengono raccolti al momento ottimale e consegnati entro 24 ore per garantire sapore e proprietà nutrizionali al massimo.",
                        }}
                      />
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
                      <div
                        className="text-muted-foreground prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline"
                        dangerouslySetInnerHTML={{
                          __html:
                            infoSection?.content?.feature3_description ||
                            "Ogni varietà è selezionata per esaltare i sapori della cucina italiana, dalle erbe aromatiche ai microgreens più innovativi.",
                        }}
                      />
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

export default Microgreens;
