import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-subtle border-t border-border">
      <div className="container-width section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
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
            </div>
            <p className="text-muted-foreground font-body leading-relaxed mb-6 max-w-md">
              Coltiviamo microgreens freschi e nutrienti nel cuore dell'Emilia-Romagna, 
              portando l'eccellenza italiana direttamente sulla tua tavola.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">
              Link Utili
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Chi Siamo", href: "/chi-siamo" },
                { name: "I Nostri Microgreens", href: "/microgreens" },
                { name: "Microgreens su Misura", href: "/microgreens-su-misura" },
                { name: "Blog & Ricette", href: "/blog" },
                { name: "Cosa sono i Microgreens", href: "/cosa-sono-i-microgreens" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground font-body hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">
              Contatti
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground font-body text-sm">
                  Reggio Emilia, Italia
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a
                  href="tel:+390000000000"
                  className="text-muted-foreground font-body text-sm hover:text-primary transition-colors"
                >
                  +39 000 000 0000
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a
                  href="mailto:info@verdedoro.it"
                  className="text-muted-foreground font-body text-sm hover:text-primary transition-colors"
                >
                  info@verdedoro.it
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <Button variant="oro" size="sm" className="w-full" asChild>
                <Link to="/contatti">Richiedi Preventivo</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground font-body mb-4 md:mb-0">
              © 2024 Verde D'Oro Microgreens. Tutti i diritti riservati.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground font-body hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground font-body hover:text-primary transition-colors"
              >
                Termini di Servizio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;