import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { PublishActionBar } from "@/components/admin/PublishActionBar";
import { UnsavedChangesDialog } from "@/components/admin/UnsavedChangesDialog";
import { SortableItem } from "@/components/admin/SortableItem";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { useChangeTracking } from "@/hooks/useChangeTracking";
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
import { Save, Image, Info, Navigation, LayoutGrid, Plus, Trash2, GripVertical, Leaf, Instagram, Facebook, Youtube, Linkedin, MessageCircle, ChevronDown } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Custom SVG icons for social platforms
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.96s-.36-.71-.36-1.77c0-1.66.96-2.9 2.16-2.9 1.02 0 1.51.76 1.51 1.68 0 1.03-.65 2.56-.99 3.98-.28 1.19.6 2.16 1.77 2.16 2.13 0 3.77-2.25 3.77-5.5 0-2.87-2.07-4.88-5.02-4.88-3.42 0-5.43 2.56-5.43 5.22 0 1.03.4 2.14.9 2.74.1.12.11.22.08.34l-.33 1.36c-.05.22-.18.27-.42.16-1.56-.73-2.54-3.01-2.54-4.85 0-3.95 2.87-7.58 8.27-7.58 4.35 0 7.73 3.1 7.73 7.23 0 4.32-2.72 7.8-6.5 7.8-1.27 0-2.46-.66-2.87-1.44l-.78 2.97c-.28 1.08-1.04 2.44-1.55 3.27A12 12 0 1 0 12 0z"/>
  </svg>
);

const TwitterXIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.898-.745 2.132-1.142 3.57-1.148 1.04-.004 1.988.138 2.834.425.02-.9-.044-1.73-.192-2.478l2.016-.397c.238 1.207.31 2.59.213 4.12a10.13 10.13 0 012.594 1.766c.924.927 1.57 2.09 1.81 3.363.336 1.786-.009 3.95-1.727 5.635-1.931 1.893-4.39 2.71-7.97 2.658zm-.09-5.666c1.04.007 1.9-.244 2.49-.727.515-.42.82-.98.905-1.662a6.856 6.856 0 00-2.308-.382c-.98.004-1.8.239-2.37.678-.48.37-.7.853-.665 1.437.037.672.388 1.136.934 1.467.556.337 1.29.496 2.014.489z"/>
  </svg>
);

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  pinterest: PinterestIcon,
  tiktok: TikTokIcon,
  twitter: TwitterXIcon,
  linkedin: Linkedin,
  whatsapp: WhatsAppIcon,
  threads: ThreadsIcon,
};

interface DropdownSubItem {
  id: string;
  name: string;
  url: string;
}

interface NavigationItem {
  id: string;
  name: string;
  url: string;
  visible: boolean;
  order: number;
  dropdown_items?: DropdownSubItem[];
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
  const [faviconId, setFaviconId] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(defaultHeaderSettings);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Centralized change tracking with justSaved protection
  const { hasChanges, markSaved, setReady } = useChangeTracking([logoId, logoUrl, faviconId, faviconUrl, headerSettings, footerSettings]);

  // Unsaved changes warning
  const { isBlocked, proceed, reset } = useUnsavedChangesWarning({
    hasUnsavedChanges: hasChanges,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select(`
          logo_id,
          favicon_id,
          header_settings,
          footer_settings,
          draft_header_settings,
          draft_footer_settings,
          has_draft_header_changes,
          has_draft_footer_changes,
          media:logo_id (
            file_path
          )
        `)
        .eq("id", "default")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setLogoId(data.logo_id);
        const logoMedia = (data as any).media as { file_path: string } | null;
        if (logoMedia?.file_path) {
          setLogoUrl(logoMedia.file_path);
        }

        // Fetch favicon media separately (two FKs to same table)
        if (data.favicon_id) {
          setFaviconId(data.favicon_id);
          const { data: favMedia } = await supabase
            .from("media")
            .select("file_path")
            .eq("id", data.favicon_id)
            .single();
          if (favMedia) {
            setFaviconUrl(favMedia.file_path);
          }
        }
        
        // Load from draft if available, otherwise from live
        const headerData = (data.draft_header_settings ?? data.header_settings) as unknown as HeaderSettings;
        const footerData = (data.draft_footer_settings ?? data.footer_settings) as unknown as FooterSettings;
        
        if (headerData) {
          setHeaderSettings(headerData);
        }
        if (footerData) {
          // Merge social links - ensure all default platforms exist
          const mergedSocialLinks = defaultFooterSettings.social_links.map(defaultLink => {
            const existingLink = footerData.social_links?.find(
              link => link.platform === defaultLink.platform
            );
            return existingLink || defaultLink;
          });
          
          setFooterSettings({
            ...footerData,
            social_links: mergedSocialLinks
          });
        }
        
        // Check if there are draft changes
        const hasDraft = data.has_draft_header_changes || data.has_draft_footer_changes;
        setHasDraftChanges(hasDraft || false);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Errore nel caricamento delle impostazioni");
    } finally {
      setIsLoading(false);
      setReady();
    }
  };

  const handleLogoChange = (imageId: string | null, imageUrl: string | null) => {
    setLogoId(imageId);
    setLogoUrl(imageUrl);
  };

  const handleFaviconChange = (imageId: string | null, imageUrl: string | null) => {
    setFaviconId(imageId);
    setFaviconUrl(imageUrl);
  };

  // Save to draft columns only
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ 
          logo_id: logoId,
          favicon_id: faviconId,
          draft_header_settings: JSON.parse(JSON.stringify(headerSettings)),
          draft_footer_settings: JSON.parse(JSON.stringify(footerSettings)),
          has_draft_header_changes: true,
          has_draft_footer_changes: true,
        })
        .eq("id", "default");

      if (error) throw error;

      toast.success("Bozza salvata con successo");
      markSaved();
      setHasDraftChanges(true);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Errore nel salvataggio delle impostazioni");
    } finally {
      setIsSaving(false);
    }
  };

  // Publish: copy draft to live columns
  const handlePublish = async (publish: boolean) => {
    setIsSaving(true);
    try {
      if (publish) {
        // First save current state to draft
        const { error: draftError } = await supabase
          .from("site_settings")
          .update({ 
            logo_id: logoId,
            favicon_id: faviconId,
            draft_header_settings: JSON.parse(JSON.stringify(headerSettings)),
            draft_footer_settings: JSON.parse(JSON.stringify(footerSettings)),
          })
          .eq("id", "default");

        if (draftError) throw draftError;

        // Then copy draft to live
        const { error } = await supabase
          .from("site_settings")
          .update({ 
            header_settings: JSON.parse(JSON.stringify(headerSettings)),
            footer_settings: JSON.parse(JSON.stringify(footerSettings)),
            has_draft_header_changes: false,
            has_draft_footer_changes: false,
          })
          .eq("id", "default");

        if (error) throw error;

        toast.success("Impostazioni pubblicate con successo");
        setHasDraftChanges(false);
      }
      markSaved();
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error publishing settings:", error);
      toast.error("Errore nella pubblicazione delle impostazioni");
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

  const updateNavItem = (id: string, field: keyof NavigationItem, value: string | boolean | number | DropdownSubItem[]) => {
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

  // Dropdown sub-item handlers
  const addDropdownSubItem = (navItemId: string) => {
    const navItem = headerSettings.navigation_items.find(item => item.id === navItemId);
    const currentItems = navItem?.dropdown_items || [];
    const newSubItem: DropdownSubItem = {
      id: Date.now().toString(),
      name: "Nuovo Sottomenu",
      url: "/"
    };
    updateNavItem(navItemId, 'dropdown_items', [...currentItems, newSubItem]);
  };

  const updateDropdownSubItem = (navItemId: string, subItemId: string, field: keyof DropdownSubItem, value: string) => {
    const navItem = headerSettings.navigation_items.find(item => item.id === navItemId);
    const updatedSubItems = (navItem?.dropdown_items || []).map(subItem =>
      subItem.id === subItemId ? { ...subItem, [field]: value } : subItem
    );
    updateNavItem(navItemId, 'dropdown_items', updatedSubItems);
  };

  const removeDropdownSubItem = (navItemId: string, subItemId: string) => {
    const navItem = headerSettings.navigation_items.find(item => item.id === navItemId);
    const updatedSubItems = (navItem?.dropdown_items || []).filter(subItem => subItem.id !== subItemId);
    updateNavItem(navItemId, 'dropdown_items', updatedSubItems);
  };

  // Drag and drop handlers
  const handleNavDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = headerSettings.navigation_items.findIndex(item => item.id === active.id);
      const newIndex = headerSettings.navigation_items.findIndex(item => item.id === over.id);
      const newItems = arrayMove(headerSettings.navigation_items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index
      }));
      setHeaderSettings({ ...headerSettings, navigation_items: newItems });
    }
  };

  const handleDropdownSubItemDragEnd = (navItemId: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const navItem = headerSettings.navigation_items.find(item => item.id === navItemId);
      const items = navItem?.dropdown_items || [];
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      updateNavItem(navItemId, 'dropdown_items', newItems);
    }
  };

  const handleQuickLinksDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = footerSettings.quick_links.items.findIndex(item => item.id === active.id);
      const newIndex = footerSettings.quick_links.items.findIndex(item => item.id === over.id);
      const newItems = arrayMove(footerSettings.quick_links.items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index
      }));
      setFooterSettings({
        ...footerSettings,
        quick_links: { ...footerSettings.quick_links, items: newItems }
      });
    }
  };

  const handleLegalLinksDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = footerSettings.legal_links.findIndex(item => item.id === active.id);
      const newIndex = footerSettings.legal_links.findIndex(item => item.id === over.id);
      const newItems = arrayMove(footerSettings.legal_links, oldIndex, newIndex);
      setFooterSettings({ ...footerSettings, legal_links: newItems });
    }
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Favicon del Sito
                </CardTitle>
                <CardDescription>
                  L'icona che appare nella tab del browser e nei risultati di ricerca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Requisiti del favicon:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Dimensioni consigliate:</strong> 32×32 px o 64×64 px</li>
                      <li><strong>Formato:</strong> PNG con sfondo trasparente (consigliato), ICO, SVG o WebP</li>
                      <li><strong>Nota:</strong> Verrà usato anche come icona per dispositivi iOS (apple-touch-icon)</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Seleziona o Carica Favicon</Label>
                  <MediaSelector
                    value={faviconId}
                    onChange={handleFaviconChange}
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleNavDragEnd}
                >
                  <SortableContext
                    items={headerSettings.navigation_items.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {headerSettings.navigation_items
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                      <div key={item.id} className="space-y-3">
                        <SortableItem id={item.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <Input
                                value={item.name}
                                onChange={(e) => updateNavItem(item.id, 'name', e.target.value)}
                                placeholder="Nome"
                              />
                              <Input
                                value={item.url}
                                onChange={(e) => updateNavItem(item.id, 'url', e.target.value)}
                                placeholder="URL (usa #microgreens-dropdown per dropdown)"
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
                        </SortableItem>
                        
                        {/* Dropdown sub-items editor */}
                        {item.url === '#microgreens-dropdown' && (
                          <div className="ml-8 p-4 bg-muted/30 rounded-lg border border-dashed space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <ChevronDown className="h-4 w-4" />
                              Voci del Dropdown (trascina per riordinare)
                            </div>
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={handleDropdownSubItemDragEnd(item.id)}
                            >
                              <SortableContext
                                items={(item.dropdown_items || []).map(sub => sub.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                {(item.dropdown_items || []).map((subItem) => (
                                  <SortableItem key={subItem.id} id={subItem.id} className="p-2 bg-background rounded border">
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 grid grid-cols-2 gap-2">
                                        <Input
                                          value={subItem.name}
                                          onChange={(e) => updateDropdownSubItem(item.id, subItem.id, 'name', e.target.value)}
                                          placeholder="Nome sottomenu"
                                          className="h-8 text-sm"
                                        />
                                        <Input
                                          value={subItem.url}
                                          onChange={(e) => updateDropdownSubItem(item.id, subItem.id, 'url', e.target.value)}
                                          placeholder="URL"
                                          className="h-8 text-sm"
                                        />
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeDropdownSubItem(item.id, subItem.id)}
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </SortableItem>
                                ))}
                              </SortableContext>
                            </DndContext>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => addDropdownSubItem(item.id)} 
                              className="w-full"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Aggiungi Voce Dropdown
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </SortableContext>
                </DndContext>
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
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleQuickLinksDragEnd}
                  >
                    <SortableContext
                      items={footerSettings.quick_links.items.map(item => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {footerSettings.quick_links.items
                          .sort((a, b) => a.order - b.order)
                          .map((item) => (
                          <SortableItem key={item.id} id={item.id} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
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
                          </SortableItem>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
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
                    <Label>Link Legali (trascina per riordinare)</Label>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleLegalLinksDragEnd}
                    >
                      <SortableContext
                        items={footerSettings.legal_links.map(link => link.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {footerSettings.legal_links.map((link) => (
                          <SortableItem key={link.id} id={link.id} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
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
                          </SortableItem>
                        ))}
                      </SortableContext>
                    </DndContext>
                    <Button variant="outline" onClick={addLegalLink} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi Link Legale
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>

            {/* Footer Preview */}
            <div className="mt-8 border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 border-b">
                <h3 className="font-semibold text-sm">Anteprima Footer</h3>
              </div>
              <div className="bg-gradient-subtle p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                  {/* Brand */}
                  <div className="md:col-span-2">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-10 w-auto mb-3" />
                    ) : (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <Leaf className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-primary">Verde D'Oro</span>
                      </div>
                    )}
                    <div 
                      className="text-muted-foreground text-xs prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: footerSettings.brand_description }}
                    />
                    <div className="flex gap-2 mt-3">
                      {footerSettings.social_links.filter(l => l.visible && l.url && l.url.trim() !== '').map((link) => {
                        const IconComponent = socialIcons[link.platform];
                        return IconComponent ? (
                          <div key={link.platform} className="h-7 w-7 rounded-md bg-muted flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                  {/* Quick Links */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{footerSettings.quick_links.title}</h4>
                    <ul className="space-y-1">
                      {footerSettings.quick_links.items.filter(i => i.visible).sort((a, b) => a.order - b.order).slice(0, 4).map(item => (
                        <li key={item.id} className="text-xs text-muted-foreground">{item.name}</li>
                      ))}
                    </ul>
                  </div>
                  {/* Contact */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{footerSettings.contact_info.title}</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>{footerSettings.contact_info.address}</p>
                      <p>{footerSettings.contact_info.phone}</p>
                      <p>{footerSettings.contact_info.email}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                  <span>{footerSettings.copyright.replace("{year}", new Date().getFullYear().toString())}</span>
                  <div className="flex gap-4">
                    {footerSettings.legal_links.filter(l => l.visible).map(l => (
                      <span key={l.id}>{l.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Header Preview */}
        <div className="mt-8 border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-2 border-b">
            <h3 className="font-semibold text-sm">Anteprima Header</h3>
          </div>
          <div className="bg-background p-4 border-b">
            <div className="flex items-center justify-between">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-10 w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <Leaf className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-semibold text-primary">Verde D'Oro</span>
                </div>
              )}
              <div className="flex items-center gap-6">
                {headerSettings.navigation_items
                  .filter(item => item.visible)
                  .sort((a, b) => a.order - b.order)
                  .map(item => (
                    <span key={item.id} className="text-sm text-muted-foreground hover:text-primary cursor-default">
                      {item.name}
                    </span>
                  ))}
                {headerSettings.cta_button.visible && (
                  <Button variant="oro" size="sm" className="pointer-events-none">
                    {headerSettings.cta_button.text}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Spacer for action bar */}
      <div className="h-20" />
      
      <PublishActionBar
        isPublished={true}
        isSaving={isSaving}
        onSave={handleSave}
        onPublish={handlePublish}
        hasChanges={hasChanges}
        hasDraftChanges={hasDraftChanges}
      />

      <UnsavedChangesDialog
        isOpen={isBlocked}
        onConfirm={() => proceed?.()}
        onCancel={() => reset?.()}
      />
    </AdminLayout>
  );
};

export default Settings;
