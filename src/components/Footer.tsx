import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Phone, Mail, MapPin, Instagram, Facebook, Youtube, Linkedin, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Custom SVG icons for platforms not in Lucide
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

interface CtaButton {
  text: string;
  url: string;
  visible: boolean;
}

interface LegalLink {
  id: string;
  name: string;
  url: string;
  visible: boolean;
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

const defaultFooterSettings: FooterSettings = {
  brand_description: "<p>Coltiviamo microgreens freschi e nutrienti nel cuore dell'Emilia-Romagna, portando l'eccellenza italiana direttamente sulla tua tavola.</p>",
  social_links: [
    { platform: "instagram", url: "#", visible: true },
    { platform: "facebook", url: "#", visible: true },
    { platform: "pinterest", url: "#", visible: true },
    { platform: "youtube", url: "#", visible: true },
  ],
  quick_links: {
    title: "Link Utili",
    items: [
      { id: "1", name: "Chi Siamo", url: "/chi-siamo", visible: true, order: 1 },
      { id: "2", name: "I Nostri Microgreens", url: "/microgreens", visible: true, order: 2 },
      { id: "3", name: "Microgreens su Misura", url: "/microgreens-su-misura", visible: true, order: 3 },
      { id: "4", name: "Blog & Ricette", url: "/blog", visible: true, order: 4 },
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

const Footer = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select(`
            logo_id,
            footer_settings,
            media:logo_id (
              file_path
            )
          `)
          .eq("id", "default")
          .maybeSingle();

        if (error) throw error;

        if (data?.media && typeof data.media === 'object' && 'file_path' in data.media) {
          setLogoUrl(data.media.file_path as string);
        }

        if (data?.footer_settings) {
          setFooterSettings(data.footer_settings as unknown as FooterSettings);
        }
      } catch (error) {
        console.error("Error fetching footer settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const currentYear = new Date().getFullYear();
  const copyrightText = footerSettings.copyright.replace("{year}", currentYear.toString());

  const visibleSocialLinks = footerSettings.social_links.filter(link => link.visible && link.url && link.url.trim() !== '');
  const visibleQuickLinks = footerSettings.quick_links.items
    .filter(item => item.visible)
    .sort((a, b) => a.order - b.order);
  const visibleLegalLinks = footerSettings.legal_links.filter(link => link.visible);

  return (
    <footer className="bg-gradient-subtle border-t border-border">
      <div className="container-width section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Verde D'Oro - Microgreens" 
                  className="h-14 w-auto"
                />
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-verde">
                    <Leaf className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-primary">
                      Verde D'Oro
                    </h3>
                    <p className="text-sm text-muted-foreground font-body">
                      Microgreens di Reggio Emilia
                    </p>
                  </div>
                </>
              )}
            </div>
            <div 
              className="text-muted-foreground font-body leading-relaxed mb-6 max-w-md prose prose-sm"
              dangerouslySetInnerHTML={{ __html: footerSettings.brand_description }}
            />
            {visibleSocialLinks.length > 0 && (
              <div className="flex space-x-4">
                {visibleSocialLinks.map((link) => {
                  const IconComponent = socialIcons[link.platform] || MessageCircle;
                  return (
                    <Button key={link.platform} variant="ghost" size="icon" asChild>
                      <a href={link.url} aria-label={link.platform} target="_blank" rel="noopener noreferrer">
                        <IconComponent className="h-5 w-5" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">
              {footerSettings.quick_links.title}
            </h4>
            <ul className="space-y-3">
              {visibleQuickLinks.map(link => (
                <li key={link.id}>
                  <Link to={link.url} className="text-muted-foreground font-body hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">
              {footerSettings.contact_info.title}
            </h4>
            <ul className="space-y-4">
              {footerSettings.contact_info.address && (
                <li className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground font-body text-sm">
                    {footerSettings.contact_info.address}
                  </span>
                </li>
              )}
              {footerSettings.contact_info.phone && (
                <li className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                  <a href={`tel:${footerSettings.contact_info.phone.replace(/\s/g, '')}`} className="text-muted-foreground font-body text-sm hover:text-primary transition-colors">
                    {footerSettings.contact_info.phone}
                  </a>
                </li>
              )}
              {footerSettings.contact_info.email && (
                <li className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <a href={`mailto:${footerSettings.contact_info.email}`} className="text-muted-foreground font-body text-sm hover:text-primary transition-colors">
                    {footerSettings.contact_info.email}
                  </a>
                </li>
              )}
            </ul>

            {footerSettings.cta_button.visible && (
              <div className="mt-6">
                <Button variant="oro" size="sm" className="w-full" asChild>
                  <Link to={footerSettings.cta_button.url}>{footerSettings.cta_button.text}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground font-body mb-4 md:mb-0">
              {copyrightText}
            </p>
            {visibleLegalLinks.length > 0 && (
              <div className="flex space-x-6">
                {visibleLegalLinks.map(link => (
                  <Link 
                    key={link.id}
                    to={link.url} 
                    className="text-sm text-muted-foreground font-body hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
