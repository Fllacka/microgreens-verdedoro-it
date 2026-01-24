import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentBlockEditor, ContentBlock } from "@/components/admin/ContentBlockEditor";
import { SEOFields } from "@/components/admin/SEOFields";
import { PublishActionBar } from "@/components/admin/PublishActionBar";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { UnsavedChangesDialog } from "@/components/admin/UnsavedChangesDialog";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, PenSquare, Search, Image } from "lucide-react";

interface HeroContent {
  title: string;
  subtitle: string;
  imageId?: string | null;
}

interface SeoContent {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageId?: string | null;
  canonicalUrl: string;
  robots: string;
  changeFrequency: string;
  priority: string;
  structuredData: string;
}

interface DatabaseSection {
  id: string;
  content: Record<string, any>;
  is_visible: boolean;
  sort_order: number;
  draft_content?: Record<string, any> | null;
  draft_is_visible?: boolean | null;
  has_draft_changes?: boolean;
}

const AdminCosaSonoMicrogreens = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const initialDataLoaded = useRef(false);

  const [heroData, setHeroData] = useState<HeroContent>({
    title: "Cosa sono i Microgreens?",
    subtitle: "Scopri il mondo delle micro-verdure: nutrienti, sostenibili e sorprendenti",
    imageId: null,
  });

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

  const [seoData, setSeoData] = useState<SeoContent>({
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    ogImageId: null,
    canonicalUrl: "",
    robots: "index, follow",
    changeFrequency: "monthly",
    priority: "0.8",
    structuredData: "",
  });

  // Unsaved changes warning
  const { isBlocked, proceed, reset } = useUnsavedChangesWarning({
    hasUnsavedChanges: hasChanges,
  });

  // Track changes after initial load
  useEffect(() => {
    if (initialDataLoaded.current) {
      setHasChanges(true);
    }
  }, [heroData, contentBlocks, seoData]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("cosa_sono_microgreens_sections")
        .select("*")
        .order("sort_order");

      if (error) throw error;

      let anyDraftChanges = false;
      if (data) {
        data.forEach((section) => {
          const dbSection = section as unknown as DatabaseSection;
          // Prioritize draft content if available
          const content = (dbSection.draft_content ?? dbSection.content) as Record<string, any>;
          if (dbSection.has_draft_changes) anyDraftChanges = true;
          
          switch (dbSection.id) {
            case "hero":
              setHeroData({
                title: content.title || "",
                subtitle: content.subtitle || "",
                imageId: content.imageId || null,
              });
              break;
            case "content":
              if (content.blocks && Array.isArray(content.blocks)) {
                setContentBlocks(content.blocks as ContentBlock[]);
              }
              break;
            case "seo":
              setSeoData({
                metaTitle: content.metaTitle || "",
                metaDescription: content.metaDescription || "",
                ogTitle: content.ogTitle || "",
                ogDescription: content.ogDescription || "",
                ogImageId: content.ogImageId || null,
                canonicalUrl: content.canonicalUrl || "",
                robots: content.robots || "index, follow",
                changeFrequency: content.changeFrequency || "monthly",
                priority: content.priority || "0.8",
                structuredData: content.structuredData || "",
              });
              setIsPublished(content.published !== false);
              break;
          }
        });
      }
      setHasDraftChanges(anyDraftChanges);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il contenuto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      initialDataLoaded.current = true;
    }
  };

  const saveContent = async (publishState?: boolean) => {
    setSaving(true);

    try {
      const heroContent = {
        title: heroData.title,
        subtitle: heroData.subtitle,
        imageId: heroData.imageId,
      };
      
      const contentContent = {
        blocks: contentBlocks,
      };
      
      const seoContent = {
        metaTitle: seoData.metaTitle,
        metaDescription: seoData.metaDescription,
        ogTitle: seoData.ogTitle,
        ogDescription: seoData.ogDescription,
        ogImageId: seoData.ogImageId,
        canonicalUrl: seoData.canonicalUrl,
        robots: seoData.robots,
        changeFrequency: seoData.changeFrequency,
        priority: seoData.priority,
        structuredData: seoData.structuredData,
        published: publishState !== undefined ? publishState : isPublished,
      };

      if (publishState !== undefined) {
        // Publishing: copy to live columns
        const { error: heroError } = await supabase
          .from("cosa_sono_microgreens_sections")
          .upsert([{
            id: "hero",
            content: heroContent,
            draft_content: null,
            draft_is_visible: null,
            has_draft_changes: false,
            sort_order: 1,
          }] as any);
        if (heroError) throw heroError;

        const { error: contentError } = await supabase
          .from("cosa_sono_microgreens_sections")
          .upsert([{
            id: "content",
            content: contentContent,
            draft_content: null,
            draft_is_visible: null,
            has_draft_changes: false,
            sort_order: 2,
          }] as any);
        if (contentError) throw contentError;

        const { error: seoError } = await supabase
          .from("cosa_sono_microgreens_sections")
          .upsert([{
            id: "seo",
            content: seoContent,
            draft_content: null,
            draft_is_visible: null,
            has_draft_changes: false,
            sort_order: 0,
          }] as any);
        if (seoError) throw seoError;

        setIsPublished(publishState);
        setHasDraftChanges(false);
        toast({
          title: "Pubblicato",
          description: "Contenuto pubblicato con successo",
        });
      } else {
        // Saving as draft
        const { error: heroError } = await supabase
          .from("cosa_sono_microgreens_sections")
          .upsert([{
            id: "hero",
            draft_content: heroContent,
            has_draft_changes: true,
            sort_order: 1,
          }] as any);
        if (heroError) throw heroError;

        const { error: contentError } = await supabase
          .from("cosa_sono_microgreens_sections")
          .upsert([{
            id: "content",
            draft_content: contentContent,
            has_draft_changes: true,
            sort_order: 2,
          }] as any);
        if (contentError) throw contentError;

        const { error: seoError } = await supabase
          .from("cosa_sono_microgreens_sections")
          .upsert([{
            id: "seo",
            draft_content: seoContent,
            has_draft_changes: true,
            sort_order: 0,
          }] as any);
        if (seoError) throw seoError;

        setHasDraftChanges(true);
        toast({
          title: "Bozza salvata",
          description: "Le modifiche sono state salvate come bozza",
        });
      }

      setHasChanges(false);
    } catch (error: any) {
      console.error("Error saving content:", error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare il contenuto",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await saveContent();
  };

  const handlePublish = async (publish: boolean) => {
    await saveContent(publish);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div>Caricamento...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-8 pb-28 md:pb-24">
        <div className="flex items-center gap-3 md:gap-4">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/admin")} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-bold truncate">Cosa sono i Microgreens?</h1>
            <p className="text-muted-foreground text-sm hidden md:block">Gestisci la pagina informativa sui microgreens</p>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-4 md:space-y-6">
          <TabsList className="w-full md:w-auto grid grid-cols-3 md:flex">
            <TabsTrigger value="content" className="text-xs md:text-sm">
              <PenSquare className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden xs:inline">Contenuto</span>
              <span className="xs:hidden">Testo</span>
            </TabsTrigger>
            <TabsTrigger value="hero" className="text-xs md:text-sm">
              <Image className="h-4 w-4 mr-1 md:mr-2" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs md:text-sm">
              <Search className="h-4 w-4 mr-1 md:mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Blocchi di Contenuto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Aggiungi e modifica i blocchi di contenuto della pagina. Puoi aggiungere titoli, testi con formattazione e immagini.
                </p>
                <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hero" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sezione Hero</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Titolo</Label>
                  <Input
                    id="heroTitle"
                    value={heroData.title}
                    onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Sottotitolo</Label>
                  <Input
                    id="heroSubtitle"
                    value={heroData.subtitle}
                    onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Immagine di Sfondo (opzionale)</Label>
                  <MediaSelector
                    value={heroData.imageId}
                    onChange={(imageId) => setHeroData({ ...heroData, imageId })}
                    showAltText={false}
                  />
                  <p className="text-xs text-muted-foreground">
                    Se non viene selezionata un'immagine, verrà usato un gradiente di sfondo.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <SEOFields
              values={{
                slug: "cosa-sono-i-microgreens",
                metaTitle: seoData.metaTitle,
                metaDescription: seoData.metaDescription,
                ogTitle: seoData.ogTitle,
                ogDescription: seoData.ogDescription,
                canonicalUrl: seoData.canonicalUrl,
                robots: seoData.robots,
                changeFrequency: seoData.changeFrequency,
                priority: seoData.priority,
                structuredData: seoData.structuredData,
              }}
              onChange={(field, value) => {
                if (field !== "slug") {
                  setSeoData({ ...seoData, [field]: value });
                }
              }}
            />
            <Card>
              <CardHeader>
                <CardTitle>Immagine OG</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaSelector
                  value={seoData.ogImageId}
                  onChange={(imageId) => setSeoData({ ...seoData, ogImageId: imageId })}
                  showAltText={false}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Immagine usata per la condivisione sui social media.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PublishActionBar
        isPublished={isPublished}
        isSaving={saving}
        hasDraftChanges={hasDraftChanges || hasChanges}
        onSave={handleSave}
        onPublish={handlePublish}
        previewUrl="/preview/cosa-sono-i-microgreens"
      />

      <UnsavedChangesDialog
        isOpen={isBlocked}
        onConfirm={() => proceed?.()}
        onCancel={() => reset?.()}
      />
    </AdminLayout>
  );
};

export default AdminCosaSonoMicrogreens;
