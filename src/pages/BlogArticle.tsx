import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Layout from "@/components/Layout";
import { ContentBlockRenderer } from "@/components/ContentBlockRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Share2, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface ContentBlock {
  id: string;
  type: "heading" | "text" | "image";
  level?: "h1" | "h2" | "h3";
  content?: string;
  url?: string;
  alt?: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  content_blocks: ContentBlock[];
  published_at: string;
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  canonical_url?: string;
}

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

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
          content_blocks: (postData.content_blocks as unknown as ContentBlock[]) || []
        } as BlogPost);

        // Fetch related posts from the same category
        const { data: relatedData, error: relatedError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("category", postData.category)
          .eq("published", true)
          .neq("id", postData.id)
          .limit(3);

        if (relatedError) throw relatedError;
        setRelatedPosts((relatedData?.map(post => ({
          ...post,
          content_blocks: (post.content_blocks as unknown as ContentBlock[]) || []
        })) as BlogPost[]) || []);
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

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

  return (
    <Layout>
      <Helmet>
        <title>{post.meta_title || post.title}</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <meta property="og:title" content={post.og_title || post.title} />
        <meta property="og:description" content={post.og_description || post.excerpt} />
        {post.canonical_url && <link rel="canonical" href={post.canonical_url} />}
      </Helmet>

      <article className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-hero">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          
          <div className="relative z-10 container-width py-16">
            <div className="max-w-4xl mx-auto text-center text-white">
              {/* Breadcrumb */}
              <div className="mb-8">
                <Button variant="outline" size="sm" asChild className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
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
                  {post.excerpt}
                </p>
              )}

              {/* Social Actions */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="sm" className="inline-flex items-center bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Heart className="mr-2 w-4 h-4" />
                  Mi piace
                </Button>
                <Button variant="outline" size="sm" className="inline-flex items-center bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Share2 className="mr-2 w-4 h-4" />
                  Condividi
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container-width">
            <div className="max-w-3xl mx-auto">
              <ContentBlockRenderer blocks={post.content_blocks} />

              {/* Call to Action */}
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
                    <Link to="/microgreens">
                      Esplora i Prodotti
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/microgreens-su-misura">
                      Microgreens su Misura
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

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
                    <Card key={relatedPost.id} className="overflow-hidden hover-lift border-border/50 bg-card group">
                      <div className="h-48 bg-gradient-hero" />
                      <div className="p-6">
                        {relatedPost.category && (
                          <Badge variant="outline" className="text-xs mb-3">
                            {relatedPost.category}
                          </Badge>
                        )}
                        <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                          {relatedPost.title}
                        </h3>
                        <p className="font-body text-muted-foreground text-sm mb-4 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/blog/${relatedPost.slug}`}>
                            Leggi articolo
                          </Link>
                        </Button>
                      </div>
                    </Card>
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