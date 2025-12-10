import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Image, Info, Navigation, LayoutGrid, Plus, Trash2, GripVertical } from "lucide-react";

interface NavigationItem {
  id: string;
  name: string;
  url: string;
  visible: boolean;
  order: number;
}

interface CtaButton {
  text: string;
  url: string;
  visible: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  visible: boolean;
}

interface QuickLink {
  id: string;
  name: string;
  url: string;
  visible: boolean;
  order: number;
}

interface ContactInfo {
  title: string;
  address: string;
  phone: string;
  email: string;
}

interface LegalLink {
  id: string;
  name: string;
  url: string;
  visible: boolean;
}

interface HeaderSettings {
  navigation_items: NavigationItem[];
  cta_button: CtaButton;
}

interface FooterSettings {
  brand_description: string;
  social_links: SocialLink[];
  quick_links: {
    title: string;
    items: QuickLink[];
  };
  contact_info: ContactInfo;
  cta_button: CtaButton;
  copyright: string;
  legal_links: LegalLink[];
}

const defaultHeaderSettings: HeaderSettings = {
  navigation_items: [
    { id: "1", name: "Home", url: "/", visible: true, order: 0 },
    { id: "2", name: "Chi Siamo", url: "/chi-siamo", visible: true, order: 1 },
    { id: "3", name: "Microgreens", url: "/microgreens", visible: true, order: 2 },
    { id: "4", name: "Su Misura", url: "/microgreens-su-misura", visible: true, order: 3 },
    { id: "5", name: "Blog", url: "/blog", visible: true, order: 4 },
    { id: "6", name: "Contatti", url: "/contatti", visible: true, order: 5 },
  ],
  cta_button: { text: "Ordina Ora", url: "/contatti", visible: true }
};

const defaultFooterSettings: FooterSettings = {
  brand_description: "<p>Coltiviamo microgreens freschi e nutrienti con passione e dedizione, portando sulla tua tavola il meglio della natura.</p>",
  social_links: [
    { platform: "instagram", url: "", visible: true },
    { platform: "facebook", url: "", visible: true },
    { platform: "youtube", url: "", visible: true },
    { platform: "pinterest", url: "", visible: true },
    { platform: "tiktok", url: "", visible: true },
    { platform: "twitter", url: "", visible: false },
    { platform: "linkedin", url: "", visible: false },
    { platform: "whatsapp", url: "", visible: false },
    { platform: "threads", url: "", visible: false },
  ],
  quick_links: {
    title: "Link Utili",
    items: [
      { id: "1", name: "Chi Siamo", url: "/chi-siamo", visible: true, order: 1 },
      { id: "2", name: "I Nostri Microgreens", url: "/microgreens", visible: true, order: 2 },
      { id: "3", name: "Microgreens su Misura", url: "/microgreens-su-misura", visible: true, order: 3 },
      { id: "4", name: "Blog", url: "/blog", visible: true, order: 4 },
      { id: "5", name: "Contatti", url: "/contatti", visible: true, order: 5 },
    ]
  },
  contact_info: {
    title: "Contatti",
    address: "Reggio Emilia, Italia",
    phone: "+39 000 000 0000",
    email: "info@verdedoro.it"
  },
  cta_button: { text: "Contattaci", url: "/contatti", visible: true },
  copyright: "© {year} Verde D'Oro Microgreens. Tutti i diritti riservati.",
  legal_links: [
    { id: "1", name: "Privacy Policy", url: "/privacy", visible: true },
    { id: "2", name: "Termini di Servizio", url: "/terms", visible: true },
  ]
};

const socialPlatformOptions = [
  { value: "instagram", label: "Instagram", icon: "📷" },
  { value: "facebook", label: "Facebook", icon: "📘" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "pinterest", label: "Pinterest", icon: "📌" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "twitter", label: "X (Twitter)", icon: "𝕏" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "whatsapp", label: "WhatsApp", icon: "💬" },
  { value: "threads", label: "Threads", icon: "🧵" },
];

const Settings = () => {
  const [logoId, setLogoId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(defaultHeaderSettings);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select(`
          logo_id,
          header_settings,
          footer_settings,
          media:logo_id (
            file_path
          )
        `)
        .eq("id", "default")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setLogoId(data.logo_id);
        if (data.media && typeof data.media === 'object' && 'file_path' in data.media) {
          setLogoUrl(data.media.file_path as string);
        }
        if (data.header_settings) {
          setHeaderSettings(data.header_settings as unknown as HeaderSettings);
        }
        if (data.footer_settings) {
          const dbFooterSettings = data.footer_settings as unknown as FooterSettings;
          
          // Merge social links - ensure all default platforms exist
          const mergedSocialLinks = defaultFooterSettings.social_links.map(defaultLink => {
            const existingLink = dbFooterSettings.social_links?.find(
              link => link.platform === defaultLink.platform
            );
            return existingLink || defaultLink;
          });
          
          setFooterSettings({
            ...dbFooterSettings,
            social_links: mergedSocialLinks
          });
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Errore nel caricamento delle impostazioni");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (imageId: string | null, imageUrl: string | null) => {
    setLogoId(imageId);
    setLogoUrl(imageUrl);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ 
          logo_id: logoId,
          header_settings: JSON.parse(JSON.stringify(headerSettings)),
          footer_settings: JSON.parse(JSON.stringify(footerSettings))
        })
        .eq("id", "default");

      if (error) throw error;

      toast.success("Impostazioni salvate con successo");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Errore nel salvataggio delle impostazioni");
    } finally {
      setIsSaving(false);
    }
  };

  // Navigation item handlers
  const addNavItem = () => {
    const newItem: NavigationItem = {
      id: Date.now().toString(),
      name: "Nuovo Link",
      url: "/",
      visible: true,
      order: headerSettings.navigation_items.length
    };
    setHeaderSettings({
      ...headerSettings,
      navigation_items: [...headerSettings.navigation_items, newItem]
    });
  };

  const updateNavItem = (id: string, field: keyof NavigationItem, value: string | boolean | number) => {
    setHeaderSettings({
      ...headerSettings,
      navigation_items: headerSettings.navigation_items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const removeNavItem = (id: string) => {
    setHeaderSettings({
      ...headerSettings,
      navigation_items: headerSettings.navigation_items.filter(item => item.id !== id)
    });
  };

  // Quick links handlers
  const addQuickLink = () => {
    const newLink: QuickLink = {
      id: Date.now().toString(),
      name: "Nuovo Link",
      url: "/",
      visible: true,
      order: footerSettings.quick_links.items.length
    };
    setFooterSettings({
      ...footerSettings,
      quick_links: {
        ...footerSettings.quick_links,
        items: [...footerSettings.quick_links.items, newLink]
      }
    });
  };

  const updateQuickLink = (id: string, field: keyof QuickLink, value: string | boolean | number) => {
    setFooterSettings({
      ...footerSettings,
      quick_links: {
        ...footerSettings.quick_links,
        items: footerSettings.quick_links.items.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    });
  };

  const removeQuickLink = (id: string) => {
    setFooterSettings({
      ...footerSettings,
      quick_links: {
        ...footerSettings.quick_links,
        items: footerSettings.quick_links.items.filter(item => item.id !== id)
      }
    });
  };

  // Social links handlers
  const updateSocialLink = (platform: string, field: keyof SocialLink, value: string | boolean) => {
    setFooterSettings({
      ...footerSettings,
      social_links: footerSettings.social_links.map(link =>
        link.platform === platform ? { ...link, [field]: value } : link
      )
    });
  };

  // Legal links handlers
  const addLegalLink = () => {
    const newLink: LegalLink = {
      id: Date.now().toString(),
      name: "Nuovo Link",
      url: "/",
      visible: true
    };
    setFooterSettings({
      ...footerSettings,
      legal_links: [...footerSettings.legal_links, newLink]
    });
  };

  const updateLegalLink = (id: string, field: keyof LegalLink, value: string | boolean) => {
    setFooterSettings({
      ...footerSettings,
      legal_links: footerSettings.legal_links.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    });
  };

  const removeLegalLink = (id: string) => {
    setFooterSettings({
      ...footerSettings,
      legal_links: footerSettings.legal_links.filter(link => link.id !== id)
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Impostazioni Sito
            </h1>
            <p className="text-muted-foreground mt-1">
              Configura le impostazioni generali del sito
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Salvataggio..." : "Salva"}
          </Button>
        </div>

        <Tabs defaultValue="logo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logo" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Logo & Generali
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Navigazione
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Footer
            </TabsTrigger>
          </TabsList>

          {/* Logo Tab */}
          <TabsContent value="logo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Logo del Sito
                </CardTitle>
                <CardDescription>
                  Carica il logo che apparirà nella navigazione e nel footer del sito
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Requisiti del logo:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Formato:</strong> PNG con sfondo trasparente (consigliato)</li>
                      <li><strong>Dimensioni consigliate:</strong> 400-600px di larghezza</li>
                      <li><strong>Altezza massima visualizzata:</strong> 56px nella navigazione</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Seleziona o Carica Logo</Label>
                  <MediaSelector
                    value={logoId}
                    onChange={handleLogoChange}
                    showAltText={false}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Navigation Tab */}
          <TabsContent value="navigation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Voci di Navigazione</CardTitle>
                <CardDescription>
                  Gestisci le voci del menu di navigazione principale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {headerSettings.navigation_items
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input
                        value={item.name}
                        onChange={(e) => updateNavItem(item.id, 'name', e.target.value)}
                        placeholder="Nome"
                      />
                      <Input
                        value={item.url}
                        onChange={(e) => updateNavItem(item.id, 'url', e.target.value)}
                        placeholder="URL"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.visible}
                        onCheckedChange={(checked) => updateNavItem(item.id, 'visible', checked)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNavItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addNavItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Voce
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pulsante CTA (Mobile)</CardTitle>
                <CardDescription>
                  Configura il pulsante call-to-action nel menu mobile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={headerSettings.cta_button.visible}
                    onCheckedChange={(checked) => setHeaderSettings({
                      ...headerSettings,
                      cta_button: { ...headerSettings.cta_button, visible: checked }
                    })}
                  />
                  <Label>Mostra pulsante CTA</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Testo</Label>
                    <Input
                      value={headerSettings.cta_button.text}
                      onChange={(e) => setHeaderSettings({
                        ...headerSettings,
                        cta_button: { ...headerSettings.cta_button, text: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      value={headerSettings.cta_button.url}
                      onChange={(e) => setHeaderSettings({
                        ...headerSettings,
                        cta_button: { ...headerSettings.cta_button, url: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Tab */}
          <TabsContent value="footer" className="space-y-6">
            <Accordion type="multiple" defaultValue={["brand", "social", "quicklinks", "contact", "legal"]} className="space-y-4">
              
              {/* Brand Description */}
              <AccordionItem value="brand" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-semibold">
                  Descrizione Brand
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <RichTextEditor
                    content={footerSettings.brand_description}
                    onChange={(content) => setFooterSettings({
                      ...footerSettings,
                      brand_description: content
                    })}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Social Links */}
              <AccordionItem value="social" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-semibold">
                  Link Social
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {footerSettings.social_links.map((link) => (
                    <div key={link.platform} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-24 font-medium capitalize">{link.platform}</div>
                      <Input
                        value={link.url}
                        onChange={(e) => updateSocialLink(link.platform, 'url', e.target.value)}
                        placeholder={`URL ${link.platform}`}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Visibile</Label>
                        <Switch
                          checked={link.visible}
                          onCheckedChange={(checked) => updateSocialLink(link.platform, 'visible', checked)}
                        />
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* Quick Links */}
              <AccordionItem value="quicklinks" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-semibold">
                  Link Utili
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Titolo Sezione</Label>
                    <Input
                      value={footerSettings.quick_links.title}
                      onChange={(e) => setFooterSettings({
                        ...footerSettings,
                        quick_links: { ...footerSettings.quick_links, title: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-3">
                    {footerSettings.quick_links.items
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <Input
                            value={item.name}
                            onChange={(e) => updateQuickLink(item.id, 'name', e.target.value)}
                            placeholder="Nome"
                          />
                          <Input
                            value={item.url}
                            onChange={(e) => updateQuickLink(item.id, 'url', e.target.value)}
                            placeholder="URL"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.visible}
                            onCheckedChange={(checked) => updateQuickLink(item.id, 'visible', checked)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuickLink(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={addQuickLink} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Link
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Contact Info */}
              <AccordionItem value="contact" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-semibold">
                  Informazioni di Contatto
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Titolo Sezione</Label>
                    <Input
                      value={footerSettings.contact_info.title}
                      onChange={(e) => setFooterSettings({
                        ...footerSettings,
                        contact_info: { ...footerSettings.contact_info, title: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Indirizzo</Label>
                    <Input
                      value={footerSettings.contact_info.address}
                      onChange={(e) => setFooterSettings({
                        ...footerSettings,
                        contact_info: { ...footerSettings.contact_info, address: e.target.value }
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Telefono</Label>
                      <Input
                        value={footerSettings.contact_info.phone}
                        onChange={(e) => setFooterSettings({
                          ...footerSettings,
                          contact_info: { ...footerSettings.contact_info, phone: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={footerSettings.contact_info.email}
                        onChange={(e) => setFooterSettings({
                          ...footerSettings,
                          contact_info: { ...footerSettings.contact_info, email: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3">Pulsante CTA Footer</h4>
                    <div className="flex items-center gap-4 mb-4">
                      <Switch
                        checked={footerSettings.cta_button.visible}
                        onCheckedChange={(checked) => setFooterSettings({
                          ...footerSettings,
                          cta_button: { ...footerSettings.cta_button, visible: checked }
                        })}
                      />
                      <Label>Mostra pulsante</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Testo</Label>
                        <Input
                          value={footerSettings.cta_button.text}
                          onChange={(e) => setFooterSettings({
                            ...footerSettings,
                            cta_button: { ...footerSettings.cta_button, text: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={footerSettings.cta_button.url}
                          onChange={(e) => setFooterSettings({
                            ...footerSettings,
                            cta_button: { ...footerSettings.cta_button, url: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Legal & Copyright */}
              <AccordionItem value="legal" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-semibold">
                  Copyright & Link Legali
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Testo Copyright</Label>
                    <Input
                      value={footerSettings.copyright}
                      onChange={(e) => setFooterSettings({
                        ...footerSettings,
                        copyright: e.target.value
                      })}
                      placeholder="© {year} Nome Azienda. Tutti i diritti riservati."
                    />
                    <p className="text-sm text-muted-foreground">
                      Usa <code className="bg-muted px-1 rounded">{"{year}"}</code> per inserire l'anno corrente automaticamente
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Label>Link Legali</Label>
                    {footerSettings.legal_links.map((link) => (
                      <div key={link.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <Input
                            value={link.name}
                            onChange={(e) => updateLegalLink(link.id, 'name', e.target.value)}
                            placeholder="Nome"
                          />
                          <Input
                            value={link.url}
                            onChange={(e) => updateLegalLink(link.id, 'url', e.target.value)}
                            placeholder="URL"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={link.visible}
                            onCheckedChange={(checked) => updateLegalLink(link.id, 'visible', checked)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLegalLink(link.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addLegalLink} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi Link Legale
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;
