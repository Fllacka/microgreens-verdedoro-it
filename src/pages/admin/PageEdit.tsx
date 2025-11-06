import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SEOFields } from "@/components/admin/SEOFields";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";

export default function PageEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    published: false,
    template: "default",
    meta_title: "",
    meta_description: "",
    og_title: "",
    og_description: "",
    canonical_url: "",
    robots: "index, follow",
    change_frequency: "monthly",
    priority: 0.5,
  });

  useEffect(() => {
    if (!isNew) {
      fetchPage();
    }
  }, [id]);

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title || "",
          slug: data.slug || "",
          content: data.content || "",
          published: data.published || false,
          template: data.template || "default",
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
          og_title: data.og_title || "",
          og_description: data.og_description || "",
          canonical_url: data.canonical_url || "",
          robots: data.robots || "index, follow",
          change_frequency: data.change_frequency || "monthly",
          priority: data.priority || 0.5,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const pageData = {
        ...formData,
        created_by: user?.id,
      };

      if (isNew) {
        const { error } = await supabase.from("pages").insert([pageData]);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Page created successfully",
        });
      } else {
        const { error } = await supabase
          .from("pages")
          .update(pageData)
          .eq("id", id);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Page updated successfully",
        });
      }

      navigate("/admin/pages");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          Loading...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/pages")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">
            {isNew ? "New Page" : "Edit Page"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="published">Publish Page</Label>
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, published: checked })
                }
              />
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Content</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) =>
                  setFormData({ ...formData, content })
                }
              />
            </div>
          </Card>

          <SEOFields
            values={{
              slug: formData.slug,
              metaTitle: formData.meta_title,
              metaDescription: formData.meta_description,
              ogTitle: formData.og_title,
              ogDescription: formData.og_description,
              canonicalUrl: formData.canonical_url,
              robots: formData.robots,
              changeFrequency: formData.change_frequency,
              priority: formData.priority.toString(),
              structuredData: "",
            }}
            onChange={(field, value) => {
              const fieldMap: Record<string, string> = {
                slug: "slug",
                metaTitle: "meta_title",
                metaDescription: "meta_description",
                ogTitle: "og_title",
                ogDescription: "og_description",
                canonicalUrl: "canonical_url",
                robots: "robots",
                changeFrequency: "change_frequency",
                priority: "priority",
              };
              const dbField = fieldMap[field] || field;
              const processedValue = field === "priority" ? parseFloat(value as string) : value;
              setFormData({ ...formData, [dbField]: processedValue });
            }}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Page"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/pages")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
