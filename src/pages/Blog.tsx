import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import varietiesImage from "@/assets/microgreens-varieties.jpg";

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
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("blog_overview_sections")
        .select("*")
        .order("sort_order");

      if (!sectionsError && sectionsData) {
        const sectionsMap: Record<string, Section> = {};
        sectionsData.forEach((section) => {
          sectionsMap[section.id] = section as Section;
        });
        setSections(sectionsMap);
      }

      // Fetch posts
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPosts(data || []);

      // Fetch cover images for all posts
      const imageIds = data
        ?.map(p => p.featured_image_id)
        .filter((id): id is string => !!id) || [];
      if (imageIds.length > 0) {
        const { data: media } = await supabase
          .from("media")
          .select("id, file_path")
          .in("id", imageIds);
        if (media) {
          const map: Record<string, string> = {};
          media.forEach(m => { map[m.id] = m.file_path; });
          setMediaMap(map);
        }
      }

      // Get categories from CMS configuration
      const categoriesContent = sectionsData?.find(s => s.id === "categories")?.content as { items?: { id: string; name: string; slug: string }[] } | null;
      if (categoriesContent?.items) {
        // Filter to only show categories that have published posts AND have valid names
        const categoriesWithPosts = categoriesContent.items
          .filter(cat => cat.name?.trim()) // Filter out empty categories
          .filter(cat => data?.some(post => post.category === cat.name));
        setCategories(categoriesWithPosts);
      }

      // Fetch hero background image if set
      const heroSection = sectionsData?.find(s => s.id === "hero");
      const heroImageId = (heroSection?.content as any)?.background_image_id;
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
    } catch (error: any) {
      console.error("Error fetching blog posts:", error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive",
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
    return date.toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" });
  };

  const seoSection = sections["seo"];
  const heroSection = sections["hero"];
  const categoriesSection = sections["categories"];
  const featuredSection = sections["featured"];
  const latestSection = sections["latest"];
  const newsletterSection = sections["newsletter"];

  // Filter posts by selected category
  const filteredPosts = selectedCategory 
    ? posts.filter(post => post.category === selectedCategory)
    : posts;

  const featuredPost = filteredPosts[0];
  const latestPosts = filteredPosts.slice(1);

  const currentUrl = window.location.origin + "/blog";
  const canonicalUrl = seoSection?.content?.canonical_url
    ? `${window.location.origin}${seoSection.content.canonical_url}`
    : currentUrl;

  return (
    <Layout>
      <Helmet>
        <title>{seoSection?.content?.meta_title || "Blog - Verde D'Oro"}</title>
        <meta
          name="description"
          content={seoSection?.content?.meta_description || "Scopri il mondo dei microgreens: ricette, benefici nutrizionali, consigli per la conservazione e guide pratiche."}
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

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        {heroSection?.is_visible !== false && (
          <section 
            className="section-padding relative"
            style={heroImageUrl ? { 
              backgroundImage: `url(${heroImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : undefined}
          >
            {/* Overlay for background image */}
            {heroImageUrl && (
              <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
            )}
            {/* Gradient fallback when no image */}
            {!heroImageUrl && (
              <div className="absolute inset-0 bg-gradient-subtle" />
            )}
            
            <div className="container-width text-center relative z-10">
              <div className="max-w-4xl mx-auto">
                <div className="inline-block bg-oro-primary text-accent-foreground px-4 py-2 rounded-full text-sm font-body font-medium mb-6 animate-fade-in">
                  {heroSection?.content?.badge || "Il Mondo dei Microgreens"}
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
                  {heroSection?.content?.title?.includes("Microgreens") ? (
                    <>
                      {heroSection.content.title.split("Microgreens")[0]}
                      <span className="text-primary">Microgreens</span>
                      {heroSection.content.title.split("Microgreens")[1] || ""}
                    </>
                  ) : (
                    <>Blog di <span className="text-primary">Microgreens</span></>
                  )}
                </h1>
                <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto animate-fade-in mb-8">
                  {heroSection?.content?.subtitle || "Esplora il mondo dei microgreens attraverso ricette originali, guide agli usi culinari, approfondimenti sui benefici nutrizionali e consigli pratici per consumo e conservazione."}
                </p>

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
                    {categories
                      .filter((category) => category.name && category.name.trim() !== "")
                      .map((category) => (
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
            </div>
          </section>
        )}

        {/* Featured Article */}
        {featuredSection?.is_visible !== false && featuredPost && (
          <section className="section-padding bg-gradient-subtle">
            <div className="container-width">
              <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
                {featuredSection?.content?.title || "Articolo in Evidenza"}
              </h2>
              <Card className="overflow-hidden hover-lift border-border/50 bg-card max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-0">
                  <div 
                    className="h-64 md:h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${featuredPost.featured_image_id && mediaMap[featuredPost.featured_image_id] ? mediaMap[featuredPost.featured_image_id] : varietiesImage})` }}
                  />
                  <CardContent className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                      {featuredPost.category && (
                        <Badge variant="outline" className="text-xs">
                          {featuredPost.category}
                        </Badge>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(featuredPost.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {calculateReadTime(featuredPost.content_blocks)}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                      {featuredPost.title}
                    </h3>
                    <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <Button variant="verde" className="inline-flex items-center w-fit" asChild>
                      <Link to={`/blog/${featuredPost.slug}`}>
                        Leggi l'articolo
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Latest Articles */}
        {latestSection?.is_visible !== false && (
          <section className="section-padding bg-background">
            <div className="container-width">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{latestSection?.content?.loading_text || "Caricamento articoli..."}</p>
                </div>
              ) : latestPosts.length > 0 ? (
                <>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
                    {latestSection?.content?.title || "Ultimi Articoli"}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {latestPosts.map((article) => (
                      <Card key={article.id} className="overflow-hidden hover-lift border-border/50 bg-card">
                        <div 
                          className="h-48 bg-cover bg-center"
                          style={{ backgroundImage: `url(${article.featured_image_id && mediaMap[article.featured_image_id] ? mediaMap[article.featured_image_id] : varietiesImage})` }}
                        />
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            {article.category && (
                              <Badge variant="outline" className="text-xs">
                                {article.category}
                              </Badge>
                            )}
                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                              <Clock className="w-3 h-3" />
                              {calculateReadTime(article.content_blocks)}
                            </div>
                          </div>
                          <h3 className="font-display text-lg font-semibold text-foreground mb-3 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="font-body text-muted-foreground text-sm mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(article.created_at)}
                            </span>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/blog/${article.slug}`}>
                                Leggi
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{latestSection?.content?.empty_text || "Nessun articolo disponibile al momento."}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Newsletter Signup */}
        {newsletterSection?.is_visible !== false && (
          <section className="section-padding bg-gradient-verde text-white">
            <div className="container-width text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="font-display text-3xl font-bold mb-4">
                  {newsletterSection?.content?.title || "Non Perdere Nessun Articolo"}
                </h2>
                <p className="font-body mb-8 text-white/90">
                  {newsletterSection?.content?.subtitle || "Iscriviti alla nostra newsletter per ricevere le ultime novità, ricette esclusive e consigli pratici direttamente nella tua inbox."}
                </p>
                <Button variant="oro" size="lg" className="font-semibold">
                  {newsletterSection?.content?.button_text || "Iscriviti alla Newsletter"}
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Blog;