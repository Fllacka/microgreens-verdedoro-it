import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Calendar, Tag, AlertTriangle } from "lucide-react";
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

const BlogOverviewPreview = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ name: string; count: number; color: string }[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<Record<string, Section>>({});
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

      if (sectionsError) throw sectionsError;

      const sectionsMap: Record<string, Section> = {};
      sectionsData?.forEach((section) => {
        // Use draft content with fallback to published content
        sectionsMap[section.id] = {
          id: section.id,
          content: (section.draft_content ?? section.content) as SectionContent,
          is_visible: section.draft_is_visible ?? section.is_visible,
        };
      });
      setSections(sectionsMap);

      // Fetch posts (include unpublished for preview)
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform posts to use draft values
      const transformedPosts = (data || []).map(post => ({
        id: post.id,
        title: post.draft_title ?? post.title,
        slug: post.draft_slug ?? post.slug,
        excerpt: post.draft_excerpt ?? post.excerpt ?? "",
        category: post.draft_category ?? post.category ?? "",
        created_at: post.created_at ?? "",
        content_blocks: post.draft_content_blocks ?? post.content_blocks,
        featured_image_id: post.draft_featured_image_id ?? post.featured_image_id,
      }));
      setPosts(transformedPosts);

      // Fetch cover images - include both published and draft image IDs
      const allImageIds = (data || []).flatMap(p => [
        p.featured_image_id,
        p.draft_featured_image_id
      ]).filter((id): id is string => !!id);
      
      if (allImageIds.length > 0) {
        const uniqueImageIds = [...new Set(allImageIds)];
        const { data: media } = await supabase.from("media").select("id, file_path").in("id", uniqueImageIds);
        if (media) {
          const map: Record<string, string> = {};
          media.forEach(m => { map[m.id] = m.file_path; });
          setMediaMap(map);
        }
      }

      // Calculate categories from transformed posts
      const categoryMap = new Map<string, number>();
      transformedPosts.forEach((post) => {
        if (post.category) {
          categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1);
        }
      });

      const categoriesArray = Array.from(categoryMap.entries()).map(([name, count], index) => ({
        name,
        count,
        color: index % 2 === 0 ? "verde" : "oro",
      }));

      setCategories(categoriesArray);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
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

  const featuredPost = posts[0];
  const latestPosts = posts.slice(1);

  const currentUrl = window.location.origin + "/blog";
  const canonicalUrl = seoSection?.content?.canonical_url
    ? `${window.location.origin}${seoSection.content.canonical_url}`
    : currentUrl;

  return (
    <Layout>
      <Helmet>
        <title>{seoSection?.content?.meta_title || "Blog - Verde D'Oro"}</title>
        <meta name="description" content={seoSection?.content?.meta_description || ""} />
        <meta name="robots" content={seoSection?.content?.robots || "index, follow"} />
        <link rel="canonical" href={canonicalUrl} />
        {seoSection?.content?.og_title && <meta property="og:title" content={seoSection.content.og_title} />}
        {seoSection?.content?.og_description && <meta property="og:description" content={seoSection.content.og_description} />}
      </Helmet>

      {/* Preview Banner */}
      <div className="bg-amber-100 border-b border-amber-300 px-4 py-2">
        <div className="container-width flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Anteprima - Questa è una visualizzazione di anteprima</span>
        </div>
      </div>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        {heroSection?.is_visible !== false && (
          <section className="section-padding bg-gradient-subtle">
            <div className="container-width text-center">
              <div className="max-w-4xl mx-auto">
                <div className="inline-block bg-oro-primary text-accent-foreground px-4 py-2 rounded-full text-sm font-body font-medium mb-6 animate-fade-in">
                  {heroSection?.content?.badge || "Il Mondo dei Microgreens"}
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
                  {heroSection?.content?.title?.split("Microgreens")[0] || "Blog di "}
                  <span className="text-primary">Microgreens</span>
                </h1>
                <div 
                  className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto animate-fade-in prose prose-lg max-w-none [&_a]:text-primary [&_a]:underline [&_p]:my-2"
                  dangerouslySetInnerHTML={{ __html: heroSection?.content?.subtitle || '' }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Categories */}
        {categoriesSection?.is_visible !== false && categories.length > 0 && (
          <section className="section-padding bg-background">
            <div className="container-width">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                {categoriesSection?.content?.title || "Esplora per Categoria"}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {categories.map((category, index) => (
                  <Card key={index} className="hover-lift cursor-pointer border-border/50 bg-card">
                    <CardContent className="p-4 text-center">
                      <Tag className={`w-8 h-8 mx-auto mb-2 ${category.color === 'verde' ? 'text-primary' : 'text-accent'}`} />
                      <h3 className="font-body font-semibold text-foreground mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.count} {category.count === 1 ? 'articolo' : 'articoli'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
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
                        <Badge variant="outline" className="text-xs">{featuredPost.category}</Badge>
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
                    <h3 className="font-display text-2xl font-bold text-foreground mb-4">{featuredPost.title}</h3>
                    <p className="font-body text-muted-foreground mb-6 leading-relaxed">{featuredPost.excerpt}</p>
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
                            {article.category && <Badge variant="outline" className="text-xs">{article.category}</Badge>}
                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                              <Clock className="w-3 h-3" />
                              {calculateReadTime(article.content_blocks)}
                            </div>
                          </div>
                          <h3 className="font-display text-lg font-semibold text-foreground mb-3 line-clamp-2">{article.title}</h3>
                          <p className="font-body text-muted-foreground text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{formatDate(article.created_at)}</span>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/blog/${article.slug}`}>Leggi</Link>
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

        {/* Newsletter */}
        {newsletterSection?.is_visible !== false && (
          <section className="section-padding bg-gradient-verde text-white">
            <div className="container-width text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="font-display text-3xl font-bold mb-4">
                  {newsletterSection?.content?.title || "Non Perdere Nessun Articolo"}
                </h2>
                <div 
                  className="font-body mb-8 text-white/90 prose prose-lg prose-invert max-w-none [&_a]:text-oro-primary [&_a]:underline [&_p]:my-2"
                  dangerouslySetInnerHTML={{ __html: newsletterSection?.content?.subtitle || '' }}
                />
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

export default BlogOverviewPreview;