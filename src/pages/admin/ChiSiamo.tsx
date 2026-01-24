import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Eye, EyeOff, Info, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PublishActionBar } from "@/components/admin/PublishActionBar";
import { SEOFields } from "@/components/admin/SEOFields";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { UnsavedChangesDialog } from "@/components/admin/UnsavedChangesDialog";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";

interface ChiSiamoSection {
  id: string;
  content: Record<string, any>;
  is_visible: boolean;
  sort_order: number;
}

interface DatabaseSection {
  id: string;
  content: Record<string, any>;
  is_visible: boolean;
  sort_order: number;
  draft_content?: Record<string, any> | null;
  draft_is_visible?: boolean | null;
  has_draft_changes?: boolean;
}

const ICON_OPTIONS = [
  { value: "Leaf", label: "Foglia" },
  { value: "Heart", label: "Cuore" },
  { value: "Users", label: "Utenti" },
  { value: "Award", label: "Premio" },
  { value: "Shield", label: "Scudo" },
  { value: "Sprout", label: "Germoglio" },
  { value: "Star", label: "Stella" },
];

const ChiSiamoAdmin = () => {
  const [sections, setSections] = useState<Record<string, ChiSiamoSection>>({});
  const [originalSections, setOriginalSections] = useState<Record<string, ChiSiamoSection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const { toast } = useToast();

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
        .from("chi_siamo_sections")
        .select("*")
        .order("sort_order");

      if (error) throw error;

      const sectionsMap: Record<string, ChiSiamoSection> = {};
      let anyDraftChanges = false;
      data?.forEach((section) => {
        const dbSection = section as unknown as DatabaseSection;
        // Prioritize draft content if available
        sectionsMap[dbSection.id] = {
          id: dbSection.id,
          content: (dbSection.draft_content ?? dbSection.content) as Record<string, any>,
          is_visible: dbSection.draft_is_visible ?? dbSection.is_visible,
          sort_order: dbSection.sort_order,
        };
        if (dbSection.has_draft_changes) anyDraftChanges = true;
      });
      setSections(sectionsMap);
      setOriginalSections(sectionsMap);
      setHasDraftChanges(anyDraftChanges);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSectionContent = (sectionId: string, key: string, value: any) => {
    setSections((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        content: {
          ...prev[sectionId].content,
          [key]: value,
        },
      },
    }));
  };

  const updateSectionVisibility = (sectionId: string, visible: boolean) => {
    setSections((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        is_visible: visible,
      },
    }));
  };

  const updateNestedContent = (sectionId: string, arrayKey: string, index: number, field: string, value: any) => {
    setSections((prev) => {
      const section = prev[sectionId];
      const array = [...(section.content[arrayKey] || [])];
      array[index] = { ...array[index], [field]: value };
      return {
        ...prev,
        [sectionId]: {
          ...section,
          content: {
            ...section.content,
            [arrayKey]: array,
          },
        },
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to draft columns only
      const updates = Object.values(sections).map((section) =>
        supabase
          .from("chi_siamo_sections")
          .update({
            draft_content: section.content,
            draft_is_visible: section.is_visible,
            has_draft_changes: true,
          })
          .eq("id", section.id)
      );

      await Promise.all(updates);
      setOriginalSections(sections);
      setHasDraftChanges(true);

      toast({
        title: "Bozza salvata",
        description: "Le modifiche sono state salvate come bozza",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      // Copy draft to live columns
      const updates = Object.values(sections).map((section) =>
        supabase
          .from("chi_siamo_sections")
          .update({
            content: section.content,
            is_visible: section.is_visible,
            draft_content: null,
            draft_is_visible: null,
            has_draft_changes: false,
          })
          .eq("id", section.id)
      );

      await Promise.all(updates);
      setOriginalSections(sections);
      setHasDraftChanges(false);

      toast({
        title: "Pubblicato",
        description: "Pagina Chi Siamo pubblicata con successo",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndPreview = async () => {
    await handleSave();
    window.open("/preview/chi-siamo", "_blank");
  };

  const seoContent = sections.seo?.content || {};

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const seoValues = {
    slug: "/chi-siamo",
    metaTitle: seoContent.meta_title || "",
    metaDescription: seoContent.meta_description || "",
    ogTitle: seoContent.og_title || "",
    ogDescription: seoContent.og_description || "",
    canonicalUrl: seoContent.canonical_url || "",
    robots: seoContent.robots || "index, follow",
    changeFrequency: "monthly",
    priority: "0.7",
    structuredData: seoContent.structured_data || "",
  };

  const handleSEOChange = (field: string, value: string) => {
    const fieldMap: Record<string, string> = {
      metaTitle: "meta_title",
      metaDescription: "meta_description",
      ogTitle: "og_title",
      ogDescription: "og_description",
      canonicalUrl: "canonical_url",
      structuredData: "structured_data",
    };
    updateSectionContent("seo", fieldMap[field] || field, value);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Chi Siamo</h1>
          <p className="text-muted-foreground">Gestisci i contenuti della pagina Chi Siamo</p>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">
              <Info className="h-4 w-4 mr-2" />
              Contenuto
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Accordion type="multiple" className="space-y-4" defaultValue={["hero"]}>
          {/* Hero Section */}
          {sections.hero && (
            <AccordionItem value="hero" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Hero Section</span>
                  {sections.hero.is_visible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sections.hero.is_visible}
                    onCheckedChange={(checked) => updateSectionVisibility("hero", checked)}
                  />
                  <Label>Sezione visibile</Label>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Titolo</Label>
                    <Input
                      value={sections.hero.content.title || ""}
                      onChange={(e) => updateSectionContent("hero", "title", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Descrizione</Label>
                    <RichTextEditor
                      content={sections.hero.content.description || ""}
                      onChange={(value) => updateSectionContent("hero", "description", value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Testo Pulsante</Label>
                      <Input
                        value={sections.hero.content.button_text || ""}
                        onChange={(e) => updateSectionContent("hero", "button_text", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Link Pulsante</Label>
                      <Input
                        value={sections.hero.content.button_link || ""}
                        onChange={(e) => updateSectionContent("hero", "button_link", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Immagine Hero</Label>
                    <MediaSelector
                      value={sections.hero.content.image_id}
                      onChange={(id) => updateSectionContent("hero", "image_id", id)}
                      altText={sections.hero.content.image_alt || ""}
                      onAltTextChange={(alt) => updateSectionContent("hero", "image_alt", alt)}
                      showAltText={true}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Mission Section */}
          {sections.mission && (
            <AccordionItem value="mission" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">La Nostra Missione</span>
                  {sections.mission.is_visible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sections.mission.is_visible}
                    onCheckedChange={(checked) => updateSectionVisibility("mission", checked)}
                  />
                  <Label>Sezione visibile</Label>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Titolo</Label>
                    <Input
                      value={sections.mission.content.title || ""}
                      onChange={(e) => updateSectionContent("mission", "title", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Descrizione</Label>
                    <RichTextEditor
                      content={sections.mission.content.description || ""}
                      onChange={(value) => updateSectionContent("mission", "description", value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Valori</Label>
                    {(sections.mission.content.values || []).map((value: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Icona</Label>
                            <Select
                              value={value.icon}
                              onValueChange={(v) => updateNestedContent("mission", "values", index, "icon", v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ICON_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Titolo</Label>
                            <Input
                              value={value.title || ""}
                              onChange={(e) => updateNestedContent("mission", "values", index, "title", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Descrizione</Label>
                          <Textarea
                            value={value.description || ""}
                            onChange={(e) => updateNestedContent("mission", "values", index, "description", e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Story Section */}
          {sections.story && (
            <AccordionItem value="story" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">La Nostra Storia</span>
                  {sections.story.is_visible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sections.story.is_visible}
                    onCheckedChange={(checked) => updateSectionVisibility("story", checked)}
                  />
                  <Label>Sezione visibile</Label>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Titolo</Label>
                    <Input
                      value={sections.story.content.title || ""}
                      onChange={(e) => updateSectionContent("story", "title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Paragrafi</Label>
                    {(sections.story.content.paragraphs || []).map((paragraph: string, index: number) => (
                      <div key={index}>
                        <Label>Paragrafo {index + 1}</Label>
                        <RichTextEditor
                          content={paragraph}
                          onChange={(value) => {
                            const newParagraphs = [...(sections.story.content.paragraphs || [])];
                            newParagraphs[index] = value;
                            updateSectionContent("story", "paragraphs", newParagraphs);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Statistiche</Label>
                    {(sections.story.content.stats || []).map((stat: any, index: number) => (
                      <div key={index} className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Valore</Label>
                          <Input
                            value={stat.value || ""}
                            onChange={(e) => updateNestedContent("story", "stats", index, "value", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Etichetta</Label>
                          <Input
                            value={stat.label || ""}
                            onChange={(e) => updateNestedContent("story", "stats", index, "label", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Certificazioni</Label>
                    {(sections.story.content.certifications || []).map((cert: string, index: number) => (
                      <div key={index}>
                        <Label>Certificazione {index + 1}</Label>
                        <Input
                          value={cert}
                          onChange={(e) => {
                            const newCerts = [...(sections.story.content.certifications || [])];
                            newCerts[index] = e.target.value;
                            updateSectionContent("story", "certifications", newCerts);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* CTA Section */}
          {sections.cta && (
            <AccordionItem value="cta" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Call to Action</span>
                  {sections.cta.is_visible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sections.cta.is_visible}
                    onCheckedChange={(checked) => updateSectionVisibility("cta", checked)}
                  />
                  <Label>Sezione visibile</Label>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Titolo</Label>
                    <Input
                      value={sections.cta.content.title || ""}
                      onChange={(e) => updateSectionContent("cta", "title", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Descrizione</Label>
                    <RichTextEditor
                      content={sections.cta.content.description || ""}
                      onChange={(value) => updateSectionContent("cta", "description", value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Testo Pulsante Primario</Label>
                      <Input
                        value={sections.cta.content.primary_button_text || ""}
                        onChange={(e) => updateSectionContent("cta", "primary_button_text", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Link Pulsante Primario</Label>
                      <Input
                        value={sections.cta.content.primary_button_link || ""}
                        onChange={(e) => updateSectionContent("cta", "primary_button_link", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
            </Accordion>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <SEOFields values={seoValues} onChange={handleSEOChange} />
          </TabsContent>
        </Tabs>
      </div>

      <PublishActionBar
        isPublished={true}
        hasDraftChanges={hasDraftChanges || hasUnsavedChanges}
        isSaving={saving}
        onSave={handleSave}
        onPublish={handlePublish}
        previewUrl="/preview/chi-siamo"
      />

      <UnsavedChangesDialog
        isOpen={isBlocked}
        onConfirm={() => proceed?.()}
        onCancel={() => reset?.()}
      />
    </AdminLayout>
  );
};

export default ChiSiamoAdmin;
