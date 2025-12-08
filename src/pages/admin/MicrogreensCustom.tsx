import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, GripVertical, Search, Image, MessageSquare, Leaf, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { SEOFields } from "@/components/admin/SEOFields";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { PublishActionBar } from "@/components/admin/PublishActionBar";

interface Category {
  id: string;
  name: string;
  items: string[];
  is_visible: boolean;
}

interface SectionContent {
  [key: string]: any;
}

interface Section {
  id: string;
  content: SectionContent;
  is_visible: boolean;
  sort_order: number;
}

const AdminMicrogreensCustom = () => {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || (userRole !== 'admin' && userRole !== 'editor'))) {
      navigate('/admin/login');
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('microgreens_custom_sections')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      const typedData = (data || []) as unknown as Section[];
      setSections(typedData);
      
      const seoSection = typedData.find(s => s.id === 'seo');
      setIsPublished(seoSection?.content?.published || false);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Errore nel caricamento delle sezioni');
    } finally {
      setLoading(false);
    }
  };

  const updateSectionContent = (sectionId: string, field: string, value: any) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          content: { ...section.content, [field]: value }
        };
      }
      return section;
    }));
    setHasChanges(true);
  };

  const updateSectionVisibility = (sectionId: string, isVisible: boolean) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return { ...section, is_visible: isVisible };
      }
      return section;
    }));
    setHasChanges(true);
  };

  const getSection = (id: string) => sections.find(s => s.id === id);

  // Category management
  const addCategory = () => {
    const varietiesSection = getSection('varieties');
    if (!varietiesSection) return;

    const categories = varietiesSection.content.categories || [];
    const newCategory: Category = {
      id: Date.now().toString(),
      name: "Nuova Categoria",
      items: ["Esempio varietà 1"],
      is_visible: true
    };

    updateSectionContent('varieties', 'categories', [...categories, newCategory]);
  };

  const updateCategory = (categoryId: string, field: keyof Category, value: any) => {
    const varietiesSection = getSection('varieties');
    if (!varietiesSection) return;

    const categories = varietiesSection.content.categories || [];
    const updatedCategories = categories.map((cat: Category) => {
      if (cat.id === categoryId) {
        return { ...cat, [field]: value };
      }
      return cat;
    });

    updateSectionContent('varieties', 'categories', updatedCategories);
  };

  const deleteCategory = (categoryId: string) => {
    const varietiesSection = getSection('varieties');
    if (!varietiesSection) return;

    const categories = varietiesSection.content.categories || [];
    const updatedCategories = categories.filter((cat: Category) => cat.id !== categoryId);
    updateSectionContent('varieties', 'categories', updatedCategories);
  };

  const addItemToCategory = (categoryId: string) => {
    const varietiesSection = getSection('varieties');
    if (!varietiesSection) return;

    const categories = varietiesSection.content.categories || [];
    const updatedCategories = categories.map((cat: Category) => {
      if (cat.id === categoryId) {
        return { ...cat, items: [...cat.items, "Nuova varietà"] };
      }
      return cat;
    });

    updateSectionContent('varieties', 'categories', updatedCategories);
  };

  const updateCategoryItem = (categoryId: string, itemIndex: number, value: string) => {
    const varietiesSection = getSection('varieties');
    if (!varietiesSection) return;

    const categories = varietiesSection.content.categories || [];
    const updatedCategories = categories.map((cat: Category) => {
      if (cat.id === categoryId) {
        const newItems = [...cat.items];
        newItems[itemIndex] = value;
        return { ...cat, items: newItems };
      }
      return cat;
    });

    updateSectionContent('varieties', 'categories', updatedCategories);
  };

  const deleteCategoryItem = (categoryId: string, itemIndex: number) => {
    const varietiesSection = getSection('varieties');
    if (!varietiesSection) return;

    const categories = varietiesSection.content.categories || [];
    const updatedCategories = categories.map((cat: Category) => {
      if (cat.id === categoryId) {
        const newItems = cat.items.filter((_, idx) => idx !== itemIndex);
        return { ...cat, items: newItems };
      }
      return cat;
    });

    updateSectionContent('varieties', 'categories', updatedCategories);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const section of sections) {
        const { error } = await supabase
          .from('microgreens_custom_sections')
          .update({
            content: section.content,
            is_visible: section.is_visible
          })
          .eq('id', section.id);
        
        if (error) throw error;
      }
      
      toast.success('Modifiche salvate con successo');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (publish: boolean) => {
    setSaving(true);
    try {
      await handleSave();
      
      const seoSection = getSection('seo');
      if (seoSection) {
        const { error } = await supabase
          .from('microgreens_custom_sections')
          .update({
            content: { ...seoSection.content, published: publish }
          })
          .eq('id', 'seo');
        
        if (error) throw error;
      }
      
      setIsPublished(publish);
      toast.success(publish ? 'Pagina pubblicata' : 'Pagina rimossa dalla pubblicazione');
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Errore nella pubblicazione');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Caricamento...</div>
        </div>
      </AdminLayout>
    );
  }

  const seoSection = getSection('seo');
  const heroSection = getSection('hero');
  const introSection = getSection('intro');
  const varietiesSection = getSection('varieties');
  const ctaSection = getSection('cta');

  return (
    <AdminLayout>
      <div className="space-y-6 pb-24">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Microgreens su Misura</h1>
          <p className="text-muted-foreground mt-1">Gestisci i contenuti della pagina Microgreens su Misura</p>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Contenuti</TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Hero Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Hero Section
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="hero-visible">Visibile</Label>
                  <Switch
                    id="hero-visible"
                    checked={heroSection?.is_visible ?? true}
                    onCheckedChange={(checked) => updateSectionVisibility('hero', checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero-title">Titolo</Label>
                  <Input
                    id="hero-title"
                    value={heroSection?.content?.title || ''}
                    onChange={(e) => updateSectionContent('hero', 'title', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Immagine di sfondo</Label>
                  <MediaSelector
                    value={heroSection?.content?.image_url || ''}
                    onChange={(url) => updateSectionContent('hero', 'image_url', url)}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-image-alt">Alt text immagine</Label>
                  <Input
                    id="hero-image-alt"
                    value={heroSection?.content?.image_alt || ''}
                    onChange={(e) => updateSectionContent('hero', 'image_alt', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Intro Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Introduzione
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="intro-visible">Visibile</Label>
                  <Switch
                    id="intro-visible"
                    checked={introSection?.is_visible ?? true}
                    onCheckedChange={(checked) => updateSectionVisibility('intro', checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="intro-text">Testo</Label>
                  <Textarea
                    id="intro-text"
                    value={introSection?.content?.text || ''}
                    onChange={(e) => updateSectionContent('intro', 'text', e.target.value)}
                    rows={5}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Immagine</Label>
                  <MediaSelector
                    value={introSection?.content?.image_url || ''}
                    onChange={(url) => updateSectionContent('intro', 'image_url', url)}
                  />
                </div>
                <div>
                  <Label htmlFor="intro-image-alt">Alt text immagine</Label>
                  <Input
                    id="intro-image-alt"
                    value={introSection?.content?.image_alt || ''}
                    onChange={(e) => updateSectionContent('intro', 'image_alt', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Varieties Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Varietà Disponibili
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="varieties-visible">Visibile</Label>
                  <Switch
                    id="varieties-visible"
                    checked={varietiesSection?.is_visible ?? true}
                    onCheckedChange={(checked) => updateSectionVisibility('varieties', checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="varieties-title">Titolo sezione</Label>
                  <Input
                    id="varieties-title"
                    value={varietiesSection?.content?.title || ''}
                    onChange={(e) => updateSectionContent('varieties', 'title', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="varieties-description">Descrizione</Label>
                  <Textarea
                    id="varieties-description"
                    value={varietiesSection?.content?.description || ''}
                    onChange={(e) => updateSectionContent('varieties', 'description', e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Categorie</Label>
                    <Button size="sm" onClick={addCategory}>
                      <Plus className="w-4 h-4 mr-1" />
                      Aggiungi Categoria
                    </Button>
                  </div>

                  {(varietiesSection?.content?.categories || []).map((category: Category) => (
                    <Card key={category.id} className="border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <CardTitle className="text-base">{category.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Visibile</Label>
                              <Switch
                                checked={category.is_visible}
                                onCheckedChange={(checked) => updateCategory(category.id, 'is_visible', checked)}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCategory(category.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Nome categoria</Label>
                          <Input
                            value={category.name}
                            onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Varietà</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addItemToCategory(category.id)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Aggiungi
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {category.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center gap-2">
                                <Input
                                  value={item}
                                  onChange={(e) => updateCategoryItem(category.id, itemIndex, e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteCategoryItem(category.id, itemIndex)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Call to Action
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="cta-visible">Visibile</Label>
                  <Switch
                    id="cta-visible"
                    checked={ctaSection?.is_visible ?? true}
                    onCheckedChange={(checked) => updateSectionVisibility('cta', checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cta-title">Titolo</Label>
                  <Input
                    id="cta-title"
                    value={ctaSection?.content?.title || ''}
                    onChange={(e) => updateSectionContent('cta', 'title', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cta-description">Descrizione</Label>
                  <Textarea
                    id="cta-description"
                    value={ctaSection?.content?.description || ''}
                    onChange={(e) => updateSectionContent('cta', 'description', e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cta-button-text">Testo pulsante</Label>
                  <Input
                    id="cta-button-text"
                    value={ctaSection?.content?.button_text || ''}
                    onChange={(e) => updateSectionContent('cta', 'button_text', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cta-button-link">Link pulsante</Label>
                  <Input
                    id="cta-button-link"
                    value={ctaSection?.content?.button_link || ''}
                    onChange={(e) => updateSectionContent('cta', 'button_link', e.target.value)}
                    placeholder="/contatti"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            {seoSection && (
              <SEOFields
                values={{
                  slug: seoSection.content.slug || '',
                  metaTitle: seoSection.content.meta_title || '',
                  metaDescription: seoSection.content.meta_description || '',
                  ogTitle: seoSection.content.og_title || '',
                  ogDescription: seoSection.content.og_description || '',
                  canonicalUrl: seoSection.content.canonical_url || '',
                  robots: seoSection.content.robots || 'index, follow',
                  changeFrequency: seoSection.content.change_frequency || 'monthly',
                  priority: seoSection.content.priority || '0.7',
                  structuredData: seoSection.content.structured_data || ''
                }}
                onChange={(field, value) => {
                  const fieldMap: Record<string, string> = {
                    metaTitle: 'meta_title',
                    metaDescription: 'meta_description',
                    ogTitle: 'og_title',
                    ogDescription: 'og_description',
                    canonicalUrl: 'canonical_url',
                    changeFrequency: 'change_frequency',
                    structuredData: 'structured_data'
                  };
                  updateSectionContent('seo', fieldMap[field] || field, value);
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <PublishActionBar
        isPublished={isPublished}
        isSaving={saving}
        hasChanges={hasChanges}
        onSave={handleSave}
        onPublish={handlePublish}
        previewUrl="/preview/microgreens-custom"
      />
    </AdminLayout>
  );
};

export default AdminMicrogreensCustom;