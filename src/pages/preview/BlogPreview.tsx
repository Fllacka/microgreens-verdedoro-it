import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Layout from "@/components/Layout";
import { ContentBlockRenderer } from "@/components/ContentBlockRenderer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";

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
  published: boolean;
  featured_image_id?: string | null;
  meta_title?: string;
  meta_description?: string;
}

const BlogPreview = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

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
        const { data: postData, error: postError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (postError) throw postError;
        if (postData) {
          setPost({
            ...postData,
            content_blocks: (postData.content_blocks as unknown as ContentBlock[]) || []
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
      </article>
    </Layout>
  );
};

export default BlogPreview;
