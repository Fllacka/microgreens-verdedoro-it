import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Layout from "@/components/Layout";
import { ContentBlockRenderer } from "@/components/ContentBlockRenderer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Calendar, Clock, AlertTriangle, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import { stripHtmlTags } from "@/lib/seo";

interface ContentBlock {
  id: string;
  type: "heading" | "text" | "image";
  level?: "h1" | "h2" | "h3";
  content?: string;
  url?: string;
  alt?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  content_blocks: ContentBlock[];
  published_at: string;
  published: boolean;
  featured_image_id?: string | null;
  meta_title?: string;
  meta_description?: string;
  faq_title?: string;
  faq_items?: FAQItem[];
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

// Reusable prose styling constant
const proseClasses = "prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-verde-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-verde-light [&_p]:my-4 [&_p]:min-h-[1.5em] [&_p:empty]:min-h-[1.5em] [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 prose-headings:font-display prose-headings:text-primary prose-p:text-muted-foreground prose-strong:text-primary";

const BlogPreview = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  
  // Featured products state
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredProductsContent, setFeaturedProductsContent] = useState({
    heading: "I microgreens più ricercati",
    subtitle: "Scopri i microgreens più richiesti. Trova la varietà che fa per te adatta al tuo utilizzo in cucina per dare un tocco speciale ai tuoi piatti.",
    button_text: "Visualizza tutti i prodotti",
    button_link: "/microgreens",
    product_slugs: [] as string[],
  });
  const [productMediaMap, setProductMediaMap] = useState<Record<string, { file_path: string; width?: number; height?: number }>>({});

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/admin/login");
      return;
    }
    if (userRole === "admin" || userRole === "editor") {
      setAuthorized(true);
    } else {
      toast.error("Non hai i permessi per visualizzare l'anteprima");
      navigate("/");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug || !authorized) return;

      try {
        // Fetch blog post WITHOUT published filter for preview
        // Search by both slug and draft_slug to handle slug changes
        const { data: postData, error: postError } = await supabase
          .from("blog_posts")
          .select("*")
          .or(`slug.eq.${slug},draft_slug.eq.${slug}`)
          .maybeSingle();

        if (postError) throw postError;
        if (postData) {
          // Use draft values with fallback to published values
          const transformedPost: BlogPost = {
            id: postData.id,
            title: postData.draft_title ?? postData.title,
            slug: postData.draft_slug ?? postData.slug,
            excerpt: postData.draft_excerpt ?? postData.excerpt ?? "",
            category: postData.draft_category ?? postData.category ?? "",
            content_blocks: (postData.draft_content_blocks ?? postData.content_blocks ?? []) as unknown as ContentBlock[],
            published_at: postData.published_at ?? "",
            published: postData.published ?? false,
            featured_image_id: postData.draft_featured_image_id ?? postData.featured_image_id,
            meta_title: postData.draft_meta_title ?? postData.meta_title,
            meta_description: postData.draft_meta_description ?? postData.meta_description,
            faq_title: (postData as any).draft_faq_title ?? (postData as any).faq_title ?? "Domande Frequenti",
            faq_items: ((postData as any).draft_faq_items ?? (postData as any).faq_items ?? []) as FAQItem[],
          };
          setPost(transformedPost);

          // Fetch cover image - prioritize draft image
          const imageId = postData.draft_featured_image_id ?? postData.featured_image_id;
          if (imageId) {
            const { data: media } = await supabase
              .from("media")
              .select("file_path")
              .eq("id", imageId)
              .maybeSingle();
            if (media) setCoverImageUrl(media.file_path);
          }
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        toast.error("Errore nel caricamento dell'articolo");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, authorized]);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      if (!authorized) return;
      
      try {
        const { data: sectionData, error: sectionError } = await supabase
          .from("homepage_sections")
          .select("content")
          .eq("id", "featured_products")
          .maybeSingle();

        if (sectionError) throw sectionError;

        if (sectionData?.content) {
          const content = sectionData.content as any;
          setFeaturedProductsContent({
            heading: content.heading || "I microgreens più ricercati",
            subtitle: content.subtitle || "",
            button_text: content.button_text || "Visualizza tutti i prodotti",
            button_link: content.button_link || "/microgreens",
            product_slugs: content.product_slugs || [],
          });

          if (content.product_slugs && content.product_slugs.length > 0) {
            const { data: products, error: productsError } = await supabase
              .from("products")
              .select("id, name, slug, description, grid_description, category, benefits, uses, image_id")
              .in("slug", content.product_slugs)
              .eq("published", true);

            if (productsError) throw productsError;
            
            const sortedProducts = content.product_slugs
              .map((slug: string) => products?.find(p => p.slug === slug))
              .filter(Boolean) as Product[];
            
            setFeaturedProducts(sortedProducts);

            const imageIds = sortedProducts
              .map(p => p.image_id)
              .filter((id): id is string => !!id);
            
            if (imageIds.length > 0) {
              const { data: mediaData } = await supabase
                .from("media")
                .select("id, file_path, width, height")
                .in("id", imageIds);
              
              if (mediaData) {
                const mediaMap: Record<string, { file_path: string; width?: number; height?: number }> = {};
                mediaData.forEach(m => {
                  mediaMap[m.id] = {
                    file_path: m.file_path,
                    width: m.width,
                    height: m.height,
                  };
                });
                setProductMediaMap(mediaMap);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    };

    fetchFeaturedProducts();
  }, [authorized]);

  const calculateReadTime = (blocks: ContentBlock[]) => {
    const wordsPerMinute = 200;
    let totalWords = 0;
    blocks?.forEach((block) => {
      if (block.content) {
        const text = block.content.replace(/<[^>]*>/g, "");
        totalWords += text.split(/\s+/).length;
      }
    });
    return Math.ceil(totalWords / wordsPerMinute);
  };

  if (!authorized) return null;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Caricamento anteprima...</p>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Articolo non trovato</h1>
            <Button onClick={() => navigate("/admin/blog")}>Torna al Blog</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const readTime = calculateReadTime(post.content_blocks);
  const faqItems = post.faq_items || [];

  return (
    <Layout>
      <Helmet>
        <title>Anteprima: {post.meta_title || post.title}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Preview Banner */}
      <div className="bg-yellow-500 text-yellow-900 py-2 px-4 text-center sticky top-0 z-50">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">
            Modalità Anteprima {!post.published && "- Questo articolo non è pubblicato"}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-4 bg-white hover:bg-yellow-50"
            onClick={() => navigate(`/admin/blog/${post.id}`)}
          >
            Torna all'editor
          </Button>
        </div>
      </div>

      <article className="min-h-screen">
        {/* Hero Section */}
        <section 
          className="relative min-h-[60vh] flex items-center justify-center"
          style={coverImageUrl ? { 
            backgroundImage: `url(${coverImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          <div className={`absolute inset-0 ${coverImageUrl ? 'bg-black/60' : 'bg-gradient-hero'}`}></div>
          
          <div className="relative z-10 container-width py-16">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="mb-8">
                <Button variant="outline" size="sm" asChild className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Link to="/blog" className="inline-flex items-center">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Torna al Blog
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                {post.category && (
                  <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white">
                    {post.category}
                  </Badge>
                )}
                <div className="flex items-center text-sm text-white/80 gap-4">
                  {post.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(post.published_at), "d MMMM yyyy", { locale: it })}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {readTime} min di lettura
                  </span>
                </div>
              </div>

              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>

              {post.excerpt && (
                <div 
                  className="font-body text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto prose prose-xl prose-invert max-w-none [&_a]:text-oro-primary [&_a]:underline [&_p]:my-2"
                  dangerouslySetInnerHTML={{ __html: post.excerpt }}
                />
              )}
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container-width">
            <div className="max-w-3xl mx-auto">
              <ContentBlockRenderer blocks={post.content_blocks} />

              <Card className="bg-gradient-subtle border-border/50 text-center p-8 mt-16">
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                  Prova i Nostri Microgreens
                </h3>
                <p className="font-body text-muted-foreground mb-6">
                  Scopri tutta la potenza nutrizionale dei microgreens Verde D'Oro, 
                  coltivati con passione a Reggio Emilia.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="verde" size="lg" asChild>
                    <Link to="/microgreens">Esplora i Prodotti</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {faqItems.length > 0 && (
          <section className="py-16 md:py-20 bg-secondary/30">
            <div className="container-width">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-verde-primary/10 mb-4">
                    <HelpCircle className="w-8 h-8 text-verde-primary" />
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    {post.faq_title || "Domande Frequenti"}
                  </h2>
                </div>
                
                <Accordion type="single" collapsible className="space-y-4">
                  {faqItems.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="border-2 border-verde-primary/20 rounded-xl px-6 bg-gradient-to-br from-verde-primary/5 to-transparent shadow-sm hover:shadow-md hover:border-verde-primary/30 transition-all duration-300"
                    >
                      <AccordionTrigger className="text-left font-display text-lg font-semibold text-primary hover:no-underline py-5 [&[data-state=open]]:text-verde-primary">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="border-t border-verde-primary/10 pt-4">
                          <div 
                            className={proseClasses}
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        )}

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="section-padding bg-secondary shadow-[inset_0_4px_12px_-4px_rgba(0,0,0,0.06)]">
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
                {featuredProducts.map((product, index) => {
                  const imageId = product.image_id;
                  const mediaInfo = imageId && productMediaMap[imageId] ? productMediaMap[imageId] : null;
                  const productImage = mediaInfo?.file_path || "/placeholder.svg";
                  const optimizedUrl = mediaInfo?.optimized_versions?.productCard?.url;
                  const gridDesc = product.grid_description;
                  
                  return (
                    <ProductCard 
                      key={product.id} 
                      name={product.name} 
                      category={product.category || ""} 
                      description={product.description || ""} 
                      gridDescription={gridDesc || undefined} 
                      benefits={product.benefits || []} 
                      uses={product.uses || []} 
                      image={productImage} 
                      slug={product.slug} 
                      priority={index < 3}
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
      </article>
    </Layout>
  );
};

export default BlogPreview;
