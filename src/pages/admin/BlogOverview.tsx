import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PublishActionBar } from "@/components/admin/PublishActionBar";
import { SEOFields } from "@/components/admin/SEOFields";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Tag, Star, Clock, Mail, Plus, X, GripVertical } from "lucide-react";

interface SectionContent {
  [key: string]: any;
}

interface Section {
  id: string;
  content: SectionContent;
  is_visible: boolean;
  sort_order: number;
}

const AdminBlogOverview = () => {
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [seoData, setSeoData] = useState({
    slug: "blog",
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    canonicalUrl: "",
    robots: "index, follow",
    changeFrequency: "weekly",
    priority: "0.8",
    structuredData: "",
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_overview_sections")
        .select("*")
        .order("sort_order");

      if (error) throw error;

      const sectionsMap: Record<string, Section> = {};
      data?.forEach((section) => {
        sectionsMap[section.id] = section as Section;
      });
      setSections(sectionsMap);

      // Load SEO data
      const seoSection = sectionsMap["seo"];
      if (seoSection?.content) {
        setSeoData({
          slug: "blog",
          metaTitle: seoSection.content.meta_title || "",
          metaDescription: seoSection.content.meta_description || "",
          ogTitle: seoSection.content.og_title || "",
          ogDescription: seoSection.content.og_description || "",
          canonicalUrl: seoSection.content.canonical_url || "",
          robots: seoSection.content.robots || "index, follow",
          changeFrequency: seoSection.content.change_frequency || "weekly",
          priority: seoSection.content.priority || "0.8",
          structuredData: seoSection.content.structured_data ? JSON.stringify(seoSection.content.structured_data, null, 2) : "",
        });
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le sezioni",
        variant: "destructive",
      });
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
      // Prepare SEO section content
      const seoContent = {
        meta_title: seoData.metaTitle,
        meta_description: seoData.metaDescription,
        og_title: seoData.ogTitle,
        og_description: seoData.ogDescription,
        canonical_url: seoData.canonicalUrl,
        robots: seoData.robots,
        change_frequency: seoData.changeFrequency,
        priority: seoData.priority,
        structured_data: seoData.structuredData ? JSON.parse(seoData.structuredData) : null,
      };

      // Update all sections
      for (const [id, section] of Object.entries(sections)) {
        let contentToSave = section.content;
        
        // Filter out empty categories before saving
        if (id === "categories" && section.content?.items) {
          contentToSave = {
            ...section.content,
            items: section.content.items.filter((cat: { name: string }) => cat.name?.trim()),
          };
        }
        
        if (id === "seo") {
          await supabase
            .from("blog_overview_sections")
            .update({ content: seoContent, is_visible: section.is_visible, updated_at: new Date().toISOString() })
            .eq("id", id);
        } else {
          await supabase
            .from("blog_overview_sections")
            .update({ content: contentToSave, is_visible: section.is_visible, updated_at: new Date().toISOString() })
            .eq("id", id);
        }
      }

      toast({
        title: "Salvato",
        description: "Le modifiche sono state salvate con successo",
      });
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSEOChange = (field: string, value: string) => {
    setSeoData((prev) => ({ ...prev, [field]: value }));
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

  const heroSection = sections["hero"];
  const categoriesSection = sections["categories"];
  const featuredSection = sections["featured"];
  const latestSection = sections["latest"];
  const newsletterSection = sections["newsletter"];

  return (
    <AdminLayout>
      <div className="space-y-6 pb-24">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-muted-foreground">Gestisci la pagina panoramica del blog</p>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Contenuto</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6 mt-6">
            <Accordion type="multiple" defaultValue={["hero", "categories", "featured", "latest", "newsletter"]} className="space-y-4">
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
                    <Label>Badge</Label>
                    <Input
                      value={heroSection?.content?.badge || ""}
                      onChange={(e) => updateSectionContent("hero", "badge", e.target.value)}
                      placeholder="Il Mondo dei Microgreens"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titolo</Label>
                    <Input
                      value={heroSection?.content?.title || ""}
                      onChange={(e) => updateSectionContent("hero", "title", e.target.value)}
                      placeholder="Blog di Microgreens"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sottotitolo</Label>
                    <Textarea
                      value={heroSection?.content?.subtitle || ""}
                      onChange={(e) => updateSectionContent("hero", "subtitle", e.target.value)}
                      placeholder="Descrizione del blog..."
                      rows={3}
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
                      Le categorie aggiunte qui saranno disponibili per la selezione negli articoli del blog.
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

              {/* Featured Section */}
              <AccordionItem value="featured" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Articolo in Evidenza</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>Sezione visibile</Label>
                    <Switch
                      checked={featuredSection?.is_visible ?? true}
                      onCheckedChange={(checked) => updateSectionVisibility("featured", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titolo sezione</Label>
                    <Input
                      value={featuredSection?.content?.title || ""}
                      onChange={(e) => updateSectionContent("featured", "title", e.target.value)}
                      placeholder="Articolo in Evidenza"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Latest Articles Section */}
              <AccordionItem value="latest" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Ultimi Articoli</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>Sezione visibile</Label>
                    <Switch
                      checked={latestSection?.is_visible ?? true}
                      onCheckedChange={(checked) => updateSectionVisibility("latest", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titolo sezione</Label>
                    <Input
                      value={latestSection?.content?.title || ""}
                      onChange={(e) => updateSectionContent("latest", "title", e.target.value)}
                      placeholder="Ultimi Articoli"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Testo caricamento</Label>
                    <Input
                      value={latestSection?.content?.loading_text || ""}
                      onChange={(e) => updateSectionContent("latest", "loading_text", e.target.value)}
                      placeholder="Caricamento articoli..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Testo nessun articolo</Label>
                    <Input
                      value={latestSection?.content?.empty_text || ""}
                      onChange={(e) => updateSectionContent("latest", "empty_text", e.target.value)}
                      placeholder="Nessun articolo disponibile al momento."
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Newsletter Section */}
              <AccordionItem value="newsletter" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Newsletter</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>Sezione visibile</Label>
                    <Switch
                      checked={newsletterSection?.is_visible ?? true}
                      onCheckedChange={(checked) => updateSectionVisibility("newsletter", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titolo</Label>
                    <Input
                      value={newsletterSection?.content?.title || ""}
                      onChange={(e) => updateSectionContent("newsletter", "title", e.target.value)}
                      placeholder="Non Perdere Nessun Articolo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sottotitolo</Label>
                    <Textarea
                      value={newsletterSection?.content?.subtitle || ""}
                      onChange={(e) => updateSectionContent("newsletter", "subtitle", e.target.value)}
                      placeholder="Iscriviti alla nostra newsletter..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Testo pulsante</Label>
                    <Input
                      value={newsletterSection?.content?.button_text || ""}
                      onChange={(e) => updateSectionContent("newsletter", "button_text", e.target.value)}
                      placeholder="Iscriviti alla Newsletter"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="seo" className="mt-6">
            <SEOFields values={seoData} onChange={handleSEOChange} />
          </TabsContent>
        </Tabs>

        <PublishActionBar
          onSave={handleSave}
          onPublish={handleSave}
          isSaving={saving}
          isPublished={true}
          previewUrl="/preview/blog-overview"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminBlogOverview;