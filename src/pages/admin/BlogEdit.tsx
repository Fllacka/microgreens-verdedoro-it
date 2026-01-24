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
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
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

      // Check if there are draft changes
      const hasDraft = (data as any).has_draft_changes || false;
      setHasDraftChanges(hasDraft);

      // Load draft values if they exist, otherwise use published values
      setFormData({
        title: (data as any).draft_title ?? data.title ?? "",
        excerpt: (data as any).draft_excerpt ?? data.excerpt ?? "",
        category: (data as any).draft_category ?? data.category ?? "",
        tags: ((data as any).draft_tags ?? data.tags)?.join(", ") ?? "",
        published: data.published ?? false,
        publishedAt: data.published_at ? data.published_at.split("T")[0] : "",
        featuredImageId: (data as any).draft_featured_image_id ?? data.featured_image_id ?? null,
      });

      // Load draft content blocks if they exist
      const draftBlocks = (data as any).draft_content_blocks;
      const publishedBlocks = data.content_blocks;
      
      if (draftBlocks && Array.isArray(draftBlocks) && draftBlocks.length > 0) {
        setContentBlocks(draftBlocks as unknown as ContentBlock[]);
      } else if (publishedBlocks && Array.isArray(publishedBlocks) && publishedBlocks.length > 0) {
        setContentBlocks(publishedBlocks as unknown as ContentBlock[]);
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
        slug: (data as any).draft_slug ?? data.slug ?? "",
        metaTitle: (data as any).draft_meta_title ?? data.meta_title ?? "",
        metaDescription: (data as any).draft_meta_description ?? data.meta_description ?? "",
        ogTitle: (data as any).draft_og_title ?? data.og_title ?? "",
        ogDescription: (data as any).draft_og_description ?? data.og_description ?? "",
        canonicalUrl: (data as any).draft_canonical_url ?? data.canonical_url ?? "",
        robots: (data as any).draft_robots ?? data.robots ?? "index, follow",
        changeFrequency: (data as any).draft_change_frequency ?? data.change_frequency ?? "monthly",
        priority: ((data as any).draft_priority ?? data.priority)?.toString() ?? "0.5",
        structuredData: ((data as any).draft_structured_data ?? data.structured_data) ? JSON.stringify((data as any).draft_structured_data ?? data.structured_data, null, 2) : "",
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

  // Save as draft only - does not publish
  const saveDraft = async () => {
    setSaving(true);

    try {
      const draftData = {
        draft_title: formData.title,
        draft_slug: seoData.slug,
        draft_excerpt: formData.excerpt,
        draft_content_blocks: contentBlocks as any,
        draft_category: formData.category,
        draft_tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
        draft_featured_image_id: formData.featuredImageId,
        draft_meta_title: seoData.metaTitle,
        draft_meta_description: seoData.metaDescription,
        draft_og_title: seoData.ogTitle,
        draft_og_description: seoData.ogDescription,
        draft_canonical_url: seoData.canonicalUrl,
        draft_robots: seoData.robots,
        draft_change_frequency: seoData.changeFrequency,
        draft_priority: parseFloat(seoData.priority),
        draft_structured_data: seoData.structuredData ? JSON.parse(seoData.structuredData) : null,
        has_draft_changes: true,
      };

      const shouldInsert = isNew && !createdId;
      const postId = createdId || id;

      if (shouldInsert) {
        const insertData = {
          ...draftData,
          title: formData.title,
          slug: seoData.slug,
          published: false,
        };
        const { data, error } = await supabase.from("blog_posts").insert(insertData).select().single();
        if (error) throw error;
        setCreatedId(data.id);
        setHasDraftChanges(true);
        toast({
          title: "Bozza salvata",
          description: "Articolo salvato come bozza",
        });
        navigate(`/admin/blog/${data.id}`);
      } else {
        const { error } = await supabase.from("blog_posts").update(draftData).eq("id", postId);
        if (error) throw error;
        setHasDraftChanges(true);
        toast({
          title: "Bozza salvata",
          description: "Le modifiche sono state salvate come bozza",
        });
      }
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare la bozza",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setHasChanges(false);
    }
  };

  // Publish - copies draft to published fields
  const publishPost = async (publish: boolean, scheduledDate?: string) => {
    setSaving(true);

    try {
      const postData = {
        // Published fields
        title: formData.title,
        slug: seoData.slug,
        excerpt: formData.excerpt,
        content_blocks: contentBlocks as any,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
        published: publish,
        published_at: scheduledDate ? new Date(scheduledDate).toISOString() : (formData.publishedAt ? new Date(formData.publishedAt).toISOString() : new Date().toISOString()),
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
        // Clear draft fields
        draft_title: null,
        draft_slug: null,
        draft_excerpt: null,
        draft_content_blocks: null,
        draft_category: null,
        draft_tags: null,
        draft_featured_image_id: null,
        draft_meta_title: null,
        draft_meta_description: null,
        draft_og_title: null,
        draft_og_description: null,
        draft_canonical_url: null,
        draft_robots: null,
        draft_change_frequency: null,
        draft_priority: null,
        draft_structured_data: null,
        has_draft_changes: false,
      };

      const shouldInsert = isNew && !createdId;
      const postId = createdId || id;

      if (shouldInsert) {
        const { data, error } = await supabase.from("blog_posts").insert(postData).select().single();
        if (error) throw error;
        setCreatedId(data.id);
        setFormData(prev => ({ ...prev, published: publish }));
        setHasDraftChanges(false);
        toast({
          title: "Successo",
          description: publish ? "Articolo pubblicato con successo" : "Articolo rimosso dalla pubblicazione",
        });
        navigate(`/admin/blog/${data.id}`);
      } else {
        const { error } = await supabase.from("blog_posts").update(postData).eq("id", postId);
        if (error) throw error;
        setFormData(prev => ({ ...prev, published: publish }));
        setHasDraftChanges(false);
        toast({
          title: "Successo",
          description: publish ? "Articolo pubblicato con successo" : "Articolo rimosso dalla pubblicazione",
        });
      }
    } catch (error: any) {
      console.error("Error publishing post:", error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile pubblicare l'articolo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setHasChanges(false);
    }
  };

  const handleSave = async () => {
    await saveDraft();
  };

  const handlePublish = async (publish: boolean, scheduledDate?: string) => {
    await publishPost(publish, scheduledDate);
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
        hasChanges={hasChanges}
        hasDraftChanges={hasDraftChanges}
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
