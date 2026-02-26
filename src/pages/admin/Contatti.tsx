import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SEOFields } from "@/components/admin/SEOFields";
import { PublishActionBar } from "@/components/admin/PublishActionBar";
import { UnsavedChangesDialog } from "@/components/admin/UnsavedChangesDialog";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { Search, MessageSquare, Phone, Mail, MapPin, Truck } from "lucide-react";

interface SectionContent {
  [key: string]: any;
}

interface Section {
  id: string;
  content: SectionContent;
  is_visible: boolean;
  sort_order: number;
}

interface DatabaseSection {
  id: string;
  content: SectionContent;
  is_visible: boolean;
  sort_order: number;
  draft_content?: SectionContent | null;
  draft_is_visible?: boolean | null;
  has_draft_changes?: boolean;
}

const AdminContatti = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [originalSections, setOriginalSections] = useState<Record<string, Section>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const justSaved = useRef(false);

  // Unsaved changes warning
  const { isBlocked, proceed, reset } = useUnsavedChangesWarning({
    hasUnsavedChanges: hasChanges,
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("contatti_sections")
        .select("*")
        .order("sort_order");

      if (error) throw error;

      const sectionsMap: Record<string, Section> = {};
      let anyDraftChanges = false;
      data?.forEach((section) => {
        const dbSection = section as unknown as DatabaseSection;
        // Prioritize draft content if available
        sectionsMap[dbSection.id] = {
          id: dbSection.id,
          content: (dbSection.draft_content ?? dbSection.content) as SectionContent,
          is_visible: dbSection.draft_is_visible ?? dbSection.is_visible,
          sort_order: dbSection.sort_order,
        };
        if (dbSection.has_draft_changes) anyDraftChanges = true;
      });
      setSections(sectionsMap);
      setOriginalSections(sectionsMap);
      setHasDraftChanges(anyDraftChanges);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Errore nel caricamento delle sezioni");
    } finally {
      setLoading(false);
    }
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        ...updates,
      },
    }));
    if (!justSaved.current) setHasChanges(true);
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
    if (!justSaved.current) setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to draft columns only
      for (const section of Object.values(sections)) {
        const { error } = await supabase
          .from("contatti_sections")
          .update({
            draft_content: section.content,
            draft_is_visible: section.is_visible,
            has_draft_changes: true,
          })
          .eq("id", section.id);

        if (error) throw error;
      }

      setOriginalSections(sections);
      setHasDraftChanges(true);
      toast.success("Bozza salvata con successo");
      justSaved.current = true;
      setHasChanges(false);
      setTimeout(() => { justSaved.current = false; }, 100);
    } catch (error) {
      console.error("Error saving sections:", error);
      toast.error("Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      // Copy draft to live columns
      for (const section of Object.values(sections)) {
        const { error } = await supabase
          .from("contatti_sections")
          .update({
            content: section.content,
            is_visible: section.is_visible,
            draft_content: null,
            draft_is_visible: null,
            has_draft_changes: false,
          })
          .eq("id", section.id);

        if (error) throw error;
      }

      setOriginalSections(sections);
      setHasDraftChanges(false);
      toast.success("Pagina pubblicata con successo");
      justSaved.current = true;
      setHasChanges(false);
      setTimeout(() => { justSaved.current = false; }, 100);
    } catch (error) {
      console.error("Error publishing:", error);
      toast.error("Errore nella pubblicazione");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    await handleSave();
    window.open("/preview/contatti", "_blank");
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
  const formSection = sections["form"];
  const contactInfoSection = sections["contact_info"];
  const deliverySection = sections["delivery"];
  const whatsappCtaSection = sections["whatsapp_cta"];

  return (
    <AdminLayout>
      <div className="space-y-6 pb-24">
        <div>
          <h1 className="text-3xl font-bold">Gestione Pagina Contatti</h1>
          <p className="text-muted-foreground">
            Modifica i contenuti e le impostazioni della pagina contatti
          </p>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Contenuti</TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Hero Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Hero Section
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="hero-visible">Visibile</Label>
                  <Switch
                    id="hero-visible"
                    checked={heroSection?.is_visible ?? true}
                    onCheckedChange={(checked) =>
                      updateSection("hero", { is_visible: checked })
                    }
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero-title">Titolo</Label>
                  <Input
                    id="hero-title"
                    value={heroSection?.content?.title || ""}
                    onChange={(e) =>
                      updateSectionContent("hero", "title", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-subtitle">Sottotitolo</Label>
                  <Textarea
                    id="hero-subtitle"
                    value={heroSection?.content?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionContent("hero", "subtitle", e.target.value)
                    }
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Sezione Form
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="form-visible">Visibile</Label>
                  <Switch
                    id="form-visible"
                    checked={formSection?.is_visible ?? true}
                    onCheckedChange={(checked) =>
                      updateSection("form", { is_visible: checked })
                    }
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="form-title">Titolo</Label>
                  <Input
                    id="form-title"
                    value={formSection?.content?.title || ""}
                    onChange={(e) =>
                      updateSectionContent("form", "title", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="form-description">Descrizione</Label>
                  <Input
                    id="form-description"
                    value={formSection?.content?.description || ""}
                    onChange={(e) =>
                      updateSectionContent("form", "description", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Info Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Informazioni di Contatto
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="contact-visible">Visibile</Label>
                  <Switch
                    id="contact-visible"
                    checked={contactInfoSection?.is_visible ?? true}
                    onCheckedChange={(checked) =>
                      updateSection("contact_info", { is_visible: checked })
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="contact-title">Titolo Sezione</Label>
                  <Input
                    id="contact-title"
                    value={contactInfoSection?.content?.title || ""}
                    onChange={(e) =>
                      updateSectionContent("contact_info", "title", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div className="space-y-4">
                  {/* Phone */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Phone className="h-4 w-4" />
                        Telefono
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Visibile</Label>
                        <Switch
                          checked={contactInfoSection?.content?.phone_visible ?? true}
                          onCheckedChange={(checked) => {
                            updateSectionContent("contact_info", "phone_visible", checked);
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Titolo</Label>
                        <Input
                          value={contactInfoSection?.content?.phone_title || ""}
                          onChange={(e) =>
                            updateSectionContent("contact_info", "phone_title", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Dettaglio</Label>
                        <Input
                          value={contactInfoSection?.content?.phone_details || ""}
                          onChange={(e) =>
                            updateSectionContent("contact_info", "phone_details", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Descrizione</Label>
                        <Input
                          value={contactInfoSection?.content?.phone_description || ""}
                          onChange={(e) =>
                            updateSectionContent("contact_info", "phone_description", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Visibile</Label>
                        <Switch
                          checked={contactInfoSection?.content?.email_visible ?? true}
                          onCheckedChange={(checked) => {
                            updateSectionContent("contact_info", "email_visible", checked);
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Titolo</Label>
                        <Input
                          value={contactInfoSection?.content?.email_title || ""}
                          onChange={(e) =>
                            updateSectionContent("contact_info", "email_title", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Dettaglio</Label>
                        <Input
                          value={contactInfoSection?.content?.email_details || ""}
                          onChange={(e) =>
                            updateSectionContent("contact_info", "email_details", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Descrizione</Label>
                        <Input
                          value={contactInfoSection?.content?.email_description || ""}
                          onChange={(e) =>
                            updateSectionContent("contact_info", "email_description", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 font-medium">
                        <MapPin className="h-4 w-4" />
                        Indirizzo
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Visibile</Label>
                        <Switch
                          checked={contactInfoSection?.content?.address_visible ?? true}
                          onCheckedChange={(checked) => {
                            updateSectionContent("contact_info", "address_visible", checked);
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Titolo</Label>
                        <Input
                          value={contactInfoSection?.content?.address_title || ""}
                          onChange={(e) =>
                            updateSectionContent("contact_info", "address_title", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Dettaglio</Label>
                        <Input
                          value={contactInfoSection?.content?.address_details || ""}
                          onChange={(e) =>
                            updateSectionContent("contact_info", "address_details", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Descrizione</Label>
                        <Input
                          value={contactInfoSection?.content?.address_description || ""}
                          onChange={(e) =>
                            updateSectionContent("contact_info", "address_description", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 font-medium">
                        <MessageSquare className="h-4 w-4" />
                        WhatsApp
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Visibile</Label>
                        <Switch
                          checked={contactInfoSection?.content?.whatsapp_visible ?? true}
                          onCheckedChange={(checked) => {
                            updateSectionContent("contact_info", "whatsapp_visible", checked);
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Titolo</Label>
                        <Input
                          value={contactInfoSection?.content?.whatsapp_title || ""}
                          onChange={(e) =>
                            updateSectionContent("contact_info", "whatsapp_title", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Dettaglio</Label>
                        <Input
                          value={contactInfoSection?.content?.whatsapp_details || ""}
                          onChange={(e) =>
                            updateSectionContent("contact_info", "whatsapp_details", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Descrizione</Label>
                        <Input
                          value={contactInfoSection?.content?.whatsapp_description || ""}
                          onChange={(e) =>
                            updateSectionContent("contact_info", "whatsapp_description", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Sezione Consegne
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="delivery-visible">Visibile</Label>
                  <Switch
                    id="delivery-visible"
                    checked={deliverySection?.is_visible ?? true}
                    onCheckedChange={(checked) =>
                      updateSection("delivery", { is_visible: checked })
                    }
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="delivery-title">Titolo</Label>
                  <Input
                    id="delivery-title"
                    value={deliverySection?.content?.title || ""}
                    onChange={(e) =>
                      updateSectionContent("delivery", "title", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={deliverySection?.content?.item1_visible ?? true}
                      onCheckedChange={(checked) =>
                        updateSectionContent("delivery", "item1_visible", checked)
                      }
                    />
                    <Input
                      value={deliverySection?.content?.item1_text || ""}
                      onChange={(e) =>
                        updateSectionContent("delivery", "item1_text", e.target.value)
                      }
                      placeholder="Testo elemento 1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={deliverySection?.content?.item2_visible ?? true}
                      onCheckedChange={(checked) =>
                        updateSectionContent("delivery", "item2_visible", checked)
                      }
                    />
                    <Input
                      value={deliverySection?.content?.item2_text || ""}
                      onChange={(e) =>
                        updateSectionContent("delivery", "item2_text", e.target.value)
                      }
                      placeholder="Testo elemento 2"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={deliverySection?.content?.item3_visible ?? true}
                      onCheckedChange={(checked) =>
                        updateSectionContent("delivery", "item3_visible", checked)
                      }
                    />
                    <Input
                      value={deliverySection?.content?.item3_text || ""}
                      onChange={(e) =>
                        updateSectionContent("delivery", "item3_text", e.target.value)
                      }
                      placeholder="Testo elemento 3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp CTA Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  CTA WhatsApp
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="whatsapp-cta-visible">Visibile</Label>
                  <Switch
                    id="whatsapp-cta-visible"
                    checked={whatsappCtaSection?.is_visible ?? true}
                    onCheckedChange={(checked) =>
                      updateSection("whatsapp_cta", { is_visible: checked })
                    }
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp-cta-title">Titolo</Label>
                  <Input
                    id="whatsapp-cta-title"
                    value={whatsappCtaSection?.content?.title || ""}
                    onChange={(e) =>
                      updateSectionContent("whatsapp_cta", "title", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp-cta-description">Descrizione</Label>
                  <Input
                    id="whatsapp-cta-description"
                    value={whatsappCtaSection?.content?.description || ""}
                    onChange={(e) =>
                      updateSectionContent("whatsapp_cta", "description", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp-cta-button">Testo Pulsante</Label>
                  <Input
                    id="whatsapp-cta-button"
                    value={whatsappCtaSection?.content?.button_text || ""}
                    onChange={(e) =>
                      updateSectionContent("whatsapp_cta", "button_text", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp-cta-link">Link WhatsApp</Label>
                  <Input
                    id="whatsapp-cta-link"
                    value={whatsappCtaSection?.content?.whatsapp_link || ""}
                    onChange={(e) =>
                      updateSectionContent("whatsapp_cta", "whatsapp_link", e.target.value)
                    }
                    placeholder="https://wa.me/39333000000?text=..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <SEOFields
              values={{
                slug: "",
                metaTitle: seoSection?.content?.meta_title || "",
                metaDescription: seoSection?.content?.meta_description || "",
                ogTitle: seoSection?.content?.og_title || "",
                ogDescription: seoSection?.content?.og_description || "",
                canonicalUrl: seoSection?.content?.canonical_url || "",
                robots: seoSection?.content?.robots || "index, follow",
                changeFrequency: seoSection?.content?.change_frequency || "monthly",
                priority: seoSection?.content?.priority || "0.5",
                structuredData: seoSection?.content?.structured_data ? JSON.stringify(seoSection.content.structured_data) : "",
              }}
              onChange={(field, value) => {
                const fieldMap: Record<string, string> = {
                  metaTitle: "meta_title",
                  metaDescription: "meta_description",
                  ogTitle: "og_title",
                  ogDescription: "og_description",
                  canonicalUrl: "canonical_url",
                  structuredData: "structured_data",
                  changeFrequency: "change_frequency",
                  priority: "priority",
                };
                updateSectionContent("seo", fieldMap[field] || field, value);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      <PublishActionBar
        isPublished={true}
        hasDraftChanges={hasDraftChanges || hasChanges}
        isSaving={saving}
        onSave={handleSave}
        onPublish={handlePublish}
        previewUrl="/preview/contatti"
      />

      <UnsavedChangesDialog
        isOpen={isBlocked}
        onConfirm={() => proceed?.()}
        onCancel={() => reset?.()}
      />
    </AdminLayout>
  );
};

export default AdminContatti;
