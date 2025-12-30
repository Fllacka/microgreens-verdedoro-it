import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentBlockEditor, ContentBlock } from "@/components/admin/ContentBlockEditor";
import { SEOFields } from "@/components/admin/SEOFields";
import { PublishActionBar } from "@/components/admin/PublishActionBar";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { UnsavedChangesDialog } from "@/components/admin/UnsavedChangesDialog";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, PenSquare, Search } from "lucide-react";

const AdminBlogEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const initialDataLoaded = useRef(false);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "",
    tags: "",
    published: false,
    publishedAt: "",
    featuredImageId: null as string | null,
  });

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [availableCategories, setAvailableCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

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

  // Unsaved changes warning
  const { isBlocked, proceed, reset } = useUnsavedChangesWarning({
    hasUnsavedChanges: hasChanges,
  });

  // Track changes after initial load
  useEffect(() => {
    if (initialDataLoaded.current) {
      setHasChanges(true);
    }
  }, [formData, contentBlocks, seoData]);

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchPost();
    } else {
      initialDataLoaded.current = true;
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_overview_sections")
        .select("content")
        .eq("id", "categories")
        .maybeSingle();

      if (error) throw error;

      const content = data?.content as { items?: { id: string; name: string; slug: string }[] } | null;
      if (content?.items) {
        setAvailableCategories(content.items);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

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
        featuredImageId: data.featured_image_id || null,
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
      initialDataLoaded.current = true;
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
        featured_image_id: formData.featuredImageId,
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

      // Use createdId if we just created this post (prevents race condition on re-save before navigation)
      const shouldInsert = isNew && !createdId;
      const postId = createdId || id;

      if (shouldInsert) {
        const { data, error } = await supabase.from("blog_posts").insert(postData).select().single();
        if (error) throw error;
        setCreatedId(data.id);
        toast({
          title: "Successo",
          description: "Articolo creato con successo",
        });
        navigate(`/admin/blog/${data.id}`);
      } else {
        const { error } = await supabase.from("blog_posts").update(postData).eq("id", postId);
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
      setHasChanges(false);
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
      <div className="space-y-6 md:space-y-8 pb-28 md:pb-24">
        <div className="flex items-center gap-3 md:gap-4">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/admin/blog")} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-bold truncate">{isNew ? "Nuovo Articolo" : "Modifica Articolo"}</h1>
            <p className="text-muted-foreground text-sm hidden md:block">Crea e gestisci i contenuti del blog</p>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-4 md:space-y-6">
          <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex">
            <TabsTrigger value="content" className="text-xs md:text-sm">
              <PenSquare className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden xs:inline">Contenuto</span>
              <span className="xs:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs md:text-sm">
              <Search className="h-4 w-4 mr-1 md:mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        {availableCategories.filter(c => c.name?.trim()).length > 0 ? (
                          <Select
                            value={formData.category || "none"}
                            onValueChange={(value) => setFormData({ ...formData, category: value === "none" ? "" : value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nessuna categoria</SelectItem>
                              {availableCategories
                                .filter(cat => cat.name?.trim())
                                .map((cat) => (
                                  <SelectItem key={cat.id} value={cat.name}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Aggiungi categorie dal CMS Blog"
                          />
                        )}
                        <p className="text-xs text-muted-foreground">
                          {availableCategories.length === 0 
                            ? "Aggiungi categorie dalla pagina Blog Overview nel CMS." 
                            : "Opzionale - seleziona una categoria."}
                        </p>
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
              </div>

              <div className="space-y-4 md:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Immagine di Copertina</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MediaSelector
                      value={formData.featuredImageId}
                      onChange={(imageId) => setFormData({ ...formData, featuredImageId: imageId })}
                      showAltText={false}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Questa immagine apparirà come copertina dell'articolo e nelle anteprime.
                    </p>
                  </CardContent>
                </Card>

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
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <SEOFields
              values={seoData}
              onChange={(field, value) => setSeoData({ ...seoData, [field]: value })}
            />
          </TabsContent>
        </Tabs>
      </div>

      <PublishActionBar
        isPublished={formData.published}
        isSaving={saving}
        onSave={handleSave}
        onPublish={handlePublish}
        previewUrl={previewUrl}
      />

      <UnsavedChangesDialog
        isOpen={isBlocked}
        onConfirm={() => proceed?.()}
        onCancel={() => reset?.()}
      />
    </AdminLayout>
  );
};

export default AdminBlogEdit;
