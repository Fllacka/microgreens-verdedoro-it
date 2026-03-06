import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Layout from "@/components/Layout";
import { ContentBlockRenderer } from "@/components/ContentBlockRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Calendar, Clock, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  combineSchemas,
  stripHtmlTags,
} from "@/lib/seo";
import ProductCard from "@/components/ProductCard";

import ArticleCard from "@/components/ArticleCard";

interface ContentBlock {
  id: string;
  type: "heading" | "text" | "image" | "table";
  level?: "h1" | "h2" | "h3";
  content?: string;
  url?: string;
  alt?: string;
  tableData?: {
    rows: {
      content: string;
      isBold?: boolean;
      isHighlighted?: boolean;
    }[][];
    hasHeaderRow?: boolean;
  };
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
  featured_image_id?: string | null;
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  canonical_url?: string;
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
const proseClasses =
  "prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-verde-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-verde-light [&_p]:!my-2 md:[&_p]:!my-3 [&_p]:min-h-[1em] [&_p:empty]:min-h-[1em] [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:!mt-4 md:[&_h2]:!mt-5 [&_h2]:!mb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:!mt-3 md:[&_h3]:!mt-4 [&_h3]:!mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:!mt-3 [&_h4]:!mb-1 prose-headings:font-display prose-headings:text-primary prose-p:text-muted-foreground prose-strong:text-primary";

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [relatedMediaMap, setRelatedMediaMap] = useState<Record<string, string>>({});

  // Featured products state
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredProductsContent, setFeaturedProductsContent] = useState({
    heading: "I microgreens più ricercati",
    subtitle:
      "Scopri i microgreens più richiesti. Trova la varietà che fa per te adatta al tuo utilizzo in cucina per dare un tocco speciale ai tuoi piatti.",
    button_text: "Visualizza tutti i prodotti",
    button_link: "/microgreens",
    product_slugs: [] as string[],
  });
  const [productMediaMap, setProductMediaMap] = useState<
    Record<string, { file_path: string; blurhash?: string; width?: number; height?: number; optimized_versions?: any }>
  >({});

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        // Fetch the blog post by slug
        const { data: postData, error: postError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle();

        if (postError) throw postError;
        if (!postData) {
          setPost(null);
          return;
        }

        setPost({
          ...postData,
          content_blocks: (postData.content_blocks as unknown as ContentBlock[]) || [],
          faq_title: (postData as any).faq_title || "Domande Frequenti",
          faq_items: ((postData as any).faq_items as FAQItem[]) || [],
        } as BlogPost);

        // Fetch cover image if exists
        if (postData.featured_image_id) {
          const { data: media } = await supabase
            .from("media")
            .select("file_path")
            .eq("id", postData.featured_image_id)
            .maybeSingle();
          if (media) setCoverImageUrl(media.file_path);
        }

        // Fetch related posts from the same category
        const { data: relatedData, error: relatedError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("category", postData.category)
          .eq("published", true)
          .neq("id", postData.id)
          .limit(3);

        if (relatedError) throw relatedError;
        const related =
          (relatedData?.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || "",
            category: post.category || "",
            content_blocks: (post.content_blocks as unknown as ContentBlock[]) || [],
            published_at: post.published_at || "",
            featured_image_id: post.featured_image_id,
            meta_title: post.meta_title,
            meta_description: post.meta_description,
            og_title: post.og_title,
            og_description: post.og_description,
            canonical_url: post.canonical_url,
            faq_title: (post as any).faq_title,
            faq_items: ((post as any).faq_items as FAQItem[]) || [],
          })) as BlogPost[]) || [];
        setRelatedPosts(related);

        // Fetch cover images for related posts
        const relatedImageIds = related.map((p) => p.featured_image_id).filter((id): id is string => !!id);
        if (relatedImageIds.length > 0) {
          const { data: relatedMedia } = await supabase.from("media").select("id, file_path").in("id", relatedImageIds);
          if (relatedMedia) {
            const map: Record<string, string> = {};
            relatedMedia.forEach((m) => {
              map[m.id] = m.file_path;
            });
            setRelatedMediaMap(map);
          }
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Fetch featured products (same as CosaSonoMicrogreens)
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // Fetch featured products config from homepage_sections
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

          // Fetch products by slugs if available
          if (content.product_slugs && content.product_slugs.length > 0) {
            const { data: products, error: productsError } = await supabase
              .from("products")
              .select("id, name, slug, description, grid_description, category, benefits, uses, image_id")
              .in("slug", content.product_slugs)
              .eq("published", true);

            if (productsError) throw productsError;

            // Sort products by the order in product_slugs
            const sortedProducts = content.product_slugs
              .map((slug: string) => products?.find((p) => p.slug === slug))
              .filter(Boolean) as Product[];

            setFeaturedProducts(sortedProducts);

            // Fetch media for products
            const imageIds = sortedProducts.map((p) => p.image_id).filter((id): id is string => !!id);

            if (imageIds.length > 0) {
              const { data: mediaData } = await supabase
                .from("media")
                .select("id, file_path, blurhash, width, height, optimized_versions")
                .in("id", imageIds);

              if (mediaData) {
                const mediaMap: Record<string, any> = {};
                mediaData.forEach((m) => {
                  mediaMap[m.id] = {
                    file_path: m.file_path,
                    blurhash: m.blurhash,
                    width: m.width,
                    height: m.height,
                    optimized_versions: m.optimized_versions,
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
  }, []);

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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Caricamento...</p>
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
            <Button asChild>
              <Link to="/blog">Torna al Blog</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const readTime = calculateReadTime(post.content_blocks);
  const faqItems = post.faq_items || [];

  // Calculate word count for structured data
  const wordCount =
    post.content_blocks?.reduce((total, block) => {
      if (block.content) {
        const text = block.content.replace(/<[^>]*>/g, "");
        return total + text.split(/\s+/).length;
      }
      return total;
    }, 0) || 0;

  // Generate structured data
  const articleSchema = generateArticleSchema({
    title: post.title,
    description: stripHtmlTags(post.excerpt) || post.meta_description || "",
    slug: post.slug,
    publishedAt: post.published_at,
    updatedAt: (post as any).updated_at || post.published_at,
    image: coverImageUrl || undefined,
    category: post.category,
    wordCount,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  // Generate FAQ schema if FAQs exist
  const faqSchema =
    faqItems.length > 0
      ? generateFAQSchema(
          faqItems.map((faq) => ({
            question: faq.question,
            answer: stripHtmlTags(faq.answer),
          })),
        )
      : null;

  const allSchemas = faqSchema
    ? combineSchemas(articleSchema, breadcrumbSchema, faqSchema)
    : combineSchemas(articleSchema, breadcrumbSchema);

  return (
    <Layout>
      <Helmet>
        <title>{post.meta_title || post.title}</title>
        <meta name="description" content={post.meta_description || stripHtmlTags(post.excerpt)} />
        <link rel="canonical" href={`${window.location.origin}${post.canonical_url || `/blog/${post.slug}`}`} />
        <meta property="og:title" content={post.og_title || post.meta_title || post.title} />
        <meta
          property="og:description"
          content={post.og_description || post.meta_description || stripHtmlTags(post.excerpt)}
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}/blog/${post.slug}`} />
        <meta property="og:locale" content="it_IT" />
        <meta property="article:published_time" content={post.published_at} />
        {post.category && <meta property="article:section" content={post.category} />}
        {coverImageUrl && <meta property="og:image" content={coverImageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.og_title || post.meta_title || post.title} />
        <meta
          name="twitter:description"
          content={post.og_description || post.meta_description || stripHtmlTags(post.excerpt)}
        />
        {coverImageUrl && <meta name="twitter:image" content={coverImageUrl} />}
        <script type="application/ld+json">{JSON.stringify(allSchemas)}</script>
      </Helmet>

      <article className="min-h-screen">
        {/* Hero Section */}
        <section
          className="relative min-h-[60vh] flex items-center justify-center"
          style={
            coverImageUrl
              ? {
                  backgroundImage: `url(${coverImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}
          }
        >
          <div className={`absolute inset-0 ${coverImageUrl ? "bg-black/60" : "bg-gradient-hero"}`}></div>

          <div className="relative z-10 container-width py-16">
            <div className="max-w-4xl mx-auto text-center text-white">
              {/* Breadcrumb */}
              <div className="mb-8">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Link to="/blog" className="inline-flex items-center">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Torna al Blog
                  </Link>
                </Button>
              </div>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                {post.category && (
                  <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white">
                    {post.category}
                  </Badge>
                )}
                <div className="flex items-center text-sm text-white/80 gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(post.published_at), "d MMMM yyyy", { locale: it })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {readTime} min di lettura
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="font-body text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                  {stripHtmlTags(post.excerpt)}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container-width">
            <div className="max-w-3xl mx-auto">
              <ContentBlockRenderer blocks={post.content_blocks} />
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
                          <div className={proseClasses} dangerouslySetInnerHTML={{ __html: faq.answer }} />
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

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="py-16 md:py-24 bg-gradient-subtle">
            <div className="container-width">
              <div className="max-w-6xl mx-auto">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                  Articoli Correlati
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost) => (
                    <ArticleCard
                      key={relatedPost.id}
                      title={relatedPost.title}
                      slug={relatedPost.slug}
                      excerpt={relatedPost.excerpt}
                      category={relatedPost.category}
                      publishedAt={relatedPost.published_at}
                      imageUrl={
                        relatedPost.featured_image_id && relatedMediaMap[relatedPost.featured_image_id]
                          ? relatedMediaMap[relatedPost.featured_image_id]
                          : undefined
                      }
                      buttonText="Leggi articolo"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </article>
    </Layout>
  );
};

export default BlogArticle;
