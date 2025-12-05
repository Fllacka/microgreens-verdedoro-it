import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Save, Loader2, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface HomepageSection {
  id: string;
  content: Record<string, any>;
  is_visible: boolean;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  published: boolean;
}

const ICON_OPTIONS = [
  { value: "Leaf", label: "Foglia" },
  { value: "Heart", label: "Cuore" },
  { value: "Truck", label: "Camion" },
  { value: "Shield", label: "Scudo" },
  { value: "Sprout", label: "Germoglio" },
  { value: "Package", label: "Pacco" },
  { value: "UtensilsCrossed", label: "Posate" },
  { value: "Star", label: "Stella" },
];

const Homepage = () => {
  const [sections, setSections] = useState<Record<string, HomepageSection>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSections();
    fetchProducts();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("sort_order");

      if (error) throw error;

      const sectionsMap: Record<string, HomepageSection> = {};
      data?.forEach((section) => {
        sectionsMap[section.id] = {
          ...section,
          content: section.content as Record<string, any>,
        };
      });
      setSections(sectionsMap);
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

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, published")
        .eq("published", true)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
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
      const updates = Object.values(sections).map((section) =>
        supabase
          .from("homepage_sections")
          .update({
            content: section.content,
            is_visible: section.is_visible,
          })
          .eq("id", section.id)
      );

      await Promise.all(updates);

      toast({
        title: "Salvato",
        description: "Homepage aggiornata con successo",
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

  const toggleProductSelection = (sectionId: string, slug: string) => {
    const currentSlugs = sections[sectionId]?.content?.product_slugs || [];
    const newSlugs = currentSlugs.includes(slug)
      ? currentSlugs.filter((s: string) => s !== slug)
      : [...currentSlugs, slug];
    updateSectionContent(sectionId, "product_slugs", newSlugs);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Homepage</h1>
            <p className="text-muted-foreground">Gestisci i contenuti della homepage</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salva Modifiche
          </Button>
        </div>

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
                    <Label>Badge Text</Label>
                    <Input
                      value={sections.hero.content.badge_text || ""}
                      onChange={(e) => updateSectionContent("hero", "badge_text", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Titolo Parte 1</Label>
                      <Input
                        value={sections.hero.content.title_part1 || ""}
                        onChange={(e) => updateSectionContent("hero", "title_part1", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Titolo Evidenziato</Label>
                      <Input
                        value={sections.hero.content.title_highlight || ""}
                        onChange={(e) => updateSectionContent("hero", "title_highlight", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Sottotitolo</Label>
                    <Textarea
                      value={sections.hero.content.subtitle || ""}
                      onChange={(e) => updateSectionContent("hero", "subtitle", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Pulsante Primario - Testo</Label>
                      <Input
                        value={sections.hero.content.primary_button_text || ""}
                        onChange={(e) => updateSectionContent("hero", "primary_button_text", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Pulsante Primario - Link</Label>
                      <Input
                        value={sections.hero.content.primary_button_link || ""}
                        onChange={(e) => updateSectionContent("hero", "primary_button_link", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Pulsante Secondario - Testo</Label>
                      <Input
                        value={sections.hero.content.secondary_button_text || ""}
                        onChange={(e) => updateSectionContent("hero", "secondary_button_text", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Pulsante Secondario - Link</Label>
                      <Input
                        value={sections.hero.content.secondary_button_link || ""}
                        onChange={(e) => updateSectionContent("hero", "secondary_button_link", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Immagine di Sfondo</Label>
                    <MediaSelector
                      value={sections.hero.content.background_image_id}
                      onChange={(id) => updateSectionContent("hero", "background_image_id", id)}
                      showAltText={false}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* What Are Microgreens Section */}
          {sections.what_are_microgreens && (
            <AccordionItem value="what_are_microgreens" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Cosa sono i Microgreens?</span>
                  {sections.what_are_microgreens.is_visible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sections.what_are_microgreens.is_visible}
                    onCheckedChange={(checked) => updateSectionVisibility("what_are_microgreens", checked)}
                  />
                  <Label>Sezione visibile</Label>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Titolo</Label>
                    <Input
                      value={sections.what_are_microgreens.content.heading || ""}
                      onChange={(e) => updateSectionContent("what_are_microgreens", "heading", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Descrizione</Label>
                    <Textarea
                      value={sections.what_are_microgreens.content.description || ""}
                      onChange={(e) => updateSectionContent("what_are_microgreens", "description", e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Immagine Sezione</Label>
                    <MediaSelector
                      value={sections.what_are_microgreens.content.image_id}
                      onChange={(id) => updateSectionContent("what_are_microgreens", "image_id", id)}
                      showAltText={false}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Features (4 Card)</Label>
                    {(sections.what_are_microgreens.content.features || []).map((feature: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="pt-4 space-y-3">
                          <div>
                            <Label>Titolo Feature {index + 1}</Label>
                            <Input
                              value={feature.title || ""}
                              onChange={(e) => updateNestedContent("what_are_microgreens", "features", index, "title", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Descrizione</Label>
                            <Input
                              value={feature.description || ""}
                              onChange={(e) => updateNestedContent("what_are_microgreens", "features", index, "description", e.target.value)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Testo CTA</Label>
                      <Input
                        value={sections.what_are_microgreens.content.cta_text || ""}
                        onChange={(e) => updateSectionContent("what_are_microgreens", "cta_text", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Link CTA</Label>
                      <Input
                        value={sections.what_are_microgreens.content.cta_link || ""}
                        onChange={(e) => updateSectionContent("what_are_microgreens", "cta_link", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* How It Works Section */}
          {sections.how_it_works && (
            <AccordionItem value="how_it_works" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Come Funziona?</span>
                  {sections.how_it_works.is_visible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sections.how_it_works.is_visible}
                    onCheckedChange={(checked) => updateSectionVisibility("how_it_works", checked)}
                  />
                  <Label>Sezione visibile</Label>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Titolo</Label>
                    <Input
                      value={sections.how_it_works.content.heading || ""}
                      onChange={(e) => updateSectionContent("how_it_works", "heading", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Sottotitolo</Label>
                    <Textarea
                      value={sections.how_it_works.content.subtitle || ""}
                      onChange={(e) => updateSectionContent("how_it_works", "subtitle", e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Steps (4 Passi)</Label>
                    {(sections.how_it_works.content.steps || []).map((step: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="pt-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Numero</Label>
                              <Input
                                value={step.number || ""}
                                onChange={(e) => updateNestedContent("how_it_works", "steps", index, "number", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Icona</Label>
                              <Select
                                value={step.icon || ""}
                                onValueChange={(value) => updateNestedContent("how_it_works", "steps", index, "icon", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona icona" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ICON_OPTIONS.map((icon) => (
                                    <SelectItem key={icon.value} value={icon.value}>
                                      {icon.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>Titolo</Label>
                            <Input
                              value={step.title || ""}
                              onChange={(e) => updateNestedContent("how_it_works", "steps", index, "title", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Descrizione</Label>
                            <Textarea
                              value={step.description || ""}
                              onChange={(e) => updateNestedContent("how_it_works", "steps", index, "description", e.target.value)}
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Orders and Delivery Section */}
          {sections.orders_delivery && (
            <AccordionItem value="orders_delivery" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Ordini e Consegne</span>
                  {sections.orders_delivery.is_visible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sections.orders_delivery.is_visible}
                    onCheckedChange={(checked) => updateSectionVisibility("orders_delivery", checked)}
                  />
                  <Label>Sezione visibile</Label>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Titolo</Label>
                    <Input
                      value={sections.orders_delivery.content.heading || ""}
                      onChange={(e) => updateSectionContent("orders_delivery", "heading", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Descrizione</Label>
                    <Textarea
                      value={sections.orders_delivery.content.description || ""}
                      onChange={(e) => updateSectionContent("orders_delivery", "description", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Testo Pulsante</Label>
                      <Input
                        value={sections.orders_delivery.content.button_text || ""}
                        onChange={(e) => updateSectionContent("orders_delivery", "button_text", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Link Pulsante</Label>
                      <Input
                        value={sections.orders_delivery.content.button_link || ""}
                        onChange={(e) => updateSectionContent("orders_delivery", "button_link", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Featured Products Section */}
          {sections.featured_products && (
            <AccordionItem value="featured_products" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Prodotti in Evidenza</span>
                  {sections.featured_products.is_visible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sections.featured_products.is_visible}
                    onCheckedChange={(checked) => updateSectionVisibility("featured_products", checked)}
                  />
                  <Label>Sezione visibile</Label>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Titolo</Label>
                    <Input
                      value={sections.featured_products.content.heading || ""}
                      onChange={(e) => updateSectionContent("featured_products", "heading", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Sottotitolo</Label>
                    <Textarea
                      value={sections.featured_products.content.subtitle || ""}
                      onChange={(e) => updateSectionContent("featured_products", "subtitle", e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Seleziona Prodotti da Mostrare</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={product.slug}
                            checked={(sections.featured_products.content.product_slugs || []).includes(product.slug)}
                            onCheckedChange={() => toggleProductSelection("featured_products", product.slug)}
                          />
                          <label htmlFor={product.slug} className="text-sm cursor-pointer">
                            {product.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {products.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nessun prodotto pubblicato disponibile</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Testo Pulsante</Label>
                      <Input
                        value={sections.featured_products.content.button_text || ""}
                        onChange={(e) => updateSectionContent("featured_products", "button_text", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Link Pulsante</Label>
                      <Input
                        value={sections.featured_products.content.button_link || ""}
                        onChange={(e) => updateSectionContent("featured_products", "button_link", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Custom Microgreens Section */}
          {sections.custom_microgreens && (
            <AccordionItem value="custom_microgreens" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Microgreens su Misura</span>
                  {sections.custom_microgreens.is_visible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sections.custom_microgreens.is_visible}
                    onCheckedChange={(checked) => updateSectionVisibility("custom_microgreens", checked)}
                  />
                  <Label>Sezione visibile</Label>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Titolo</Label>
                    <Input
                      value={sections.custom_microgreens.content.heading || ""}
                      onChange={(e) => updateSectionContent("custom_microgreens", "heading", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Descrizione 1</Label>
                    <Textarea
                      value={sections.custom_microgreens.content.description1 || ""}
                      onChange={(e) => updateSectionContent("custom_microgreens", "description1", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Descrizione 2</Label>
                    <Textarea
                      value={sections.custom_microgreens.content.description2 || ""}
                      onChange={(e) => updateSectionContent("custom_microgreens", "description2", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Testo Pulsante</Label>
                      <Input
                        value={sections.custom_microgreens.content.button_text || ""}
                        onChange={(e) => updateSectionContent("custom_microgreens", "button_text", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Link Pulsante</Label>
                      <Input
                        value={sections.custom_microgreens.content.button_link || ""}
                        onChange={(e) => updateSectionContent("custom_microgreens", "button_link", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Immagine Sezione</Label>
                    <MediaSelector
                      value={sections.custom_microgreens.content.image_id}
                      onChange={(id) => updateSectionContent("custom_microgreens", "image_id", id)}
                      showAltText={false}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Blog Section */}
          {sections.blog && (
            <AccordionItem value="blog" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Sezione Blog</span>
                  {sections.blog.is_visible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sections.blog.is_visible}
                    onCheckedChange={(checked) => updateSectionVisibility("blog", checked)}
                  />
                  <Label>Sezione visibile</Label>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Titolo</Label>
                    <Input
                      value={sections.blog.content.heading || ""}
                      onChange={(e) => updateSectionContent("blog", "heading", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Sottotitolo</Label>
                    <Textarea
                      value={sections.blog.content.subtitle || ""}
                      onChange={(e) => updateSectionContent("blog", "subtitle", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Numero di Post da Mostrare</Label>
                    <Select
                      value={String(sections.blog.content.posts_count || 3)}
                      onValueChange={(value) => updateSectionContent("blog", "posts_count", parseInt(value))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Testo Pulsante</Label>
                      <Input
                        value={sections.blog.content.button_text || ""}
                        onChange={(e) => updateSectionContent("blog", "button_text", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Link Pulsante</Label>
                      <Input
                        value={sections.blog.content.button_link || ""}
                        onChange={(e) => updateSectionContent("blog", "button_link", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </AdminLayout>
  );
};

export default Homepage;
