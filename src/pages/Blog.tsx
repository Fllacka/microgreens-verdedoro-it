import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import varietiesImage from "@/assets/microgreens-varieties.jpg";
import { generateBreadcrumbSchema } from "@/lib/seo";
import { PageLoading } from "@/components/ui/page-loading";

import ArticleCard from "@/components/ArticleCard";
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  created_at: string;
  content_blocks: any;
  featured_image_id?: string | null;
}
interface SectionContent {
  [key: string]: any;
}
interface Section {
  id: string;
  content: SectionContent;
  is_visible: boolean;
}
const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{
    id: string;
    name: string;
    slug: string;
  }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      // Fetch sections
      const {
        data: sectionsData,
        error: sectionsError
      } = await supabase.from("blog_overview_sections").select("*").order("sort_order");
      if (!sectionsError && sectionsData) {
        const sectionsMap: Record<string, Section> = {};
        sectionsData.forEach(section => {
          sectionsMap[section.id] = section as Section;
        });
        setSections(sectionsMap);
      }

      // Fetch posts
      const {
        data,
        error
      } = await supabase.from("blog_posts").select("*").eq("published", true).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      setPosts(data || []);

      // Fetch cover images for all posts
      const imageIds = data?.map(p => p.featured_image_id).filter((id): id is string => !!id) || [];
      if (imageIds.length > 0) {
        const {
          data: media
        } = await supabase.from("media").select("id, file_path").in("id", imageIds);
        if (media) {
          const map: Record<string, string> = {};
          media.forEach(m => {
            map[m.id] = m.file_path;
          });
          setMediaMap(map);
        }
      }

      // Get categories from CMS configuration
      const categoriesContent = sectionsData?.find(s => s.id === "categories")?.content as {
        items?: {
          id: string;
          name: string;
          slug: string;
        }[];
      } | null;
      if (categoriesContent?.items) {
        // Filter to only show categories that have published posts AND have valid names
        const categoriesWithPosts = categoriesContent.items.filter(cat => cat.name?.trim()) // Filter out empty categories
        .filter(cat => data?.some(post => post.category === cat.name));
        setCategories(categoriesWithPosts);
      }

      // Fetch hero background image if set
      const heroSection = sectionsData?.find(s => s.id === "hero");
      const heroImageId = (heroSection?.content as any)?.background_image_id;
      if (heroImageId) {
        const {
          data: mediaData
        } = await supabase.from("media").select("file_path").eq("id", heroImageId).maybeSingle();
        if (mediaData) {
          setHeroImageUrl(mediaData.file_path);
        }
      }
    } catch (error: any) {
      console.error("Error fetching blog posts:", error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const calculateReadTime = (contentBlocks: any) => {
    if (!contentBlocks || !Array.isArray(contentBlocks)) return "3 min";
    const wordCount = contentBlocks.reduce((total, block) => {
      if (block.type === "text" && block.content) {
        const text = block.content.replace(/<[^>]*>/g, "");
        return total + text.split(/\s+/).length;
      }
      return total;
    }, 0);
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    return `${readTime} min`;
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const seoSection = sections["seo"];
  const heroSection = sections["hero"];
  const categoriesSection = sections["categories"];
  const featuredSection = sections["featured"];
  const latestSection = sections["latest"];
  const newsletterSection = sections["newsletter"];

  // Filter posts by selected category
  const filteredPosts = selectedCategory ? posts.filter(post => post.category === selectedCategory) : posts;
  const currentUrl = window.location.origin + "/blog";
  const canonicalUrl = seoSection?.content?.canonical_url ? `${window.location.origin}${seoSection.content.canonical_url}` : currentUrl;
  if (loading) {
    return <Layout><PageLoading /></Layout>;
  }

  return <Layout>
      <Helmet>
        <title>{seoSection?.content?.meta_title || "Blog - Verde D'Oro"}</title>
        <meta name="description" content={seoSection?.content?.meta_description || "Scopri il mondo dei microgreens: ricette, benefici nutrizionali, consigli per la conservazione e guide pratiche."} />
        <meta name="robots" content={seoSection?.content?.robots || "index, follow"} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoSection?.content?.og_title || "Blog - Verde D'Oro"} />
        <meta property="og:description" content={seoSection?.content?.og_description || "Scopri il mondo dei microgreens"} />
        <meta property="og:type" content="blog" />
        <meta property="og:url" content={currentUrl} />
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbSchema([{
          name: "Home",
          url: "/"
        }, {
          name: "Blog",
          url: "/blog"
        }]))}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        {heroSection?.is_visible !== false && <section className="section-padding relative overflow-hidden">
            {/* Hero Background Image - Optimized for LCP */}
            {heroImageUrl && <img src={heroImageUrl} alt={heroSection?.content?.background_image_alt || "Blog hero background"} className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" loading="eager" width={1920} height={600} decoding="async" />}
            {/* Overlay for background image */}
            {heroImageUrl && <div className="absolute inset-0 bg-gradient-hero" />}
            {/* Gradient fallback when no image */}
            {!heroImageUrl && <div className="absolute inset-0 bg-gradient-subtle" />}
            
            <div className="container-width text-center relative z-10">
              <div className="max-w-4xl mx-auto">
                
                <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
                  {heroSection?.content?.title?.includes("Microgreens") ? <>
                      {heroSection.content.title.split("Microgreens")[0]}
                      <span className="text-primary">Microgreens</span>
                      {heroSection.content.title.split("Microgreens")[1] || ""}
                    </> : <>Blog di <span className="text-primary">Microgreens</span></>}
                </h1>
                <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto animate-fade-in mb-8">
                  {heroSection?.content?.subtitle || "Esplora il mondo dei microgreens attraverso ricette originali, guide agli usi culinari, approfondimenti sui benefici nutrizionali e consigli pratici per consumo e conservazione."}
                </p>

                {/* Category filters in hero */}
                {categories.length > 0 && <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
                    <Button variant={selectedCategory === null ? "verde" : "outline"} size="sm" onClick={() => setSelectedCategory(null)} className="rounded-full">
                      Tutti
                    </Button>
                    {categories.filter(category => category.name && category.name.trim() !== "").map(category => <Button key={category.id} variant={selectedCategory === category.name ? "verde" : "outline"} size="sm" onClick={() => setSelectedCategory(category.name)} className="rounded-full">
                          {category.name}
                        </Button>)}
                  </div>}
              </div>
            </div>
          </section>}

        {/* All Articles */}
        {latestSection?.is_visible !== false && <section className="section-padding bg-background">
            <div className="container-width">
          {loading ? <div className="text-center py-12">
                  <p className="text-muted-foreground">{latestSection?.content?.loading_text || "Caricamento articoli..."}</p>
                </div> : filteredPosts.length > 0 ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map(article => <ArticleCard key={article.id} title={article.title} slug={article.slug} excerpt={article.excerpt} category={article.category} publishedAt={article.created_at} imageUrl={article.featured_image_id && mediaMap[article.featured_image_id] ? mediaMap[article.featured_image_id] : varietiesImage} readTime={calculateReadTime(article.content_blocks)} />)}
                </div> : <div className="text-center py-12">
                  <p className="text-muted-foreground">{latestSection?.content?.empty_text || "Nessun articolo disponibile al momento."}</p>
                </div>}
            </div>
          </section>}

      </div>
    </Layout>;
};
export default Blog;