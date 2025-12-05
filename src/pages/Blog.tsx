import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Calendar, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ name: string; count: number; color: string }[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
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

      // Calculate categories from posts
      const categoryMap = new Map<string, number>();
      data?.forEach((post) => {
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

  const featuredPost = posts[0];
  const latestPosts = posts.slice(1);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-block bg-oro-primary text-accent-foreground px-4 py-2 rounded-full text-sm font-body font-medium mb-6 animate-fade-in">
                Il Mondo dei Microgreens
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
                Blog di <span className="text-primary">Microgreens</span>
              </h1>
              <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto animate-fade-in">
                Esplora il mondo dei microgreens attraverso ricette originali, guide agli usi culinari, 
                approfondimenti sui benefici nutrizionali e consigli pratici per consumo e conservazione.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="section-padding bg-background">
            <div className="container-width">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                Esplora per Categoria
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {categories.map((category, index) => (
                  <Card key={index} className="hover-lift cursor-pointer border-border/50 bg-card">
                    <CardContent className="p-4 text-center">
                      <Tag className={`w-8 h-8 mx-auto mb-2 ${
                        category.color === 'verde' ? 'text-primary' :
                        category.color === 'oro' ? 'text-accent' : 'text-muted-foreground'
                      }`} />
                      <h3 className="font-body font-semibold text-foreground mb-1">
                        {category.name}
                      </h3>
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
        {featuredPost && (
          <section className="section-padding bg-gradient-subtle">
            <div className="container-width">
              <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
                Articolo in Evidenza
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
        <section className="section-padding bg-background">
          <div className="container-width">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Caricamento articoli...</p>
              </div>
            ) : latestPosts.length > 0 ? (
              <>
                <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
                  Ultimi Articoli
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
                <p className="text-muted-foreground">Nessun articolo disponibile al momento.</p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="section-padding bg-gradient-verde text-white">
          <div className="container-width text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-display text-3xl font-bold mb-4">
                Non Perdere Nessun Articolo
              </h2>
              <p className="font-body mb-8 text-white/90">
                Iscriviti alla nostra newsletter per ricevere le ultime novità, 
                ricette esclusive e consigli pratici direttamente nella tua inbox.
              </p>
              <Button variant="oro" size="lg" className="font-semibold">
                Iscriviti alla Newsletter
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Blog;