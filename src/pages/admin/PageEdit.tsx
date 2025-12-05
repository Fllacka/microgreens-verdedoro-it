import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SEOFields } from "@/components/admin/SEOFields";
import { PublishActionBar } from "@/components/admin/PublishActionBar";
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
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePage = async (publishState?: boolean) => {
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const pageData = {
        ...formData,
        published: publishState !== undefined ? publishState : formData.published,
        created_by: user?.id,
      };

      if (isNew) {
        const { data, error } = await supabase.from("pages").insert([pageData]).select().single();
        if (error) throw error;
        toast({
          title: "Successo",
          description: "Pagina creata con successo",
        });
        navigate(`/admin/pages/${data.id}`);
      } else {
        const { error } = await supabase
          .from("pages")
          .update(pageData)
          .eq("id", id);
        if (error) throw error;
        if (publishState !== undefined) {
          setFormData(prev => ({ ...prev, published: publishState }));
        }
        toast({
          title: "Successo",
          description: "Pagina aggiornata con successo",
        });
      }
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

  const handleSave = async () => {
    await savePage();
  };

  const handlePublish = async (publish: boolean) => {
    await savePage(publish);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          Caricamento...
        </div>
      </AdminLayout>
    );
  }

  const previewUrl = formData.slug ? `/preview/page/${formData.slug}` : undefined;

  return (
    <AdminLayout>
      <div className="space-y-6 pb-24">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/pages")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isNew ? "Nuova Pagina" : "Modifica Pagina"}
            </h1>
            <p className="text-muted-foreground">Crea e gestisci i contenuti della pagina</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Pagina</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titolo *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contenuto</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) =>
                      setFormData({ ...formData, content })
                    }
                  />
                </div>
              </CardContent>
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
}
