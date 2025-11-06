import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentBlockEditor, ContentBlock } from "@/components/admin/ContentBlockEditor";
import { SEOFields } from "@/components/admin/SEOFields";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft } from "lucide-react";

const AdminBlogEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "",
    tags: "",
    published: false,
  });

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

  const [seoData, setSeoData] = useState({
    slug: "",
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    canonicalUrl: "",
    robots: "index, follow",
    changeFrequency: "monthly",
    priority: "0.5",
    structuredData: "",
  });

  useEffect(() => {
    if (!isNew) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || "",
        excerpt: data.excerpt || "",
        category: data.category || "",
        tags: data.tags?.join(", ") || "",
        published: data.published || false,
      });

      // Load content blocks (new format) or migrate from old content field
      if (data.content_blocks && Array.isArray(data.content_blocks) && data.content_blocks.length > 0) {
        setContentBlocks(data.content_blocks as unknown as ContentBlock[]);
      } else if (data.content) {
        // Migrate old content to a single text block
        setContentBlocks([
          {
            id: crypto.randomUUID(),
            type: "text",
            content: data.content,
          },
        ]);
      }

      setSeoData({
        slug: data.slug || "",
        metaTitle: data.meta_title || "",
        metaDescription: data.meta_description || "",
        ogTitle: data.og_title || "",
        ogDescription: data.og_description || "",
        canonicalUrl: data.canonical_url || "",
        robots: data.robots || "index, follow",
        changeFrequency: data.change_frequency || "monthly",
        priority: data.priority?.toString() || "0.5",
        structuredData: data.structured_data ? JSON.stringify(data.structured_data, null, 2) : "",
      });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      toast({
        title: "Error",
        description: "Failed to load blog post",
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
      const postData = {
        title: formData.title,
        slug: seoData.slug,
        excerpt: formData.excerpt,
        content_blocks: contentBlocks as any,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
        published: formData.published,
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
        const { error } = await supabase.from("blog_posts").insert(postData);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").update(postData).eq("id", id);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Blog post ${isNew ? "created" : "updated"} successfully`,
      });
      navigate("/admin/blog");
    } catch (error: any) {
      console.error("Error saving blog post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save blog post",
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
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/admin/blog")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{isNew ? "New Blog Post" : "Edit Blog Post"}</h1>
              <p className="text-muted-foreground">Create and manage blog content</p>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save Post
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Post Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content Blocks</Label>
                  <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
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
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="health, nutrition, microgreens"
                    />
                  </div>
                </div>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminBlogEdit;