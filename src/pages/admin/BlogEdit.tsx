import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentBlockEditor, ContentBlock } from "@/components/admin/ContentBlockEditor";
import { SEOFields } from "@/components/admin/SEOFields";
import { PublishActionBar } from "@/components/admin/PublishActionBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const AdminBlogEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "",
    tags: "",
    published: false,
    publishedAt: "",
  });

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

  const [seoData, setSeoData] = useState({
    slug: "",
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    canonicalUrl: "",
    robots: "index, follow",
    changeFrequency: "monthly",
    priority: "0.5",
    structuredData: "",
  });

  useEffect(() => {
    if (!isNew) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || "",
        excerpt: data.excerpt || "",
        category: data.category || "",
        tags: data.tags?.join(", ") || "",
        published: data.published || false,
        publishedAt: data.published_at ? data.published_at.split("T")[0] : "",
      });

      if (data.content_blocks && Array.isArray(data.content_blocks) && data.content_blocks.length > 0) {
        setContentBlocks(data.content_blocks as unknown as ContentBlock[]);
      } else if (data.content) {
        setContentBlocks([
          {
            id: crypto.randomUUID(),
            type: "text",
            content: data.content,
          },
        ]);
      }

      setSeoData({
        slug: data.slug || "",
        metaTitle: data.meta_title || "",
        metaDescription: data.meta_description || "",
        ogTitle: data.og_title || "",
        ogDescription: data.og_description || "",
        canonicalUrl: data.canonical_url || "",
        robots: data.robots || "index, follow",
        changeFrequency: data.change_frequency || "monthly",
        priority: data.priority?.toString() || "0.5",
        structuredData: data.structured_data ? JSON.stringify(data.structured_data, null, 2) : "",
      });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare l'articolo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePost = async (publishState?: boolean) => {
    setSaving(true);

    try {
      const postData = {
        title: formData.title,
        slug: seoData.slug,
        excerpt: formData.excerpt,
        content_blocks: contentBlocks as any,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
        published: publishState !== undefined ? publishState : formData.published,
        published_at: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : null,
        meta_title: seoData.metaTitle,
        meta_description: seoData.metaDescription,
        og_title: seoData.ogTitle,
        og_description: seoData.ogDescription,
        canonical_url: seoData.canonicalUrl,
        robots: seoData.robots,
        change_frequency: seoData.changeFrequency,
        priority: parseFloat(seoData.priority),
        structured_data: seoData.structuredData ? JSON.parse(seoData.structuredData) : null,
      };

      if (isNew) {
        const { data, error } = await supabase.from("blog_posts").insert(postData).select().single();
        if (error) throw error;
        toast({
          title: "Successo",
          description: "Articolo creato con successo",
        });
        navigate(`/admin/blog/${data.id}`);
      } else {
        const { error } = await supabase.from("blog_posts").update(postData).eq("id", id);
        if (error) throw error;
        if (publishState !== undefined) {
          setFormData(prev => ({ ...prev, published: publishState }));
        }
        toast({
          title: "Successo",
          description: "Articolo aggiornato con successo",
        });
      }
    } catch (error: any) {
      console.error("Error saving blog post:", error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare l'articolo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await savePost();
  };

  const handlePublish = async (publish: boolean, scheduledDate?: string) => {
    if (scheduledDate) {
      setFormData(prev => ({ ...prev, publishedAt: scheduledDate.split("T")[0] }));
    }
    await savePost(publish);
  };

  if (loading && !isNew) {
    return (
      <AdminLayout>
        <div>Caricamento...</div>
      </AdminLayout>
    );
  }

  const previewUrl = seoData.slug ? `/preview/blog/${seoData.slug}` : undefined;

  return (
    <AdminLayout>
      <div className="space-y-8 pb-24">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/admin/blog")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isNew ? "Nuovo Articolo" : "Modifica Articolo"}</h1>
            <p className="text-muted-foreground">Crea e gestisci i contenuti del blog</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Articolo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titolo Articolo *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Estratto</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Blocchi di Contenuto</Label>
                  <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tag (separati da virgola)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="salute, nutrizione, microgreens"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <SEOFields
              values={seoData}
              onChange={(field, value) => setSeoData({ ...seoData, [field]: value })}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Opzioni</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="publishedAt">Data Pubblicazione</Label>
                  <Input
                    id="publishedAt"
                    type="date"
                    value={formData.publishedAt}
                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Opzionale. Lascia vuoto per nessuna data specifica.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PublishActionBar
        isPublished={formData.published}
        isSaving={saving}
        onSave={handleSave}
        onPublish={handlePublish}
        previewUrl={previewUrl}
      />
    </AdminLayout>
  );
};

export default AdminBlogEdit;
