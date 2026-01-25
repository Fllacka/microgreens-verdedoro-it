import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  meta_title?: string;
  meta_description?: string;
}

const PagePreview = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

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
    const fetchPage = async () => {
      if (!slug || !authorized) return;

      try {
        // Fetch page WITHOUT published filter for preview
        const { data: pageData, error: pageError } = await supabase
          .from("pages")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (pageError) throw pageError;
        if (pageData) {
          // Use draft values with fallback to published values
          const transformedPage: Page = {
            id: pageData.id,
            title: pageData.draft_title ?? pageData.title,
            slug: pageData.draft_slug ?? pageData.slug,
            content: pageData.draft_content ?? pageData.content ?? "",
            published: pageData.published ?? false,
            meta_title: pageData.draft_meta_title ?? pageData.meta_title,
            meta_description: pageData.draft_meta_description ?? pageData.meta_description,
          };
          setPage(transformedPage);
        }
      } catch (error) {
        console.error("Error fetching page:", error);
        toast.error("Errore nel caricamento della pagina");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, authorized]);

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

  if (!page) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Pagina non trovata</h1>
            <Button onClick={() => navigate("/admin/pages")}>Torna alle Pagine</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Anteprima: {page.meta_title || page.title}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Preview Banner */}
      <div className="bg-yellow-500 text-yellow-900 py-2 px-4 text-center sticky top-0 z-50">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">
            Modalità Anteprima {!page.published && "- Questa pagina non è pubblicata"}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-4 bg-white hover:bg-yellow-50"
            onClick={() => navigate(`/admin/pages/${page.id}`)}
          >
            Torna all'editor
          </Button>
        </div>
      </div>

      {/* Page Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-8">
            {page.title}
          </h1>
          {page.content && (
            <div 
              className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-primary prose-p:text-muted-foreground prose-a:text-verde-primary"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          )}
        </div>
      </section>
    </Layout>
  );
};

export default PagePreview;
