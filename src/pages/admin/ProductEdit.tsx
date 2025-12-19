import { useState, useEffect, useRef } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Package, Plus, Trash2, HelpCircle, GripVertical } from "lucide-react";

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

const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const initialDataLoaded = useRef(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    content_title: "Panoramica del Prodotto",
    category: "",
    price: "",
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
    fetchCategories();
    if (!isNew) {
      fetchProduct();
    } else {
      initialDataLoaded.current = true;
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

      setFormData({
        name: data.name || "",
        description: data.description || "",
        content: data.content || "",
        content_title: (data as any).content_title || "Panoramica del Prodotto",
        category: data.category || "",
        price: data.price?.toString() || "",
        benefits: data.benefits?.join(", ") || "",
        uses: data.uses?.join(", ") || "",
        benefits_content: (data as any).benefits_content || "",
        benefits_title: (data as any).benefits_title || "Benefici",
        uses_content: (data as any).uses_content || "",
        uses_title: (data as any).uses_title || "Usi Culinari",
        rating: data.rating?.toString() || "",
        popular: data.popular || false,
        published: data.published || false,
        image_id: data.image_id || null,
        image_alt: (data as any).image_alt || "",
        faq_items: (data as any).faq_items || [],
      });

      setSeoData({
        slug: data.slug || "",
        metaTitle: data.meta_title || "",
        metaDescription: data.meta_description || "",
        ogTitle: data.og_title || "",
        ogDescription: data.og_description || "",
        canonicalUrl: data.canonical_url || "",
        robots: data.robots || "index, follow",
        changeFrequency: data.change_frequency || "weekly",
        priority: data.priority?.toString() || "0.5",
        structuredData: data.structured_data ? JSON.stringify(data.structured_data, null, 2) : "",
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il prodotto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      initialDataLoaded.current = true;
    }
  };

  const saveProduct = async (publishState?: boolean) => {
    setSaving(true);

    try {
      const productData = {
        name: formData.name,
        slug: seoData.slug,
        description: formData.description,
        content: formData.content,
        content_title: formData.content_title,
        category: formData.category,
        price: formData.price ? parseFloat(formData.price) : null,
        benefits: formData.benefits ? formData.benefits.split(",").map(b => b.trim()) : [],
        uses: formData.uses ? formData.uses.split(",").map(u => u.trim()) : [],
        benefits_content: formData.benefits_content,
        benefits_title: formData.benefits_title,
        uses_content: formData.uses_content,
        uses_title: formData.uses_title,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        popular: formData.popular,
        published: publishState !== undefined ? publishState : formData.published,
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
      };

      if (isNew) {
        const { data, error } = await supabase.from("products").insert(productData).select().single();
        if (error) throw error;
        toast({
          title: "Successo",
          description: "Prodotto creato con successo",
        });
        navigate(`/admin/products/${data.id}`);
      } else {
        const { error } = await supabase.from("products").update(productData).eq("id", id);
        if (error) throw error;
        if (publishState !== undefined) {
          setFormData(prev => ({ ...prev, published: publishState }));
        }
        toast({
          title: "Successo",
          description: "Prodotto aggiornato con successo",
        });
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare il prodotto",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setHasChanges(false);
    }
  };

  const handleSave = async () => {
    await saveProduct();
  };

  const handlePublish = async (publish: boolean) => {
    await saveProduct(publish);
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                      <div className="space-y-2">
                        <Label htmlFor="price">Prezzo (€)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                      </div>
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
                      onChange={(imageId) => setFormData({ ...formData, image_id: imageId })}
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

export default AdminProductEdit;
