import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Phone, Mail, MapPin, Instagram, Facebook, Youtube, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  pinterest: ExternalLink,
  linkedin: ExternalLink,
  tiktok: ExternalLink,
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

  const visibleSocialLinks = footerSettings.social_links.filter(link => link.visible && link.url);
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
                  const IconComponent = socialIcons[link.platform] || ExternalLink;
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
