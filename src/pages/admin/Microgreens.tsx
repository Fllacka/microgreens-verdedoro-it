import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { SEOFields } from "@/components/admin/SEOFields";
import { PublishActionBar } from "@/components/admin/PublishActionBar";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

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
        const { error } = await supabase
          .from("microgreens_sections")
          .update({
            content: section.content,
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

        <Accordion type="multiple" defaultValue={["seo", "hero", "info"]} className="space-y-4">
          <AccordionItem value="seo" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO Settings
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <SEOFields values={seoValues} onChange={handleSEOChange} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="hero" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              Sezione Hero
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
                <Textarea
                  value={heroSection?.content?.subtitle || ""}
                  onChange={(e) => updateSectionContent("hero", "subtitle", e.target.value)}
                  rows={3}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="info" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              Sezione Informazioni
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Feature 1</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titolo</Label>
                    <Input
                      value={infoSection?.content?.feature1_title || ""}
                      onChange={(e) => updateSectionContent("info", "feature1_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrizione</Label>
                    <Textarea
                      value={infoSection?.content?.feature1_description || ""}
                      onChange={(e) => updateSectionContent("info", "feature1_description", e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Feature 2</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titolo</Label>
                    <Input
                      value={infoSection?.content?.feature2_title || ""}
                      onChange={(e) => updateSectionContent("info", "feature2_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrizione</Label>
                    <Textarea
                      value={infoSection?.content?.feature2_description || ""}
                      onChange={(e) => updateSectionContent("info", "feature2_description", e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Feature 3</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titolo</Label>
                    <Input
                      value={infoSection?.content?.feature3_title || ""}
                      onChange={(e) => updateSectionContent("info", "feature3_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrizione</Label>
                    <Textarea
                      value={infoSection?.content?.feature3_description || ""}
                      onChange={(e) => updateSectionContent("info", "feature3_description", e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

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
      </div>

      <PublishActionBar
        isPublished={isPublished}
        isSaving={saving}
        onSave={handleSave}
        onPublish={handlePublish}
        previewUrl="/preview/microgreens"
      />
    </AdminLayout>
  );
};

export default AdminMicrogreens;
