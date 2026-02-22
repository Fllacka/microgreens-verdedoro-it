import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Mail, MapPin, MessageSquare, Clock, CheckCircle, Truck, ShoppingCart, X, Info } from "lucide-react";

// Format price in euros
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};
import { Helmet } from "react-helmet";
import { generateBreadcrumbSchema } from "@/lib/seo";

interface SectionContent {
  [key: string]: any;
}

interface Section {
  id: string;
  content: SectionContent;
  is_visible: boolean;
}

const Contatti = () => {
  const { toast } = useToast();
  const { items: cartItems, removeItem, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    indirizzo: "",
    messaggio: ""
  });

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const { data, error } = await supabase.
        from("contatti_sections").
        select("*").
        order("sort_order");

        if (error) throw error;

        const sectionsMap: Record<string, Section> = {};
        data?.forEach((section) => {
          sectionsMap[section.id] = section as Section;
        });
        setSections(sectionsMap);
      } catch (error) {
        console.error("Error fetching sections:", error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchSections();
  }, []);

  // Auto-populate message with cart items
  useEffect(() => {
    if (cartItems.length > 0) {
      const productsText = cartItems.map((item) => `- ${item.name}: ${item.quantity}g`).join('\n');
      const autoMessage = `Vorrei ordinare e avviare la coltivazione delle seguenti varietà di microgreens:\n\n${productsText}\n\n`;
      setFormData((prev) => ({
        ...prev,
        messaggio: autoMessage
      }));
    }
  }, [cartItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-quote-request', {
        body: {
          nome: formData.nome,
          cognome: formData.cognome,
          email: formData.email,
          telefono: formData.telefono,
          indirizzo: formData.indirizzo,
          messaggio: formData.messaggio,
          prodotti: cartItems.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price }))
        }
      });

      if (error) throw error;

      toast({
        title: "Richiesta inviata con successo!",
        description: "Ti abbiamo inviato una conferma via email. Ti risponderemo entro 24 ore."
      });

      // Reset form and clear cart
      setFormData({
        nome: "",
        cognome: "",
        email: "",
        telefono: "",
        indirizzo: "",
        messaggio: ""
      });
      clearCart();
    } catch (error: any) {
      console.error("Error sending request:", error);
      toast({
        title: "Errore nell'invio",
        description: "Si è verificato un errore. Riprova o contattaci su WhatsApp.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Caricamento...</p>
        </div>
      </Layout>);

  }

  const seoSection = sections["seo"];
  const heroSection = sections["hero"];
  const formSection = sections["form"];
  const contactInfoSection = sections["contact_info"];
  const deliverySection = sections["delivery"];
  const whatsappCtaSection = sections["whatsapp_cta"];

  const currentUrl = window.location.origin + "/contatti";
  const canonicalUrl = seoSection?.content?.canonical_url ?
  `${window.location.origin}${seoSection.content.canonical_url}` :
  currentUrl;

  const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Contatti", url: "/contatti" }]
  );
  const contactInfoItems = [];
  if (contactInfoSection?.content?.phone_visible) {
    const phoneNumber = (contactInfoSection.content.phone_details || "+39 0522 000 000").replace(/\s+/g, '');
    contactInfoItems.push({
      icon: Phone,
      title: contactInfoSection.content.phone_title || "Telefono",
      details: contactInfoSection.content.phone_details || "+39 0522 000 000",
      description: contactInfoSection.content.phone_description || "Lun-Ven 9:00-18:00",
      href: `tel:${phoneNumber}`
    });
  }
  if (contactInfoSection?.content?.email_visible) {
    contactInfoItems.push({
      icon: Mail,
      title: contactInfoSection.content.email_title || "Email",
      details: contactInfoSection.content.email_details || "microgreens.verdedoro@gmail.com",
      description: contactInfoSection.content.email_description || "Risposta entro 24h",
      href: `mailto:${contactInfoSection.content.email_details || "microgreens.verdedoro@gmail.com"}`
    });
  }
  if (contactInfoSection?.content?.address_visible) {
    contactInfoItems.push({
      icon: MapPin,
      title: contactInfoSection.content.address_title || "Indirizzo",
      details: contactInfoSection.content.address_details || "Via delle Microgreens, 42",
      description: contactInfoSection.content.address_description || "42121 Reggio Emilia (RE)"
    });
  }
  if (contactInfoSection?.content?.whatsapp_visible) {
    const whatsappNumber = (contactInfoSection.content.whatsapp_details || "+39 333 000 0000").replace(/\s+/g, '');
    contactInfoItems.push({
      icon: MessageSquare,
      title: contactInfoSection.content.whatsapp_title || "WhatsApp",
      details: contactInfoSection.content.whatsapp_details || "+39 333 000 0000",
      description: contactInfoSection.content.whatsapp_description || "Chat diretta",
      href: `https://wa.me/${whatsappNumber.replace('+', '')}`
    });
  }

  return (
    <Layout>
      <Helmet>
        <title>{seoSection?.content?.meta_title || "Contatti - Verde D'Oro"}</title>
        <meta
          name="description"
          content={seoSection?.content?.meta_description || "Contattaci per informazioni sui nostri microgreens biologici."} />

        <meta name="robots" content={seoSection?.content?.robots || "index, follow"} />
        <link rel="canonical" href={canonicalUrl} />
        {seoSection?.content?.og_title &&
        <meta property="og:title" content={seoSection.content.og_title} />
        }
        {seoSection?.content?.og_description &&
        <meta property="og:description" content={seoSection.content.og_description} />
        }
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Hero Section */}
      {heroSection?.is_visible !== false &&
      <section className="section-padding bg-gradient-subtle">
          <div className="container-width text-center">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary mb-6">
              {heroSection?.content?.title || "Contattaci"}
            </h1>
            <p className="font-body text-xl text-muted-foreground max-w-4xl mx-auto">
              {heroSection?.content?.subtitle || "Siamo qui per aiutarti! Che tu sia uno chef, un ristoratore o semplicemente un appassionato di cucina sana, saremo felici di consigliarti i microgreens perfetti per le tue esigenze."}
            </p>
          </div>
        </section>
      }

      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            {formSection?.is_visible !== false &&
            <div className="lg:col-span-2">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl text-primary flex items-center">
                      <MessageSquare className="mr-3 h-6 w-6" />
                      {formSection?.content?.title || "Richiedi un Preventivo"}
                    </CardTitle>
                    <p className="text-muted-foreground font-body">
                      {formSection?.content?.description || "Compila il form per ricevere una proposta personalizzata"}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {/* Cart Summary */}
                    {cartItems.length > 0 &&
                  <div className="mb-8 p-4 bg-secondary rounded-lg">
                        <h3 className="font-display font-semibold text-primary mb-4 flex items-center">
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Prodotti Selezionati
                        </h3>
                        <div className="space-y-3">
                          {cartItems.map((item, index) =>
                      <div key={index} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="font-body font-medium">{item.name}</span>
                                <span className="text-muted-foreground text-sm">
                                  {item.quantity}g
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {item.price !== undefined && item.price > 0 &&
                          <span className="font-semibold text-verde-primary">
                                    {formatPrice(item.price)}
                                  </span>
                          }
                                <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label={`Rimuovi ${item.name}`}>

                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                      )}
                          {cartItems.some((item) => item.price !== undefined && item.price > 0) &&
                      <>
                              <div className="border-t pt-3 mt-3 flex justify-between items-center">
                                <span className="font-semibold">Totale</span>
                                <span className="text-lg font-bold text-verde-primary">
                                  {formatPrice(cartItems.reduce((sum, item) => sum + (item.price || 0), 0))}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                Paghi comodamente alla consegna
                              </p>
                            </>
                      }
                          {!cartItems.some((item) => item.price !== undefined && item.price > 0) &&
                      <div className="border-t pt-3 mt-3">
                              <p className="text-sm text-muted-foreground">
                                Riceverai un preventivo dettagliato via email
                              </p>
                            </div>
                      }
                        </div>
                      </div>
                  }

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="nome" className="font-body font-medium">
                            Nome *
                          </Label>
                          <Input
                          id="nome"
                          placeholder="Il tuo nome"
                          required
                          className="mt-2"
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />

                        </div>
                        <div>
                          <Label htmlFor="cognome" className="font-body font-medium">
                            Cognome *
                          </Label>
                          <Input
                          id="cognome"
                          placeholder="Il tuo cognome"
                          required
                          className="mt-2"
                          value={formData.cognome}
                          onChange={(e) => setFormData({ ...formData, cognome: e.target.value })} />

                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="email" className="font-body font-medium">
                            Email *
                          </Label>
                          <Input
                          id="email"
                          type="email"
                          placeholder="nome@email.com"
                          required
                          className="mt-2"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

                        </div>
                        <div>
                          <Label htmlFor="telefono" className="font-body font-medium">
                            Telefono
                          </Label>
                          <Input
                          id="telefono"
                          type="tel"
                          placeholder="+39 000 000 0000"
                          className="mt-2"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />

                        </div>
                      </div>

                      <div>
                        <Label htmlFor="indirizzo" className="font-body font-medium">
                          Indirizzo *
                        </Label>
                        <Input
                        id="indirizzo"
                        placeholder="Via, numero civico, città"
                        required
                        className="mt-2"
                        value={formData.indirizzo}
                        onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })} />

                      </div>

                      <div>
                        <Label htmlFor="messaggio" className="font-body font-medium">
                          Messaggio *
                        </Label>
                        <Textarea
                        id="messaggio"
                        placeholder="Descrivici le tue esigenze: quantità, frequenza di consegna, varietà preferite..."
                        rows={6}
                        required
                        className="mt-2"
                        value={formData.messaggio}
                        onChange={(e) => setFormData({ ...formData, messaggio: e.target.value })} />

                      </div>

                      <Button type="submit" variant="oro" size="lg" className="w-full" disabled={isLoading}>
                        {isLoading ? "Invio in corso..." : "Invia Richiesta"}
                        {!isLoading && <CheckCircle className="ml-2 h-5 w-5" />}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            }

            {/* Contact Information */}
            <div className="space-y-6">
              {contactInfoSection?.is_visible !== false && contactInfoItems.length > 0 &&
              <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="font-display text-xl text-primary">
                      {contactInfoSection?.content?.title || "Informazioni di Contatto"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {contactInfoItems.map((info, index) => {
                      const Wrapper = info.href ? 'a' : 'div';
                      const wrapperProps = info.href ? { href: info.href, target: "_blank", rel: "noopener noreferrer" } : {};
                      return (
                        <Wrapper key={index} {...wrapperProps} className={`flex items-start space-x-4${info.href ? ' cursor-pointer hover:opacity-80 transition-opacity' : ''}`}>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-verde">
                            <info.icon className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-body font-semibold text-primary">
                              {info.title}
                            </h3>
                            <p className="font-body text-sm text-foreground break-words">
                              {info.details}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {info.description}
                            </p>
                          </div>
                        </Wrapper>
                      );
                    })}
                  </CardContent>
                </Card>
              }

              {deliverySection?.is_visible !== false &&
              <Card className="border-border/50 bg-gradient-subtle">
                  <CardHeader>
                    <CardTitle className="font-display text-xl text-primary flex items-center">
                      <Truck className="mr-2 h-5 w-5" />
                      {deliverySection?.content?.title || "Consegne"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {deliverySection?.content?.item1_visible &&
                    <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4 text-oro-primary" />
                          <span className="text-sm font-body">
                            {deliverySection.content.item1_text || "Consegna in 24-48h in Emilia-Romagna"}
                          </span>
                        </div>
                    }
                      {deliverySection?.content?.item2_visible &&
                    <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-verde-primary" />
                          <span className="text-sm font-body">
                            {deliverySection.content.item2_text || "Spedizione gratuita per ordini superiori a €50"}
                          </span>
                        </div>
                    }
                      {deliverySection?.content?.item3_visible &&
                    <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-verde-primary" />
                          <span className="text-sm font-body">
                            {deliverySection.content.item3_text || "Packaging sostenibile e refrigerato"}
                          </span>
                        </div>
                    }
                    </div>
                  </CardContent>
                </Card>
              }

              {whatsappCtaSection?.is_visible !== false &&
              <Card className="border-border/50 bg-oro-primary text-accent-foreground">
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold mb-3">
                      {whatsappCtaSection?.content?.title || "Hai fretta?"}
                    </h3>
                    <p className="text-sm mb-4">
                      {whatsappCtaSection?.content?.description || "Contattaci direttamente su WhatsApp per una risposta immediata."}
                    </p>
                    <Button
                    variant="outline"
                    className="w-full border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-oro-primary"
                    asChild>

                      <a href={whatsappCtaSection?.content?.whatsapp_link || "https://wa.me/39333000000?text=Ciao! Vorrei informazioni sui vostri microgreens"}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {whatsappCtaSection?.content?.button_text || "Scrivici su WhatsApp"}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              }
            </div>
          </div>
        </div>
      </section>
    </Layout>);

};

export default Contatti;