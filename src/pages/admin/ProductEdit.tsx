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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft } from "lucide-react";

const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    category: "",
    price: "",
    benefits: "",
    uses: "",
    rating: "",
    popular: false,
    published: false,
    image_id: null as string | null,
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
        rating: data.rating?.toString() || "",
        popular: data.popular || false,
        published: data.published || false,
        image_id: data.image_id || null,
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
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        rating: formData.rating ? parseFloat(formData.rating) : null,
        popular: formData.popular,
        published: formData.published,
        image_id: formData.image_id,
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
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").update(productData).eq("id", id);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Product ${isNew ? "created" : "updated"} successfully`,
      });
      navigate("/admin/products");
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isNew) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/admin/products")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{isNew ? "New Product" : "Edit Product"}</h1>
              <p className="text-muted-foreground">Create and manage product details</p>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save Product
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Full Description</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€)</Label>
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
                  <Label htmlFor="benefits">Benefits (comma separated)</Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    placeholder="High in vitamins, Antioxidant, Rich in minerals"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uses">Uses (comma separated)</Label>
                  <Textarea
                    id="uses"
                    value={formData.uses}
                    onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
                    placeholder="Salads, Smoothies, Garnish"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
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
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaSelector
                  value={formData.image_id}
                  onChange={(imageId) => setFormData({ ...formData, image_id: imageId })}
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
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="published">Published</Label>
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="popular">Mark as Popular</Label>
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
      </form>
    </AdminLayout>
  );
};

export default AdminProductEdit;