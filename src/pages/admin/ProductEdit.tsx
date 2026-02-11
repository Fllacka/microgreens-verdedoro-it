import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SEOFields } from "@/components/admin/SEOFields";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { PublishActionBar } from "@/components/admin/PublishActionBar";
import { UnsavedChangesDialog } from "@/components/admin/UnsavedChangesDialog";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { useChangeTracking } from "@/hooks/useChangeTracking";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Package, Plus, Trash2, HelpCircle, GripVertical, Euro } from "lucide-react";
import { 
  generateProductSchema, 
  generateBreadcrumbSchema, 
  generateFAQSchema, 
  combineSchemas,
  stripHtmlTags 
} from "@/lib/seo";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface PriceTier {
  weight: number;
  price: number;
}

const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    grid_description: "",
    content: "",
    content_title: "Panoramica del Prodotto",
    category: "",
    price: "",
    price_tiers: [] as PriceTier[],
    benefits: "",
    uses: "",
    benefits_content: "",
    benefits_title: "Benefici",
    uses_content: "",
    uses_title: "Usi Culinari",
    rating: "",
    popular: false,
    published: false,
    image_id: null as string | null,
    image_alt: "",
    faq_items: [] as FAQItem[],
  });

  const [seoData, setSeoData] = useState({
    slug: "",
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    canonicalUrl: "",
    robots: "index, follow",
    changeFrequency: "weekly",
    priority: "0.5",
    structuredData: "",
  });

  const [availableCategories, setAvailableCategories] = useState<CategoryItem[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Centralized change tracking with justSaved protection
  const { hasChanges, markSaved, setReady } = useChangeTracking([formData, seoData]);

  // Unsaved changes warning
  const { isBlocked, proceed, reset } = useUnsavedChangesWarning({
    hasUnsavedChanges: hasChanges,
  });

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchProduct();
    } else {
      setReady();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("microgreens_sections")
        .select("content")
        .eq("id", "categories")
        .maybeSingle();

      if (error) throw error;

      const items = (data?.content as { items?: CategoryItem[] })?.items || [];
      // Filter out empty category names
      setAvailableCategories(items.filter(cat => cat.name?.trim()));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Check if there are draft changes - prioritize draft values
      const hasDraft = (data as any).has_draft_changes || false;
      setHasDraftChanges(hasDraft);

      // Load draft values if they exist, otherwise use published values
      setFormData({
        name: (data as any).draft_name ?? data.name ?? "",
        description: (data as any).draft_description ?? data.description ?? "",
        grid_description: (data as any).draft_grid_description ?? (data as any).grid_description ?? "",
        content: (data as any).draft_content ?? data.content ?? "",
        content_title: (data as any).draft_content_title ?? (data as any).content_title ?? "Panoramica del Prodotto",
        category: (data as any).draft_category ?? data.category ?? "",
        price: ((data as any).draft_price ?? data.price)?.toString() ?? "",
        price_tiers: (data as any).draft_price_tiers ?? (data as any).price_tiers ?? [],
        benefits: ((data as any).draft_benefits ?? data.benefits)?.join(", ") ?? "",
        uses: ((data as any).draft_uses ?? data.uses)?.join(", ") ?? "",
        benefits_content: (data as any).draft_benefits_content ?? (data as any).benefits_content ?? "",
        benefits_title: (data as any).draft_benefits_title ?? (data as any).benefits_title ?? "Benefici",
        uses_content: (data as any).draft_uses_content ?? (data as any).uses_content ?? "",
        uses_title: (data as any).draft_uses_title ?? (data as any).uses_title ?? "Usi Culinari",
        rating: data.rating?.toString() ?? "",
        popular: data.popular ?? false,
        published: data.published ?? false,
        image_id: (data as any).draft_image_id ?? data.image_id ?? null,
        image_alt: (data as any).draft_image_alt ?? (data as any).image_alt ?? "",
        faq_items: (data as any).draft_faq_items ?? (data as any).faq_items ?? [],
      });

      setSeoData({
        slug: (data as any).draft_slug ?? data.slug ?? "",
        metaTitle: (data as any).draft_meta_title ?? data.meta_title ?? "",
        metaDescription: (data as any).draft_meta_description ?? data.meta_description ?? "",
        ogTitle: (data as any).draft_og_title ?? data.og_title ?? "",
        ogDescription: (data as any).draft_og_description ?? data.og_description ?? "",
        canonicalUrl: (data as any).draft_canonical_url ?? data.canonical_url ?? "",
        robots: (data as any).draft_robots ?? data.robots ?? "index, follow",
        changeFrequency: (data as any).draft_change_frequency ?? data.change_frequency ?? "weekly",
        priority: ((data as any).draft_priority ?? data.priority)?.toString() ?? "0.5",
        structuredData: ((data as any).draft_structured_data ?? data.structured_data) ? JSON.stringify((data as any).draft_structured_data ?? data.structured_data, null, 2) : "",
      });

      // Fetch image URL if image_id exists
      const imageId = (data as any).draft_image_id ?? data.image_id;
      if (imageId) {
        const { data: mediaData } = await supabase
          .from("media")
          .select("file_path")
          .eq("id", imageId)
          .single();
        
        if (mediaData) {
          setImageUrl(mediaData.file_path);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il prodotto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setReady();
    }
  };

  // Save as draft only - does not publish
  const saveDraft = async () => {
    setSaving(true);

    try {
      const draftData = {
        draft_name: formData.name,
        draft_slug: seoData.slug,
        draft_description: formData.description,
        draft_grid_description: formData.grid_description,
        draft_content: formData.content,
        draft_content_title: formData.content_title,
        draft_category: formData.category,
        draft_price: formData.price ? parseFloat(formData.price) : null,
        draft_price_tiers: formData.price_tiers as unknown as any,
        draft_benefits: formData.benefits ? formData.benefits.split(",").map(b => b.trim()) : [],
        draft_uses: formData.uses ? formData.uses.split(",").map(u => u.trim()) : [],
        draft_benefits_content: formData.benefits_content,
        draft_benefits_title: formData.benefits_title,
        draft_uses_content: formData.uses_content,
        draft_uses_title: formData.uses_title,
        draft_image_id: formData.image_id,
        draft_image_alt: formData.image_alt,
        draft_faq_items: formData.faq_items as unknown as any,
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

      // For new products, we need to create with both draft and published fields
      const shouldInsert = isNew && !createdId;
      const productId = createdId || id;

      if (shouldInsert) {
        // For new products, save everything as draft but also set minimal required published fields
        const insertData = {
          ...draftData,
          name: formData.name,
          slug: seoData.slug,
          published: false,
        };
        const { data, error } = await supabase.from("products").insert(insertData).select().single();
        if (error) throw error;
        setCreatedId(data.id);
        setHasDraftChanges(true);
        toast({
          title: "Bozza salvata",
          description: "Prodotto salvato come bozza",
        });
        navigate(`/admin/products/${data.id}`);
      } else {
        const { error } = await supabase.from("products").update(draftData).eq("id", productId);
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
      markSaved();
    }
  };

  // Publish - copies draft to published fields
  const publishProduct = async (publish: boolean) => {
    setSaving(true);

    try {
      // Validate image exists before publishing
      if (formData.image_id) {
        const { data: mediaExists } = await supabase
          .from("media")
          .select("id")
          .eq("id", formData.image_id)
          .maybeSingle();
        
        if (!mediaExists) {
          // Image was deleted, clear the reference
          setFormData(prev => ({ ...prev, image_id: null }));
          setImageUrl(null);
          toast({
            title: "Attenzione",
            description: "L'immagine selezionata non esiste più. Seleziona una nuova immagine prima di pubblicare.",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      }

      const productData = {
        // Published fields
        name: formData.name,
        slug: seoData.slug,
        description: formData.description,
        grid_description: formData.grid_description,
        content: formData.content,
        content_title: formData.content_title,
        category: formData.category,
        price: formData.price ? parseFloat(formData.price) : null,
        price_tiers: formData.price_tiers as unknown as any,
        benefits: formData.benefits ? formData.benefits.split(",").map(b => b.trim()) : [],
        uses: formData.uses ? formData.uses.split(",").map(u => u.trim()) : [],
        benefits_content: formData.benefits_content,
        benefits_title: formData.benefits_title,
        uses_content: formData.uses_content,
        uses_title: formData.uses_title,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        popular: formData.popular,
        published: publish,
        image_id: formData.image_id,
        image_alt: formData.image_alt,
        faq_items: formData.faq_items as unknown as any,
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
        draft_name: null,
        draft_slug: null,
        draft_description: null,
        draft_grid_description: null,
        draft_content: null,
        draft_content_title: null,
        draft_category: null,
        draft_price: null,
        draft_price_tiers: null,
        draft_benefits: null,
        draft_uses: null,
        draft_benefits_content: null,
        draft_benefits_title: null,
        draft_uses_content: null,
        draft_uses_title: null,
        draft_image_id: null,
        draft_image_alt: null,
        draft_faq_items: null,
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
      const productId = createdId || id;

      if (shouldInsert) {
        const { data, error } = await supabase.from("products").insert(productData).select().single();
        if (error) throw error;
        setCreatedId(data.id);
        setFormData(prev => ({ ...prev, published: publish }));
        setHasDraftChanges(false);
        toast({
          title: "Successo",
          description: publish ? "Prodotto pubblicato con successo" : "Prodotto rimosso dalla pubblicazione",
        });
        navigate(`/admin/products/${data.id}`);
      } else {
        const { error } = await supabase.from("products").update(productData).eq("id", productId);
        if (error) throw error;
        setFormData(prev => ({ ...prev, published: publish }));
        setHasDraftChanges(false);
        toast({
          title: "Successo",
          description: publish ? "Prodotto pubblicato con successo" : "Prodotto rimosso dalla pubblicazione",
        });
      }
    } catch (error: any) {
      console.error("Error publishing product:", error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile pubblicare il prodotto",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      markSaved();
    }
  };

  const handleSave = async () => {
    await saveDraft();
  };

  const handlePublish = async (publish: boolean) => {
    await publishProduct(publish);
  };

  // Generate structured data for the product
  const generateStructuredData = (): string | null => {
    if (!formData.name || !seoData.slug) {
      toast({
        title: "Dati mancanti",
        description: "Inserisci almeno il nome e lo slug del prodotto",
        variant: "destructive",
      });
      return null;
    }

    // Generate Product schema
    const productSchema = generateProductSchema({
      name: formData.name,
      description: stripHtmlTags(formData.description || formData.content || ""),
      slug: seoData.slug,
      image: imageUrl || undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      category: formData.category || undefined,
      priceTiers: formData.price_tiers,
    });

    // Generate Breadcrumb schema
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Microgreens", url: "/microgreens" },
      { name: formData.name, url: `/microgreens/${seoData.slug}` },
    ]);

    // Build schemas array
    const schemas: Record<string, unknown>[] = [productSchema, breadcrumbSchema];

    // Generate FAQ schema if there are FAQs
    if (formData.faq_items && formData.faq_items.length > 0) {
      const validFaqs = formData.faq_items.filter(faq => faq.question && faq.answer);
      if (validFaqs.length > 0) {
        const faqSchema = generateFAQSchema(
          validFaqs.map(faq => ({
            question: faq.question,
            answer: stripHtmlTags(faq.answer),
          }))
        );
        schemas.push(faqSchema);
      }
    }

    // Combine all schemas
    const combinedSchema = combineSchemas(...schemas);
    
    return JSON.stringify(combinedSchema, null, 2);
  };

  if (loading && !isNew) {
    return (
      <AdminLayout>
        <div>Caricamento...</div>
      </AdminLayout>
    );
  }

  const previewUrl = seoData.slug ? `/preview/microgreens/${seoData.slug}` : undefined;

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-8 pb-28 md:pb-24">
        <div className="flex items-center gap-3 md:gap-4">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/admin/products")} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-bold truncate">{isNew ? "Nuovo Prodotto" : "Modifica Prodotto"}</h1>
            <p className="text-muted-foreground text-sm hidden md:block">Crea e gestisci i dettagli del prodotto</p>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-4 md:space-y-6">
          <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex">
            <TabsTrigger value="content" className="text-xs md:text-sm">
              <Package className="h-4 w-4 mr-1 md:mr-2" />
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
                    <CardTitle>Informazioni Prodotto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Prodotto *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrizione Breve</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="grid_description">Descrizione Product Grid</Label>
                        <span className={`text-xs ${formData.grid_description.length > 120 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {formData.grid_description.length}/120
                        </span>
                      </div>
                      <Textarea
                        id="grid_description"
                        value={formData.grid_description}
                        onChange={(e) => setFormData({ ...formData, grid_description: e.target.value })}
                        rows={2}
                        maxLength={150}
                        placeholder="Descrizione breve per le card del product grid (max 120 caratteri)"
                      />
                      <p className="text-xs text-muted-foreground">
                        Questa descrizione appare nelle card dei prodotti. Consigliato: max 120 caratteri per evitare troncamenti.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content_title">Titolo Sezione (Descrizione Completa)</Label>
                      <Input
                        id="content_title"
                        value={formData.content_title}
                        onChange={(e) => setFormData({ ...formData, content_title: e.target.value })}
                        placeholder="Panoramica del Prodotto"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Descrizione Completa</Label>
                      <RichTextEditor
                        content={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                      />
                    </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                          value={formData.category || "none"}
                          onValueChange={(value) => setFormData({ ...formData, category: value === "none" ? "" : value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nessuna categoria</SelectItem>
                            {availableCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                {/* Price Tiers Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Euro className="h-5 w-5" />
                      Prezzi per Quantità
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Configura i prezzi per ogni quantità. Le quantità senza prezzo non saranno disponibili per l'acquisto.
                    </p>
                    
                    {/* Price Tiers Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Peso (g)</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Prezzo (€)</th>
                            <th className="px-4 py-3 w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {formData.price_tiers.map((tier, index) => (
                            <tr key={index} className="bg-background">
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={tier.weight}
                                  onChange={(e) => {
                                    const updated = [...formData.price_tiers];
                                    updated[index].weight = parseInt(e.target.value) || 0;
                                    setFormData({ ...formData, price_tiers: updated });
                                  }}
                                  className="w-24"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={tier.price || ""}
                                  onChange={(e) => {
                                    const updated = [...formData.price_tiers];
                                    updated[index].price = parseFloat(e.target.value) || 0;
                                    setFormData({ ...formData, price_tiers: updated });
                                  }}
                                  placeholder="0.00"
                                  className="w-28"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    const updated = formData.price_tiers.filter((_, i) => i !== index);
                                    setFormData({ ...formData, price_tiers: updated });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {formData.price_tiers.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground text-sm">
                                Nessun prezzo configurato. Aggiungi un peso per iniziare.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Quick Add Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {[100, 200, 300, 400, 500, 750, 1000].map((weight) => {
                        const exists = formData.price_tiers.some(t => t.weight === weight);
                        if (exists) return null;
                        return (
                          <Button
                            key={weight}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                price_tiers: [...formData.price_tiers, { weight, price: 0 }].sort((a, b) => a.weight - b.weight)
                              });
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {weight}g
                          </Button>
                        );
                      })}
                    </div>

                    {/* Custom Weight Input */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Peso personalizzato (g)"
                        className="w-48"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const weight = parseInt(input.value);
                            if (weight > 0 && !formData.price_tiers.some(t => t.weight === weight)) {
                              setFormData({
                                ...formData,
                                price_tiers: [...formData.price_tiers, { weight, price: 0 }].sort((a, b) => a.weight - b.weight)
                              });
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <span className="text-sm text-muted-foreground">Premi Invio per aggiungere</span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="benefits">Benefici (etichette, separati da virgola)</Label>
                      <Textarea
                        id="benefits"
                        value={formData.benefits}
                        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                        placeholder="Ricco di vitamine, Antiossidante, Ricco di minerali"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">Questi appariranno come badge nelle card prodotto</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="benefits_title">Titolo Sezione (Benefici)</Label>
                      <Input
                        id="benefits_title"
                        value={formData.benefits_title}
                        onChange={(e) => setFormData({ ...formData, benefits_title: e.target.value })}
                        placeholder="Benefici"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Benefici (contenuto dettagliato)</Label>
                      <RichTextEditor
                        content={formData.benefits_content}
                        onChange={(content) => setFormData({ ...formData, benefits_content: content })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="uses">Usi (etichette, separati da virgola)</Label>
                      <Textarea
                        id="uses"
                        value={formData.uses}
                        onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
                        placeholder="Insalate, Smoothie, Guarnizione"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">Questi appariranno come badge nelle card prodotto</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="uses_title">Titolo Sezione (Usi Culinari)</Label>
                      <Input
                        id="uses_title"
                        value={formData.uses_title}
                        onChange={(e) => setFormData({ ...formData, uses_title: e.target.value })}
                        placeholder="Usi Culinari"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Usi Culinari (contenuto dettagliato)</Label>
                      <RichTextEditor
                        content={formData.uses_content}
                        onChange={(content) => setFormData({ ...formData, uses_content: content })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rating">Valutazione (0-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Domande Frequenti (FAQ)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.faq_items.map((faq, index) => (
                      <div 
                        key={faq.id} 
                        className="border rounded-lg p-4 space-y-3 bg-background"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", index.toString());
                          e.currentTarget.classList.add("opacity-50");
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.classList.remove("opacity-50");
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add("border-verde-primary", "border-2");
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove("border-verde-primary", "border-2");
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove("border-verde-primary", "border-2");
                          const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                          const toIndex = index;
                          if (fromIndex !== toIndex) {
                            const updated = [...formData.faq_items];
                            const [movedItem] = updated.splice(fromIndex, 1);
                            updated.splice(toIndex, 0, movedItem);
                            setFormData({ ...formData, faq_items: updated });
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing mt-6">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label>Domanda {index + 1}</Label>
                            <Input
                              value={faq.question}
                              onChange={(e) => {
                                const updated = [...formData.faq_items];
                                updated[index].question = e.target.value;
                                setFormData({ ...formData, faq_items: updated });
                              }}
                              placeholder="Inserisci la domanda..."
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive mt-6"
                            onClick={() => {
                              const updated = formData.faq_items.filter((_, i) => i !== index);
                              setFormData({ ...formData, faq_items: updated });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2 pl-7">
                          <Label>Risposta</Label>
                          <RichTextEditor
                            content={faq.answer}
                            onChange={(content) => {
                              const updated = [...formData.faq_items];
                              updated[index].answer = content;
                              setFormData({ ...formData, faq_items: updated });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newFaq: FAQItem = {
                          id: crypto.randomUUID(),
                          question: "",
                          answer: "",
                        };
                        setFormData({ ...formData, faq_items: [...formData.faq_items, newFaq] });
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi FAQ
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Immagine in Evidenza</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MediaSelector
                      value={formData.image_id}
                      onChange={(imageId, imageUrlValue) => {
                        setFormData({ ...formData, image_id: imageId });
                        setImageUrl(imageUrlValue);
                      }}
                      altText={formData.image_alt}
                      onAltTextChange={(altText) => setFormData({ ...formData, image_alt: altText })}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Opzioni</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="popular">Segna come Popolare</Label>
                      <Switch
                        id="popular"
                        checked={formData.popular}
                        onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                      />
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
              baseUrl="verdedoro.it/microgreens"
              onGenerateStructuredData={generateStructuredData}
              generateButtonLabel="Genera Dati Strutturati"
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

export default AdminProductEdit;
