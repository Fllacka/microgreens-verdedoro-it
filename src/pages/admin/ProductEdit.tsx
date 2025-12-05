import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SEOFields } from "@/components/admin/SEOFields";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { PublishActionBar } from "@/components/admin/PublishActionBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    category: "",
    price: "",
    benefits: "",
    uses: "",
    benefits_content: "",
    uses_content: "",
    rating: "",
    popular: false,
    published: false,
    image_id: null as string | null,
    image_alt: "",
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

  useEffect(() => {
    if (!isNew) {
      fetchProduct();
    }
  }, [id]);

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
        category: data.category || "",
        price: data.price?.toString() || "",
        benefits: data.benefits?.join(", ") || "",
        uses: data.uses?.join(", ") || "",
        benefits_content: (data as any).benefits_content || "",
        uses_content: (data as any).uses_content || "",
        rating: data.rating?.toString() || "",
        popular: data.popular || false,
        published: data.published || false,
        image_id: data.image_id || null,
        image_alt: (data as any).image_alt || "",
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
        category: formData.category,
        price: formData.price ? parseFloat(formData.price) : null,
        benefits: formData.benefits ? formData.benefits.split(",").map(b => b.trim()) : [],
        uses: formData.uses ? formData.uses.split(",").map(u => u.trim()) : [],
        benefits_content: formData.benefits_content,
        uses_content: formData.uses_content,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        popular: formData.popular,
        published: publishState !== undefined ? publishState : formData.published,
        image_id: formData.image_id,
        image_alt: formData.image_alt,
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

  const previewUrl = seoData.slug ? `/microgreens/${seoData.slug}` : undefined;

  return (
    <AdminLayout>
      <div className="space-y-8 pb-24">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isNew ? "Nuovo Prodotto" : "Modifica Prodotto"}</h1>
            <p className="text-muted-foreground">Crea e gestisci i dettagli del prodotto</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
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
                  <Label htmlFor="content">Descrizione Completa</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
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

            <SEOFields
              values={seoData}
              onChange={(field, value) => setSeoData({ ...seoData, [field]: value })}
            />
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
      </div>

      <PublishActionBar
        isPublished={formData.published}
        isSaving={saving}
        onSave={handleSave}
        onPublish={handlePublish}
        previewUrl={previewUrl}
      />
    </AdminLayout>
  );
};

export default AdminProductEdit;
