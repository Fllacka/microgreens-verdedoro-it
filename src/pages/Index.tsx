import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import ArticleCard from "@/components/ArticleCard";
import { Leaf, Heart, Truck, Shield, ArrowRight, Sprout, Package, UtensilsCrossed, Star, Sparkles, Flame, Sun, ChefHat, ShoppingBag, Scissors, Bike, Hand, HandCoins } from "lucide-react";
import SeedingHandIcon from "@/components/icons/SeedingHandIcon";
import heroImage from "@/assets/hero-microgreens.jpg";
import varietiesImage from "@/assets/microgreens-varieties.jpg";
import chefImage from "@/assets/chef-microgreens.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { generateOrganizationSchema, generateWebSiteSchema, generateLocalBusinessSchema, combineSchemas } from "@/lib/seo";
import { PageLoading } from "@/components/ui/page-loading";

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
  grid_description?: string | null;
  category: string | null;
  benefits: string[] | null;
  uses: string[] | null;
  image_id?: string | null;
}
// Helper function to strip HTML tags from rich text content
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, '').trim();
};

// Icon map for dynamic CMS-driven icons
const ICON_MAP: Record<string, React.ComponentType<{
  className?: string;
}>> = {
  SeedingHand: SeedingHandIcon,
  Hand,
  HandCoins,
  Heart,
  Truck,
  Shield,
  Sprout,
  Package,
  UtensilsCrossed,
  Star,
  ShoppingBag,
  Scissors,
  Bike,
  Sparkles,
  Flame,
  Sun,
  ChefHat,
  ArrowRight
};
interface IndexProps {
  isPreview?: boolean;
}
const Index = ({
  isPreview = false
}: IndexProps) => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<string, MediaItem>>({});
  const [sections, setSections] = useState<Record<string, HomepageSection>>({});
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [productMediaMap, setProductMediaMap] = useState<Record<string, {
    file_path: string;
  }>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch sections first
      await fetchSections();
    };
    fetchData();
  }, [isPreview]);

  // Unified loading: after sections are loaded, fetch products + blog, then mark ready
  useEffect(() => {
    if (Object.keys(sections).length === 0) return;
    
    const fetchRemainingData = async () => {
      const slugs = sections.featured_products?.content?.product_slugs;
      await Promise.all([
        slugs?.length > 0 ? fetchFeaturedProducts(slugs) : Promise.resolve(),
        fetchBlogPosts(),
      ]);
      setLoading(false);
    };
    fetchRemainingData();
  }, [sections]);
  const fetchSections = async () => {
    const {
      data,
      error
    } = await supabase.from("homepage_sections").select("id, content, is_visible, draft_content, draft_is_visible").order("sort_order");
    if (!error && data) {
      const sectionsMap: Record<string, HomepageSection> = {};
      data.forEach(section => {
        // If in preview mode, prioritize draft content with fallback to live
        const content = isPreview ? section.draft_content as Record<string, any> ?? section.content as Record<string, any> : section.content as Record<string, any>;
        const isVisible = isPreview ? section.draft_is_visible ?? section.is_visible : section.is_visible;
        sectionsMap[section.id] = {
          id: section.id,
          content: content,
          is_visible: isVisible
        };
      });
      setSections(sectionsMap);

      // Fetch images for sections that have image_id
      const imageIds: string[] = [];
      data.forEach(section => {
        const content = section.content as Record<string, any>;
        if (content?.background_image_id) imageIds.push(content.background_image_id);
        if (content?.image_id) imageIds.push(content.image_id);
      });
      if (imageIds.length > 0) {
        const {
          data: media
        } = await supabase.from("media").select("id, file_path").in("id", imageIds);
        if (media) {
          const map: Record<string, MediaItem> = {};
          media.forEach((m) => {
            map[m.id] = {
              id: m.id,
              file_path: m.file_path,
            };
          });
          setMediaMap(map);
        }
      }
    }
  };
  const fetchFeaturedProducts = async (slugs: string[]) => {
    const {
      data: products,
      error
    } = await supabase.from("products").select("id, name, slug, description, grid_description, category, benefits, uses, image_id").in("slug", slugs).eq("published", true);
    if (!error && products) {
      // Maintain the order from slugs array
      const orderedProducts = slugs.map(slug => products.find(p => p.slug === slug)).filter((p): p is typeof products[number] => p !== undefined) as Product[];
      setFeaturedProducts(orderedProducts);

      // Fetch product images
      const imageIds = products.map(p => p.image_id).filter((id): id is string => id !== null);
      if (imageIds.length > 0) {
        const {
          data: media
        } = await supabase.from("media").select("id, file_path").in("id", imageIds);
        if (media) {
          const map: Record<string, { file_path: string }> = {};
          media.forEach(m => {
            map[m.id] = {
              file_path: m.file_path,
            };
          });
          setProductMediaMap(map);
        }
      }
    }
  };
  const fetchBlogPosts = async () => {
    const postsCount = sections.blog?.content?.posts_count || 3;
    const {
      data: posts
    } = await supabase.from("blog_posts").select("id, title, slug, excerpt, published_at, featured_image_id").eq("published", true).order("published_at", {
      ascending: false
    }).limit(postsCount);
    if (posts && posts.length > 0) {
      setBlogPosts(posts);
      const imageIds = posts.map(p => p.featured_image_id).filter((id): id is string => id !== null);
      if (imageIds.length > 0) {
        const {
          data: media
        } = await supabase.from("media").select("id, file_path").in("id", imageIds);
        if (media) {
          setMediaMap(prev => {
            const map = { ...prev };
            media.forEach((m) => {
              map[m.id] = {
                id: m.id,
                file_path: m.file_path,
              };
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
    secondary_button_link: "/microgreens-su-misura"
  };
  const whatAreMicrogreensContent = sections.what_are_microgreens?.content || {
    heading: "Cosa sono i microgreens?",
    description: "I microgreens sono germogli giovani di ortaggi e piante aromatiche raccolti dopo 7-14 giorni dalla germinazione. Concentrano in poche foglie una quantità straordinaria di vitamine, minerali e antiossidanti - fino a 40 volte in più rispetto alle verdure mature.",
    features: [{
      title: "Sapore Intenso",
      description: "Concentrazione di sapori unici e distintivi per piatti gourmet."
    }, {
      title: "Valore Nutritivo",
      description: "Fino a 40 volte più nutrienti rispetto alle verdure mature in fase di crescita."
    }, {
      title: "Supporto di Stagione",
      description: "Coltivazione costante tutto l'anno senza dipendere dalle stagioni."
    }, {
      title: "Cucina Sostenibile",
      description: "Prodotto locale a km 0 che riduce l'impatto ambientale."
    }],
    cta_text: "Scopri di più",
    cta_link: "/cosa-sono-i-microgreens"
  };
  const howItWorksContent = sections.how_it_works?.content || {
    heading: "Come Funziona?",
    subtitle: "Da coltivazione della massima qualità per portare Qualità, eccellenza, identità: i valori che caratterizzano la nostra azienda e i nostri prodotti.",
    steps: [{
      number: "1",
      icon: "Leaf",
      title: "Ordina",
      description: "Scegli i microgreens perfetti per le tue esigenze dal nostro catalogo o richiedi una consulenza"
    }, {
      number: "2",
      icon: "Heart",
      title: "Semina",
      description: "Prepariamo la semina secondo le tue necessità, utilizzando solo semi biologici certificati"
    }, {
      number: "3",
      icon: "Truck",
      title: "Raccolta",
      description: "Raccogliamo al momento giusto per garantire massima freschezza e concentrazione nutrizionale"
    }, {
      number: "4",
      icon: "Shield",
      title: "Consegna",
      description: "Ricevi i tuoi microgreens freschi entro 24 ore dalla raccolta, direttamente a casa o in azienda"
    }]
  };
  const ordersDeliveryContent = sections.orders_delivery?.content || {
    heading: "Ordini e consegne",
    description: "Direttamente consegnare a Reggio Emilia e provincia per tutti i ordini ricevuti. Consegna entro 24 ore dalla raccolta a CO2!",
    button_text: "Ordina i microgreens",
    button_link: "/contatti"
  };
  const featuredProductsContent = sections.featured_products?.content || {
    heading: "I Nostri Microgreens in Evidenza",
    subtitle: "Scopri i microgreens più richiesti. Trova la varietà che fa per te adatta al tuo utilizzo in cucina per dare un tocco speciale ai tuoi piatti.",
    button_text: "Visualizza tutti i prodotti",
    button_link: "/microgreens"
  };
  const customMicrogreensContent = sections.custom_microgreens?.content || {
    heading: "Microgreens su Misura",
    description1: "Sei un ristoratore, uno chef o hai esigenze particolari? Progettiamo insieme la soluzione perfetta per te. Varietà specifiche, dimensioni personalizzate, consegne programmate: tutto ciò che ti serve per distinguerti.",
    description2: "Fornitura regolare attraverso contratti personalizzati per ristoranti, hotel, catering e eventi. Consulenza gratuita per integrare i nostri microgreens nel tuo menu e valorizzare i tuoi piatti.",
    button_text: "Richiedi un preventivo",
    button_link: "/microgreens-su-misura"
  };
  const blogContent = sections.blog?.content || {
    heading: "Esplora il Nostro Blog",
    subtitle: "Consigli, ricette e l'incredibile mondo dei microgreens e scoprirne più che mai sulle curiosità nutrizionali e tutto culinarie.",
    button_text: "Leggi tutti gli articoli",
    button_link: "/blog"
  };
  const seoContent = sections.seo?.content || {
    meta_title: "Verde D'Oro - Microgreens Freschi a Reggio Emilia",
    meta_description: "Microgreens coltivati con passione a Reggio Emilia. Consegna in giornata per ristoranti, chef e privati. Scopri i nostri germogli freschi e nutrienti.",
    og_title: "Verde D'Oro - Microgreens Freschi a Reggio Emilia",
    og_description: "Microgreens coltivati con passione a Reggio Emilia. Consegna in giornata per ristoranti, chef e privati.",
    robots: "index, follow"
  };

  // Get images from CMS or use defaults
  const getHeroImage = () => {
    const imageId = heroContent.background_image_id;
    if (imageId && mediaMap[imageId]) {
      return mediaMap[imageId].file_path;
    }
    return heroImage;
  };
  const getWhatAreMicrogreensImage = () => {
    const imageId = whatAreMicrogreensContent.image_id;
    if (imageId && mediaMap[imageId]) {
      return mediaMap[imageId].file_path;
    }
    return varietiesImage;
  };
  const getCustomMicrogreensImage = () => {
    const imageId = customMicrogreensContent.image_id;
    if (imageId && mediaMap[imageId]) {
      return mediaMap[imageId].file_path;
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
      return mediaMap[seoContent.og_image_id].file_path;
    }
    return undefined;
  };

  // Use featured products directly (loading guard ensures they're ready)
  const displayProducts = featuredProducts;
  const productsToShow = displayProducts;

  if (loading || Object.keys(sections).length === 0) {
    return <Layout><PageLoading /></Layout>;
  }

  return <Layout>
      <Helmet>
        <title>{seoContent.meta_title}</title>
        <meta name="description" content={seoContent.meta_description} />
        <meta name="robots" content={seoContent.robots} />
        {seoContent.canonical_url && <link rel="canonical" href={seoContent.canonical_url} />}
        <meta property="og:title" content={seoContent.og_title || seoContent.meta_title} />
        <meta property="og:description" content={seoContent.og_description || seoContent.meta_description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://verdedoro.it/" />
        <meta property="og:locale" content="it_IT" />
        {getOgImageUrl() && <meta property="og:image" content={getOgImageUrl()} />}
        {/* Combined structured data for homepage */}
        <script type="application/ld+json">
          {JSON.stringify(combineSchemas(generateOrganizationSchema(), generateWebSiteSchema(), generateLocalBusinessSchema()))}
        </script>
        {seoContent.structured_data && <script type="application/ld+json">{seoContent.structured_data}</script>}
      </Helmet>
      {/* Hero Section */}
      {sections.hero?.is_visible !== false && <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Hero Background Image - Optimized for LCP */}
          <img src={getHeroImage()} alt={getHeroAlt()} className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" loading="eager" width={1920} height={1080} decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-black/10" />

          <div className="relative z-10 container-width text-left text-white">
            <div className="max-w-2xl">
              <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 text-shadow-hero">
                <span className="text-verde-primary">VERDE</span> <span className="text-oro-primary">D'ORO</span>
              </h1>
              <div className="w-24 h-0.5 bg-gradient-to-r from-oro-primary to-oro-primary/0 mb-6" />
              <div className="font-body text-lg md:text-xl mb-8 text-white/90 leading-relaxed text-shadow-hero prose prose-lg prose-invert max-w-none [&_a]:text-oro-primary [&_a]:underline" dangerouslySetInnerHTML={{
            __html: heroContent.subtitle
          }} />
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
        </section>}

      {/* Cosa sono i microgreens Section - Premium Design */}
      {sections.what_are_microgreens?.is_visible !== false && <section className="py-20 lg:py-32 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Image Column with Decorative Elements */}
              <div className="relative order-2 lg:order-1">
                {/* Gold decorative circle - top right */}
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full border-2 border-oro-primary/30 -z-10 hidden lg:block" />
                
                {/* Main image */}
                <div className="relative overflow-hidden rounded-2xl shadow-xl">
                  <img src={getWhatAreMicrogreensImage()} alt={getWhatAreMicrogreensAlt()} className="w-full h-[350px] lg:h-[480px] object-cover" width={600} height={480} loading="lazy" decoding="async" />
                </div>
                
                {/* Small gold accent - bottom left */}
                <div className="absolute -bottom-3 -left-3 w-16 h-16 rounded-full bg-oro-primary/20 -z-10 hidden lg:block" />
              </div>

              {/* Content Column */}
              <div className="order-1 lg:order-2">
                {/* Scopri Label with Gold Accent */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-oro-primary" />
                  <span className="text-sm font-medium uppercase tracking-widest text-oro-primary">
                    Scopri
                  </span>
                </div>

                {/* Elegant Title */}
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
                  {whatAreMicrogreensContent.heading}
                </h2>

                {/* Description - comfortable to read */}
                <div className="font-body text-muted-foreground leading-relaxed prose prose-lg max-w-xl mb-10 [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{
              __html: whatAreMicrogreensContent.description
            }} />

                {/* Premium Feature Cards - Single column on mobile, 2x2 on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                  {(whatAreMicrogreensContent.features || []).map((feature: any, index: number) => {
                const featureIcons = [Sparkles, Flame, Sun, ChefHat];
                const IconComponent = featureIcons[index % featureIcons.length];
                return <div key={index} className="bg-card rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-border flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-verde-primary/10 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-verde-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-semibold text-primary text-sm mb-0.5">
                            {feature.title}
                          </h3>
                          <p className="font-body text-xs text-muted-foreground leading-snug">
                            {feature.description}
                          </p>
                        </div>
                      </div>;
              })}
                </div>

                {/* Premium Pill CTA */}
                <Button asChild size="lg" className="group bg-verde-primary hover:bg-verde-primary/90 text-white rounded-full px-6 sm:px-8 font-medium transition-all duration-300 w-full sm:w-auto">
                  <Link to={whatAreMicrogreensContent.cta_link}>
                    {whatAreMicrogreensContent.cta_text || "Leggi la guida completa"}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>}

      {/* Section Divider */}
      

      {/* Featured Products - Positioned after "Cosa sono i microgreens" */}
      {sections.featured_products?.is_visible !== false && productsToShow.length > 0 && <section className="section-padding bg-secondary shadow-[inset_0_4px_12px_-4px_rgba(0,0,0,0.06)]">
          <div className="container-width">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
                {featuredProductsContent.heading}
              </h2>
              <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
                {stripHtmlTags(featuredProductsContent.subtitle)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {productsToShow.map((product, index) => {
            const imageId = 'image_id' in product ? product.image_id as string | null : null;
            const mediaInfo = imageId && productMediaMap[imageId] ? productMediaMap[imageId] : null;
            const productImage = mediaInfo?.file_path || chefImage;
            const gridDesc = 'grid_description' in product ? (product as Product).grid_description : undefined;
            return <ProductCard 
              key={product.id} 
              name={product.name} 
              category={product.category || ""} 
              description={product.description || ""} 
              gridDescription={gridDesc || undefined} 
              benefits={product.benefits || []} 
              uses={product.uses || []} 
              image={productImage} 
              onCardClick={() => navigate(`/microgreens/${product.slug}`)} 
              priority={index < 3}
            />;
          })}
            </div>

            <div className="text-center">
              <Button variant="verde" size="lg" asChild>
                <Link to={featuredProductsContent.button_link}>{featuredProductsContent.button_text}</Link>
              </Button>
            </div>
          </div>
        </section>}

      {/* Section Divider */}
      

      {/* Come Funziona Section - Journey Timeline */}
      {sections.how_it_works?.is_visible !== false && (() => {
      // Get journey steps from CMS or use defaults
      const cmsSteps = howItWorksContent.steps || [];
      const journeySteps = cmsSteps.length > 0 ? cmsSteps.map((step: any, index: number) => ({
        number: index + 1,
        icon: ICON_MAP[step.icon] || ShoppingBag,
        title: step.title || "",
        description: step.description || ""
      })) : [{
        number: 1,
        icon: ShoppingBag,
        title: "Ordine",
        description: "Scegli le varietà e attiviamo la semina dedicata a te."
      }, {
        number: 2,
        icon: SeedingHandIcon,
        title: "Semina",
        description: "Coltiviamo in ambiente controllato per qualità perfetta."
      }, {
        number: 3,
        icon: Scissors,
        title: "Raccolta",
        description: "Tagliamo a mano solo quando è il momento giusto."
      }, {
        number: 4,
        icon: Bike,
        title: "Consegna",
        description: "A casa tua a Reggio Emilia, poche ore dal taglio."
      }];

      // Green progression - lighter to darker (symbolizing growth)
      const iconColors = [{
        bg: "bg-verde-primary/60",
        ring: "ring-verde-primary/40"
      }, {
        bg: "bg-verde-primary/75",
        ring: "ring-verde-primary/50"
      }, {
        bg: "bg-verde-primary/90",
        ring: "ring-verde-primary/60"
      }, {
        bg: "bg-verde-primary",
        ring: "ring-verde-primary/70"
      }];
      return <section className="section-padding bg-gradient-subtle">
            <div className="container-width">
              {/* Header */}
              <div className="text-center mb-12 lg:mb-16">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
                  {howItWorksContent.heading || "Come Funziona?"}
                </h2>
                <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto">
                  {stripHtmlTags(howItWorksContent.subtitle) || "Dal tuo ordine alla tua tavola, in pochi semplici passi"}
                </p>
              </div>

              {/* Desktop: 4 columns with chevrons */}
              <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-stretch gap-2">
                {journeySteps.map((step, index) => {
              const IconComponent = step.icon;
              const isLast = index === journeySteps.length - 1;
              return <>
                      {/* Card */}
                      <div key={`card-${index}`} className="relative bg-white rounded-[1.25rem] p-6 pt-10 shadow-sm border border-gray-100/50 
                                      hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[220px] flex flex-col">
                        {/* Gold badge - top left */}
                        <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-oro-primary to-oro-light 
                                        flex items-center justify-center shadow-md z-10">
                          <span className="font-display text-base font-bold text-white">{step.number}</span>
                        </div>
                        
                        {/* Icon with ring */}
                        <div className="flex justify-center mb-4">
                          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${iconColors[index].bg} 
                                          ring-2 ${iconColors[index].ring} shadow-lg`}>
                            <IconComponent className="h-7 w-7 text-white stroke-[2.5]" />
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="font-display text-lg font-bold text-primary mb-2 text-center">
                          {step.title}
                        </h3>
                        
                        {/* Description */}
                        <p className="font-body text-sm text-muted-foreground leading-relaxed text-center flex-1">
                          {step.description}
                        </p>
                      </div>
                      
                      {/* Chevron between cards */}
                      {!isLast && <div key={`chevron-${index}`} className="flex items-center justify-center">
                          <span className="text-2xl font-light text-oro-primary/50 select-none">›</span>
                        </div>}
                    </>;
            })}
              </div>

              {/* Tablet: 2 columns */}
              <div className="hidden md:grid md:grid-cols-2 lg:hidden gap-6 items-stretch">
                {journeySteps.map((step, index) => {
              const IconComponent = step.icon;
              return <div key={index} className="relative h-full">
                      {/* Card */}
                      <div className="relative bg-white rounded-[1.25rem] p-6 pt-10 shadow-sm border border-gray-100/50 
                                      hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[200px] flex flex-col h-full">
                        {/* Gold badge - top left */}
                        <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-oro-primary to-oro-light 
                                        flex items-center justify-center shadow-md z-10">
                          <span className="font-display text-base font-bold text-white">{step.number}</span>
                        </div>
                        
                        {/* Icon with ring */}
                        <div className="flex justify-center mb-4">
                          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${iconColors[index].bg} 
                                          ring-2 ${iconColors[index].ring} shadow-lg`}>
                            <IconComponent className="h-6 w-6 text-white stroke-[2.5]" />
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="font-display text-base font-bold text-primary mb-2 text-center">
                          {step.title}
                        </h3>
                        
                        {/* Description */}
                        <p className="font-body text-sm text-muted-foreground leading-relaxed text-center flex-1">
                          {step.description}
                        </p>
                      </div>
                    </div>;
            })}
              </div>

              {/* Mobile: 1 column */}
              <div className="grid grid-cols-1 md:hidden gap-5">
                {journeySteps.map((step, index) => {
              const IconComponent = step.icon;
              return <div key={index} className="relative">
                      {/* Card */}
                      <div className="relative bg-white rounded-[1.25rem] p-5 pt-8 shadow-sm border border-gray-100/50">
                        {/* Gold badge - top left */}
                        <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-gradient-to-br from-oro-primary to-oro-light 
                                        flex items-center justify-center shadow-md z-10">
                          <span className="font-display text-sm font-bold text-white">{step.number}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* Icon with ring */}
                          <div className={`flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full ${iconColors[index].bg} 
                                          ring-2 ${iconColors[index].ring} shadow-lg`}>
                            <IconComponent className="h-5 w-5 text-white stroke-[2.5]" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display text-base font-bold text-primary mb-1">
                              {step.title}
                            </h3>
                            <p className="font-body text-sm text-muted-foreground leading-snug">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>;
            })}
              </div>
            </div>
          </section>;
    })()}

      {/* Section Divider */}
      

      {/* Ordini e Consegne Section */}
      {sections.orders_delivery?.is_visible !== false && <section className="section-padding bg-secondary">
          <div className="container-width text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
              {ordersDeliveryContent.heading}
            </h2>
            <div className="font-body text-lg text-muted-foreground max-w-3xl mx-auto mb-8 prose prose-lg max-w-none [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{
          __html: ordersDeliveryContent.description
        }} />
            <Button variant="verde" size="lg" asChild>
              <Link to={ordersDeliveryContent.button_link}>{ordersDeliveryContent.button_text}</Link>
            </Button>
          </div>
        </section>}

      {/* Microgreens su Misura Section */}
      {sections.custom_microgreens?.is_visible !== false && <section className="section-padding bg-gradient-verde text-white">
          <div className="container-width">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  {customMicrogreensContent.heading}
                </h2>
                <div className="font-body mb-6 leading-relaxed text-white prose prose-lg prose-invert max-w-none [&_a]:text-oro-primary [&_a]:underline" dangerouslySetInnerHTML={{
              __html: customMicrogreensContent.description1
            }} />
                <div className="font-body mb-8 text-base text-primary-foreground/90 prose prose-lg prose-invert max-w-none [&_a]:text-oro-primary [&_a]:underline" dangerouslySetInnerHTML={{
              __html: customMicrogreensContent.description2
            }} />
                <Button variant="oro" size="lg" asChild>
                  <Link to={customMicrogreensContent.button_link}>{customMicrogreensContent.button_text}</Link>
                </Button>
              </div>
              <div className="lg:order-2">
                <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
                  <div className="relative w-full h-64 overflow-hidden rounded-lg bg-muted/30">
                    <img src={getCustomMicrogreensImage()} alt={getCustomMicrogreensAlt()} className="w-full h-full object-cover" width={600} height={256} loading="lazy" decoding="async" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>}

      {/* Blog Section */}
      {sections.blog?.is_visible !== false && blogPosts.length > 0 && <section className="section-padding bg-secondary">
          <div className="container-width text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
              {blogContent.heading}
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              {stripHtmlTags(blogContent.subtitle)}
            </p>

            <div className={`grid gap-8 mb-8 ${blogPosts.length === 1 ? "max-w-md mx-auto" : blogPosts.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto" : "grid-cols-1 md:grid-cols-3"}`}>
              {blogPosts.map(post => {
                const media = post.featured_image_id && mediaMap[post.featured_image_id] ? mediaMap[post.featured_image_id] : null;
                const imageUrl = media?.file_path || varietiesImage;
                return (
                  <ArticleCard
                    key={post.id}
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt || undefined}
                    publishedAt={post.published_at || new Date().toISOString()}
                    imageUrl={imageUrl}
                    showButton={false}
                  />
                );
              })}
            </div>

            <div className="mt-8">
              <Button variant="verde" size="lg" asChild>
                <Link to={blogContent.button_link}>{blogContent.button_text}</Link>
              </Button>
            </div>
          </div>
        </section>}
    </Layout>;
};
export default Index;