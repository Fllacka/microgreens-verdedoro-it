import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SEOFields } from "@/components/admin/SEOFields";
import { PublishActionBar } from "@/components/admin/PublishActionBar";
import { UnsavedChangesDialog } from "@/components/admin/UnsavedChangesDialog";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { ArrowLeft, FileText, Search } from "lucide-react";

export default function PageEdit() {
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
    content: "",
    published: false,
    template: "default",
  });

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
  }, [formData, seoData]);

  useEffect(() => {
    if (!isNew) {
      fetchPage();
    } else {
      initialDataLoaded.current = true;
    }
  }, [id]);

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        // Check if there are draft changes
        const hasDraft = (data as any).has_draft_changes || false;
        setHasDraftChanges(hasDraft);

        // Load draft values if they exist, otherwise use published values
        setFormData({
          title: (data as any).draft_title ?? data.title ?? "",
          content: (data as any).draft_content ?? data.content ?? "",
          published: data.published ?? false,
          template: (data as any).draft_template ?? data.template ?? "default",
        });

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
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      initialDataLoaded.current = true;
    }
  };

  // Save as draft only
  const saveDraft = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const draftData = {
        draft_title: formData.title,
        draft_slug: seoData.slug,
        draft_content: formData.content,
        draft_template: formData.template,
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
      const pageId = createdId || id;

      if (shouldInsert) {
        const insertData = { ...draftData, title: formData.title, slug: seoData.slug, published: false, created_by: user?.id };
        const { data, error } = await supabase.from("pages").insert([insertData]).select().single();
        if (error) throw error;
        setCreatedId(data.id);
        setHasDraftChanges(true);
        toast({ title: "Bozza salvata", description: "Pagina salvata come bozza" });
        navigate(`/admin/pages/${data.id}`);
      } else {
        const { error } = await supabase.from("pages").update(draftData).eq("id", pageId);
        if (error) throw error;
        setHasDraftChanges(true);
        toast({ title: "Bozza salvata", description: "Le modifiche sono state salvate come bozza" });
      }
    } catch (error: any) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
      setHasChanges(false);
    }
  };

  // Publish - copies draft to published fields
  const publishPage = async (publish: boolean) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const pageData = {
        title: formData.title, slug: seoData.slug, content: formData.content, published: publish,
        template: formData.template, meta_title: seoData.metaTitle, meta_description: seoData.metaDescription,
        og_title: seoData.ogTitle, og_description: seoData.ogDescription, canonical_url: seoData.canonicalUrl,
        robots: seoData.robots, change_frequency: seoData.changeFrequency, priority: parseFloat(seoData.priority),
        structured_data: seoData.structuredData ? JSON.parse(seoData.structuredData) : null, created_by: user?.id,
        draft_title: null, draft_slug: null, draft_content: null, draft_template: null,
        draft_meta_title: null, draft_meta_description: null, draft_og_title: null, draft_og_description: null,
        draft_canonical_url: null, draft_robots: null, draft_change_frequency: null, draft_priority: null,
        draft_structured_data: null, has_draft_changes: false,
      };

      const shouldInsert = isNew && !createdId;
      const pageId = createdId || id;

      if (shouldInsert) {
        const { data, error } = await supabase.from("pages").insert([pageData]).select().single();
        if (error) throw error;
        setCreatedId(data.id);
        setFormData(prev => ({ ...prev, published: publish }));
        setHasDraftChanges(false);
        toast({ title: "Successo", description: publish ? "Pagina pubblicata" : "Pubblicazione rimossa" });
        navigate(`/admin/pages/${data.id}`);
      } else {
        const { error } = await supabase.from("pages").update(pageData).eq("id", pageId);
        if (error) throw error;
        setFormData(prev => ({ ...prev, published: publish }));
        setHasDraftChanges(false);
        toast({ title: "Successo", description: publish ? "Pagina pubblicata" : "Pubblicazione rimossa" });
      }
    } catch (error: any) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
      setHasChanges(false);
    }
  };

  const handleSave = async () => { await saveDraft(); };
  const handlePublish = async (publish: boolean) => { await publishPage(publish); };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          Caricamento...
        </div>
      </AdminLayout>
    );
  }

  const previewUrl = seoData.slug ? `/preview/page/${seoData.slug}` : undefined;

  return (
    <AdminLayout>
      <div className="space-y-6 pb-24">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/pages")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isNew ? "Nuova Pagina" : "Modifica Pagina"}
            </h1>
            <p className="text-muted-foreground">Crea e gestisci i contenuti della pagina</p>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">
              <FileText className="h-4 w-4 mr-2" />
              Contenuto
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Pagina</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titolo *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contenuto</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) =>
                      setFormData({ ...formData, content })
                    }
                  />
                </div>
              </CardContent>
            </Card>
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
}
