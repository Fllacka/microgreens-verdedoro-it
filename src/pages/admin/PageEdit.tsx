import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SEOFields } from "@/components/admin/SEOFields";
import { PublishActionBar } from "@/components/admin/PublishActionBar";
import { ArrowLeft, FileText, Search } from "lucide-react";

export default function PageEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    published: false,
    template: "default",
  });

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
          content: data.content || "",
          published: data.published || false,
          template: data.template || "default",
        });

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
        title: formData.title,
        slug: seoData.slug,
        content: formData.content,
        published: publishState !== undefined ? publishState : formData.published,
        template: formData.template,
        meta_title: seoData.metaTitle,
        meta_description: seoData.metaDescription,
        og_title: seoData.ogTitle,
        og_description: seoData.ogDescription,
        canonical_url: seoData.canonicalUrl,
        robots: seoData.robots,
        change_frequency: seoData.changeFrequency,
        priority: parseFloat(seoData.priority),
        structured_data: seoData.structuredData ? JSON.parse(seoData.structuredData) : null,
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

  const previewUrl = seoData.slug ? `/preview/page/${seoData.slug}` : undefined;

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

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">
              <FileText className="h-4 w-4 mr-2" />
              Contenuto
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
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
    </AdminLayout>
  );
}
