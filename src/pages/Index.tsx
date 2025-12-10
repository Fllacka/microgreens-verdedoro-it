import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Leaf, Heart, Truck, Shield, ArrowRight, Sprout, Package, UtensilsCrossed, Star } from "lucide-react";
import heroImage from "@/assets/hero-microgreens.jpg";
import varietiesImage from "@/assets/microgreens-varieties.jpg";
import chefImage from "@/assets/chef-microgreens.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  featured_image_id: string | null;
}

interface MediaItem {
  id: string;
  file_path: string;
}

interface HomepageSection {
  id: string;
  content: Record<string, any>;
  is_visible: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  benefits: string[] | null;
  uses: string[] | null;
  image_id?: string | null;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Leaf,
  Heart,
  Truck,
  Shield,
  Sprout,
  Package,
  UtensilsCrossed,
  Star,
};

const Index = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<Record<string, HomepageSection>>({});
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [productMediaMap, setProductMediaMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchSections(), fetchBlogPosts()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (sections.featured_products?.content?.product_slugs?.length > 0) {
      fetchFeaturedProducts(sections.featured_products.content.product_slugs);
    }
  }, [sections.featured_products]);

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("id, content, is_visible")
      .order("sort_order");

    if (!error && data) {
      const sectionsMap: Record<string, HomepageSection> = {};
      data.forEach((section) => {
        sectionsMap[section.id] = {
          ...section,
          content: section.content as Record<string, any>,
        };
      });
      setSections(sectionsMap);

      // Fetch images for sections that have image_id
      const imageIds: string[] = [];
      data.forEach((section) => {
        const content = section.content as Record<string, any>;
        if (content?.background_image_id) imageIds.push(content.background_image_id);
        if (content?.image_id) imageIds.push(content.image_id);
      });

      if (imageIds.length > 0) {
        const { data: media } = await supabase
          .from("media")
          .select("id, file_path")
          .in("id", imageIds);

        if (media) {
          const map: Record<string, string> = { ...mediaMap };
          media.forEach((m: MediaItem) => {
            map[m.id] = m.file_path;
          });
          setMediaMap(map);
        }
      }
    }
  };

  const fetchFeaturedProducts = async (slugs: string[]) => {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, slug, description, category, benefits, uses, image_id")
      .in("slug", slugs)
      .eq("published", true);

    if (!error && products) {
      // Maintain the order from slugs array
      const orderedProducts = slugs
        .map((slug) => products.find((p) => p.slug === slug))
        .filter((p): p is typeof products[number] => p !== undefined) as Product[];
      setFeaturedProducts(orderedProducts);

      // Fetch product images
      const imageIds = products.map((p) => p.image_id).filter((id): id is string => id !== null);
      if (imageIds.length > 0) {
        const { data: media } = await supabase
          .from("media")
          .select("id, file_path")
          .in("id", imageIds);

        if (media) {
          const map: Record<string, string> = {};
          media.forEach((m: MediaItem) => {
            map[m.id] = m.file_path;
          });
          setProductMediaMap(map);
        }
      }
    }
  };

  const fetchBlogPosts = async () => {
    const postsCount = sections.blog?.content?.posts_count || 3;
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, published_at, featured_image_id")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(postsCount);

    if (posts && posts.length > 0) {
      setBlogPosts(posts);

      const imageIds = posts
        .map((p) => p.featured_image_id)
        .filter((id): id is string => id !== null);

      if (imageIds.length > 0) {
        const { data: media } = await supabase
          .from("media")
          .select("id, file_path")
          .in("id", imageIds);

        if (media) {
          setMediaMap((prev) => {
            const map = { ...prev };
            media.forEach((m: MediaItem) => {
              map[m.id] = m.file_path;
            });
            return map;
          });
        }
      }
    }
  };

  // Default content for fallback
  const heroContent = sections.hero?.content || {
    badge_text: "Microgreens di Reggio Emilia",
    title_part1: "Verde",
    title_highlight: "D'Oro",
    subtitle: "Microgreens coltivati con passione a Reggio Emilia, dall'orto al piatto in giornata per una cucina che fa la differenza.",
    primary_button_text: "Scopri i microgreens",
    primary_button_link: "/microgreens",
    secondary_button_text: "Microgreens su misura",
    secondary_button_link: "/microgreens-su-misura",
  };

  const whatAreMicrogreensContent = sections.what_are_microgreens?.content || {
    heading: "Cosa sono i microgreens?",
    description: "I microgreens sono germogli giovani di ortaggi e piante aromatiche raccolti dopo 7-14 giorni dalla germinazione. Concentrano in poche foglie una quantità straordinaria di vitamine, minerali e antiossidanti - fino a 40 volte in più rispetto alle verdure mature.",
    features: [
      { title: "Sapore Intenso", description: "Concentrazione di sapori unici e distintivi per piatti gourmet." },
      { title: "Valore Nutritivo", description: "Fino a 40 volte più nutrienti rispetto alle verdure mature in fase di crescita." },
      { title: "Supporto di Stagione", description: "Coltivazione costante tutto l'anno senza dipendere dalle stagioni." },
      { title: "Cucina Sostenibile", description: "Prodotto locale a km 0 che riduce l'impatto ambientale." },
    ],
    cta_text: "Scopri di più",
    cta_link: "/cosa-sono-i-microgreens",
  };

  const howItWorksContent = sections.how_it_works?.content || {
    heading: "Come Funziona?",
    subtitle: "Da coltivazione della massima qualità per portare Qualità, eccellenza, identità: i valori che caratterizzano la nostra azienda e i nostri prodotti.",
    steps: [
      { number: "1", icon: "Leaf", title: "Ordina", description: "Scegli i microgreens perfetti per le tue esigenze dal nostro catalogo o richiedi una consulenza" },
      { number: "2", icon: "Heart", title: "Semina", description: "Prepariamo la semina secondo le tue necessità, utilizzando solo semi biologici certificati" },
      { number: "3", icon: "Truck", title: "Raccolta", description: "Raccogliamo al momento giusto per garantire massima freschezza e concentrazione nutrizionale" },
      { number: "4", icon: "Shield", title: "Consegna", description: "Ricevi i tuoi microgreens freschi entro 24 ore dalla raccolta, direttamente a casa o in azienda" },
    ],
  };

  const ordersDeliveryContent = sections.orders_delivery?.content || {
    heading: "Ordini e consegne",
    description: "Direttamente consegnare a Reggio Emilia e provincia per tutti i ordini ricevuti. Consegna entro 24 ore dalla raccolta a CO2!",
    button_text: "Ordina i microgreens",
    button_link: "/contatti",
  };

  const featuredProductsContent = sections.featured_products?.content || {
    heading: "I Nostri Microgreens in Evidenza",
    subtitle: "Scopri i microgreens più richiesti. Trova la varietà che fa per te adatta al tuo utilizzo in cucina per dare un tocco speciale ai tuoi piatti.",
    button_text: "Visualizza tutti i prodotti",
    button_link: "/microgreens",
  };

  const customMicrogreensContent = sections.custom_microgreens?.content || {
    heading: "Microgreens su Misura",
    description1: "Sei un ristoratore, uno chef o hai esigenze particolari? Progettiamo insieme la soluzione perfetta per te. Varietà specifiche, dimensioni personalizzate, consegne programmate: tutto ciò che ti serve per distinguerti.",
    description2: "Fornitura regolare attraverso contratti personalizzati per ristoranti, hotel, catering e eventi. Consulenza gratuita per integrare i nostri microgreens nel tuo menu e valorizzare i tuoi piatti.",
    button_text: "Richiedi un preventivo",
    button_link: "/microgreens-su-misura",
  };

  const blogContent = sections.blog?.content || {
    heading: "Esplora il Nostro Blog",
    subtitle: "Consigli, ricette e l'incredibile mondo dei microgreens e scoprirne più che mai sulle curiosità nutrizionali e tutto culinarie.",
    button_text: "Leggi tutti gli articoli",
    button_link: "/blog",
  };

  const seoContent = sections.seo?.content || {
    meta_title: "Verde D'Oro - Microgreens Freschi a Reggio Emilia",
    meta_description: "Microgreens coltivati con passione a Reggio Emilia. Consegna in giornata per ristoranti, chef e privati. Scopri i nostri germogli freschi e nutrienti.",
    og_title: "Verde D'Oro - Microgreens Freschi a Reggio Emilia",
    og_description: "Microgreens coltivati con passione a Reggio Emilia. Consegna in giornata per ristoranti, chef e privati.",
    robots: "index, follow",
  };

  // Get images from CMS or use defaults
  const getHeroImage = () => {
    if (heroContent.background_image_id && mediaMap[heroContent.background_image_id]) {
      return mediaMap[heroContent.background_image_id];
    }
    return heroImage;
  };

  const getWhatAreMicrogreensImage = () => {
    if (whatAreMicrogreensContent.image_id && mediaMap[whatAreMicrogreensContent.image_id]) {
      return mediaMap[whatAreMicrogreensContent.image_id];
    }
    return varietiesImage;
  };

  const getCustomMicrogreensImage = () => {
    if (customMicrogreensContent.image_id && mediaMap[customMicrogreensContent.image_id]) {
      return mediaMap[customMicrogreensContent.image_id];
    }
    return chefImage;
  };

  // Alt text getters
  const getHeroAlt = () => heroContent.background_image_alt || "Microgreens freschi Verde D'Oro";
  const getWhatAreMicrogreensAlt = () => whatAreMicrogreensContent.image_alt || "Varietà di microgreens";
  const getCustomMicrogreensAlt = () => customMicrogreensContent.image_alt || "Chef con microgreens";

  // Get OG image URL
  const getOgImageUrl = () => {
    if (seoContent.og_image_id && mediaMap[seoContent.og_image_id]) {
      return mediaMap[seoContent.og_image_id];
    }
    return undefined;
  };

  // Use default products if no CMS products are selected
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : [];
  const hasDefaultProducts = featuredProducts.length === 0;
  const defaultProducts = [
    {
      id: "basilico",
      name: "Basilico",
      description: "Aroma mediterraneo concentrato",
      benefits: ["Oli essenziali", "Proprietà digestive", "Aroma intenso"],
      uses: ["Pasta", "Bruschette", "Caprese"],
      category: "Erbe Aromatiche",
      slug: "basilico",
    },
    {
      id: "ravanello-rosso",
      name: "Ravanello Rosso",
      description: "Croccante e leggermente piccante",
      benefits: ["Vitamina C", "Fibre", "Minerali"],
      uses: ["Sushi", "Tartare", "Antipasti"],
      category: "Brassicaceae",
      slug: "ravanello-rosso",
    },
    {
      id: "pisello",
      name: "Pisello",
      description: "Dolce e delicato",
      benefits: ["Proteine", "Vitamine del gruppo B", "Ferro"],
      uses: ["Zuppe", "Risotti", "Contorni"],
      category: "Legumi",
      slug: "pisello",
    },
  ];

  const productsToShow = hasDefaultProducts ? defaultProducts : displayProducts;

  return (
    <Layout>
      <Helmet>
        <title>{seoContent.meta_title}</title>
        <meta name="description" content={seoContent.meta_description} />
        <meta name="robots" content={seoContent.robots} />
        {seoContent.canonical_url && <link rel="canonical" href={seoContent.canonical_url} />}
        <meta property="og:title" content={seoContent.og_title || seoContent.meta_title} />
        <meta property="og:description" content={seoContent.og_description || seoContent.meta_description} />
        <meta property="og:type" content="website" />
        {getOgImageUrl() && <meta property="og:image" content={getOgImageUrl()} />}
        {seoContent.structured_data && (
          <script type="application/ld+json">{seoContent.structured_data}</script>
        )}
      </Helmet>
      {/* Hero Section */}
      {(sections.hero?.is_visible !== false) && (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Hero Background Image - Optimized for LCP */}
          <img
            src={getHeroImage()}
            alt={getHeroAlt()}
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
            loading="eager"
            width={1920}
            height={1080}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-hero" />

          <div className="relative z-10 container-width text-left text-white">
            <div className="max-w-2xl">
              <div className="inline-block bg-oro-primary text-accent-foreground px-4 py-2 rounded-full text-sm font-body font-medium mb-6">
                {heroContent.badge_text}
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
                {heroContent.title_part1} <span className="text-oro-primary">{heroContent.title_highlight}</span>
              </h1>
              <p className="font-body text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
                {heroContent.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="oro" size="lg" className="text-lg px-8 py-4" asChild>
                  <Link to={heroContent.primary_button_link}>{heroContent.primary_button_text}</Link>
                </Button>
                <Button variant="hero" size="lg" className="text-lg px-8 py-4" asChild>
                  <Link to={heroContent.secondary_button_link}>{heroContent.secondary_button_text}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cosa sono i microgreens Section */}
      {(sections.what_are_microgreens?.is_visible !== false) && (
        <section className="section-padding bg-background">
          <div className="container-width">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative w-full h-80 overflow-hidden rounded-lg shadow-elegant bg-muted/30">
                  <img
                    src={getWhatAreMicrogreensImage()}
                    alt={getWhatAreMicrogreensAlt()}
                    className="w-full h-full object-cover"
                    width={600}
                    height={320}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
                  {whatAreMicrogreensContent.heading}
                </h2>
                <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                  {whatAreMicrogreensContent.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {(whatAreMicrogreensContent.features || []).map((feature: any, index: number) => (
                    <div key={index}>
                      <h3 className="font-display font-semibold text-primary mb-3">{feature.title}</h3>
                      <p className="font-body text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Button variant="verde" className="inline-flex items-center" asChild>
                    <Link to={whatAreMicrogreensContent.cta_link}>{whatAreMicrogreensContent.cta_text}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Come Funziona Section */}
      {(sections.how_it_works?.is_visible !== false) && (
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
                {howItWorksContent.heading}
              </h2>
              <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
                {howItWorksContent.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(howItWorksContent.steps || []).map((step: any, index: number) => {
                const IconComponent = ICON_MAP[step.icon] || Leaf;
                return (
                  <div key={index} className="relative text-center">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-verde mb-6">
                      <IconComponent className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-primary mb-4">
                      {step.number}. {step.title}
                    </h3>
                    <p className="font-body text-muted-foreground text-sm">{step.description}</p>

                    {index < (howItWorksContent.steps?.length || 0) - 1 && (
                      <div className="hidden lg:block absolute top-10 -right-4 w-8">
                        <ArrowRight className="h-6 w-6 text-oro-primary" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Ordini e Consegne Section */}
      {(sections.orders_delivery?.is_visible !== false) && (
        <section className="section-padding bg-background">
          <div className="container-width text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
              {ordersDeliveryContent.heading}
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              {ordersDeliveryContent.description}
            </p>
            <Button variant="verde" size="lg" asChild>
              <Link to={ordersDeliveryContent.button_link}>{ordersDeliveryContent.button_text}</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {(sections.featured_products?.is_visible !== false) && productsToShow.length > 0 && (
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
                {featuredProductsContent.heading}
              </h2>
              <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
                {featuredProductsContent.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {productsToShow.map((product, index) => {
                const imageId = 'image_id' in product ? (product.image_id as string | null) : null;
                const productImage = imageId && productMediaMap[imageId]
                  ? productMediaMap[imageId]
                  : hasDefaultProducts
                    ? (index === 1 ? varietiesImage : chefImage)
                    : chefImage;

                return (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    category={product.category || ""}
                    description={product.description || ""}
                    benefits={product.benefits || []}
                    uses={product.uses || []}
                    image={productImage}
                    onCardClick={() => navigate(`/microgreens/${product.slug}`)}
                    priority={index < 3} // First 3 products load eagerly
                  />
                );
              })}
            </div>

            <div className="text-center">
              <Button variant="verde" size="lg" asChild>
                <Link to={featuredProductsContent.button_link}>{featuredProductsContent.button_text}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Microgreens su Misura Section */}
      {(sections.custom_microgreens?.is_visible !== false) && (
        <section className="section-padding bg-gradient-verde text-white">
          <div className="container-width">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  {customMicrogreensContent.heading}
                </h2>
                <p className="font-body mb-6 leading-relaxed text-white">
                  {customMicrogreensContent.description1}
                </p>
                <p className="font-body mb-8 text-base text-slate-50">
                  {customMicrogreensContent.description2}
                </p>
                <Button variant="oro" size="lg" asChild>
                  <Link to={customMicrogreensContent.button_link}>{customMicrogreensContent.button_text}</Link>
                </Button>
              </div>
              <div className="lg:order-2">
                <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
                  <div className="relative w-full h-64 overflow-hidden rounded-lg bg-muted/30">
                    <img
                      src={getCustomMicrogreensImage()}
                      alt={getCustomMicrogreensAlt()}
                      className="w-full h-full object-cover"
                      width={600}
                      height={256}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Section */}
      {(sections.blog?.is_visible !== false) && blogPosts.length > 0 && (
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
              {blogContent.heading}
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
              {blogContent.subtitle}
            </p>

            <div
              className={`grid gap-8 mb-8 ${
                blogPosts.length === 1
                  ? "max-w-md mx-auto"
                  : blogPosts.length === 2
                    ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto"
                    : "grid-cols-1 md:grid-cols-3"
              }`}
            >
              {blogPosts.map((post) => {
                const imageUrl =
                  post.featured_image_id && mediaMap[post.featured_image_id]
                    ? mediaMap[post.featured_image_id]
                    : varietiesImage;

                return (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <Card className="overflow-hidden hover-lift border-border/50 h-full">
                      <div className="relative h-48 overflow-hidden bg-muted/30">
                        <img
                          src={imageUrl}
                          alt={`${post.title} - articolo blog`}
                          className="w-full h-full object-cover"
                          width={400}
                          height={192}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-hero/20" />
                      </div>
                      <CardContent className="p-6 text-left">
                        <h3 className="font-display text-xl font-semibold text-primary mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="font-body text-muted-foreground text-sm mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        {post.published_at && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(post.published_at), "d MMM yyyy", { locale: it })}
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8">
              <Button variant="verde" size="lg" asChild>
                <Link to={blogContent.button_link}>{blogContent.button_text}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;
