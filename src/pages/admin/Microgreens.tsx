import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sprout, Search, Tag, Plus, X, GripVertical, FileText, Info, Image } from "lucide-react";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { SEOFields } from "@/components/admin/SEOFields";
import { PublishActionBar } from "@/components/admin/PublishActionBar";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { UnsavedChangesDialog } from "@/components/admin/UnsavedChangesDialog";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";

interface SectionContent {
  [key: string]: any;
}

interface Section {
  id: string;
  content: SectionContent;
  is_visible: boolean;
  sort_order: number;
}

const AdminMicrogreens = () => {
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [originalSections, setOriginalSections] = useState<Record<string, Section>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  const hasUnsavedChanges = JSON.stringify(sections) !== JSON.stringify(originalSections);

  // Unsaved changes warning
  const { isBlocked, proceed, reset } = useUnsavedChangesWarning({
    hasUnsavedChanges,
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("microgreens_sections")
        .select("*")
        .order("sort_order");

      if (error) throw error;

      const sectionsMap: Record<string, Section> = {};
      data?.forEach((section) => {
        sectionsMap[section.id] = section as Section;
      });
      setSections(sectionsMap);
      setOriginalSections(sectionsMap);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Errore nel caricamento delle sezioni");
    } finally {
      setLoading(false);
    }
  };

  const updateSectionContent = (sectionId: string, field: string, value: any) => {
    setSections((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        content: {
          ...prev[sectionId]?.content,
          [field]: value,
        },
      },
    }));
  };

  const updateSectionVisibility = (sectionId: string, isVisible: boolean) => {
    setSections((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        is_visible: isVisible,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [id, section] of Object.entries(sections)) {
        let contentToSave = section.content;
        
        // Filter out empty categories before saving
        if (id === "categories" && section.content?.items) {
          contentToSave = {
            ...section.content,
            items: section.content.items.filter((cat: { name: string }) => cat.name?.trim()),
          };
        }
        
        const { error } = await supabase
          .from("microgreens_sections")
          .update({
            content: contentToSave,
            is_visible: section.is_visible,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;
      }
      toast.success("Modifiche salvate con successo");
    } catch (error) {
      console.error("Error saving sections:", error);
      toast.error("Errore nel salvataggio delle modifiche");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (publish: boolean) => {
    await handleSave();
    setIsPublished(publish);
    toast.success(publish ? "Pagina pubblicata con successo" : "Pagina rimossa dalla pubblicazione");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>Caricamento...</p>
        </div>
      </AdminLayout>
    );
  }

  const seoSection = sections["seo"];
  const heroSection = sections["hero"];
  const infoSection = sections["info"];
  const categoriesSection = sections["categories"];

  const seoValues = {
    slug: "/microgreens",
    metaTitle: seoSection?.content?.meta_title || "",
    metaDescription: seoSection?.content?.meta_description || "",
    ogTitle: seoSection?.content?.og_title || "",
    ogDescription: seoSection?.content?.og_description || "",
    canonicalUrl: seoSection?.content?.canonical_url || "",
    robots: seoSection?.content?.robots || "index, follow",
    changeFrequency: "weekly",
    priority: "0.8",
    structuredData: seoSection?.content?.structured_data ? JSON.stringify(seoSection.content.structured_data, null, 2) : "",
  };

  const handleSEOChange = (field: string, value: string) => {
    if (field === "structuredData") {
      try {
        const parsed = value ? JSON.parse(value) : null;
        updateSectionContent("seo", "structured_data", parsed);
      } catch {
        // Keep as string if invalid JSON
      }
    } else {
      const fieldMap: Record<string, string> = {
        metaTitle: "meta_title",
        metaDescription: "meta_description",
        ogTitle: "og_title",
        ogDescription: "og_description",
        canonicalUrl: "canonical_url",
      };
      updateSectionContent("seo", fieldMap[field] || field, value);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestione Pagina Microgreens</h1>
            <p className="text-muted-foreground">
              Modifica i contenuti della pagina catalogo microgreens
            </p>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">
              <Sprout className="h-4 w-4 mr-2" />
              Contenuto
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Accordion type="multiple" defaultValue={["hero", "categories", "info"]} className="space-y-4">
              {/* Hero Section */}
              <AccordionItem value="hero" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Hero</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>Sezione visibile</Label>
                    <Switch
                      checked={heroSection?.is_visible ?? true}
                      onCheckedChange={(checked) => updateSectionVisibility("hero", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titolo</Label>
                    <Input
                      value={heroSection?.content?.title || ""}
                      onChange={(e) => updateSectionContent("hero", "title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sottotitolo</Label>
                    <RichTextEditor
                      content={heroSection?.content?.subtitle || ""}
                      onChange={(value) => updateSectionContent("hero", "subtitle", value)}
                    />
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <Label className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Immagine di Sfondo (opzionale)
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Se non viene impostata un'immagine, verrà utilizzato il gradiente predefinito.
                    </p>
                    <MediaSelector
                      value={heroSection?.content?.background_image_id || null}
                      onChange={(id) => updateSectionContent("hero", "background_image_id", id)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Categories Section */}
              <AccordionItem value="categories" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Categorie</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>Sezione visibile</Label>
                    <Switch
                      checked={categoriesSection?.is_visible ?? true}
                      onCheckedChange={(checked) => updateSectionVisibility("categories", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titolo sezione</Label>
                    <Input
                      value={categoriesSection?.content?.title || ""}
                      onChange={(e) => updateSectionContent("categories", "title", e.target.value)}
                      placeholder="Esplora per Categoria"
                    />
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Categorie Disponibili</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentCategories = categoriesSection?.content?.items || [];
                          updateSectionContent("categories", "items", [
                            ...currentCategories,
                            { id: crypto.randomUUID(), name: "", slug: "" }
                          ]);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Aggiungi Categoria
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Le categorie aggiunte qui saranno disponibili per la selezione nei prodotti microgreens.
                    </p>
                    
                    {(categoriesSection?.content?.items || []).length === 0 ? (
                      <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed">
                        <Tag className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Nessuna categoria aggiunta</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(categoriesSection?.content?.items || []).map((category: { id: string; name: string; slug: string }, index: number) => (
                          <div key={category.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <Input
                              value={category.name}
                              onChange={(e) => {
                                const items = [...(categoriesSection?.content?.items || [])];
                                items[index] = { 
                                  ...items[index], 
                                  name: e.target.value,
                                  slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                                };
                                updateSectionContent("categories", "items", items);
                              }}
                              placeholder="Nome categoria"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const items = (categoriesSection?.content?.items || []).filter(
                                  (_: any, i: number) => i !== index
                                );
                                updateSectionContent("categories", "items", items);
                              }}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Info Section */}
              <AccordionItem value="info" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Sezione Informazioni</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>Sezione visibile</Label>
                    <Switch
                      checked={infoSection?.is_visible ?? true}
                      onCheckedChange={(checked) => updateSectionVisibility("info", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titolo sezione</Label>
                    <Input
                      value={infoSection?.content?.title || ""}
                      onChange={(e) => updateSectionContent("info", "title", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Feature 1</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label>Titolo</Label>
                          <Input
                            value={infoSection?.content?.feature1_title || ""}
                            onChange={(e) => updateSectionContent("info", "feature1_title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrizione</Label>
                          <RichTextEditor
                            content={infoSection?.content?.feature1_description || ""}
                            onChange={(value) => updateSectionContent("info", "feature1_description", value)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Feature 2</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label>Titolo</Label>
                          <Input
                            value={infoSection?.content?.feature2_title || ""}
                            onChange={(e) => updateSectionContent("info", "feature2_title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrizione</Label>
                          <RichTextEditor
                            content={infoSection?.content?.feature2_description || ""}
                            onChange={(value) => updateSectionContent("info", "feature2_description", value)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Feature 3</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label>Titolo</Label>
                          <Input
                            value={infoSection?.content?.feature3_title || ""}
                            onChange={(e) => updateSectionContent("info", "feature3_title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrizione</Label>
                          <RichTextEditor
                            content={infoSection?.content?.feature3_description || ""}
                            onChange={(value) => updateSectionContent("info", "feature3_description", value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <Label>Immagine sezione</Label>
                    <MediaSelector
                      value={infoSection?.content?.image_id || null}
                      onChange={(id) => updateSectionContent("info", "image_id", id)}
                      showAltText
                      altText={infoSection?.content?.image_alt || ""}
                      onAltTextChange={(alt) => updateSectionContent("info", "image_alt", alt)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <SEOFields values={seoValues} onChange={handleSEOChange} />
          </TabsContent>
        </Tabs>
      </div>

      <PublishActionBar
        isPublished={isPublished}
        isSaving={saving}
        hasChanges={hasUnsavedChanges}
        onSave={handleSave}
        onPublish={handlePublish}
        previewUrl="/preview/microgreens"
      />

      <UnsavedChangesDialog
        isOpen={isBlocked}
        onConfirm={() => proceed?.()}
        onCancel={() => reset?.()}
      />
    </AdminLayout>
  );
};

export default AdminMicrogreens;
