import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Clock,
  CheckCircle,
  Truck,
  ShoppingCart
} from "lucide-react";

const Contatti = () => {
  const { toast } = useToast();
  const { items: cartItems } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    azienda: "",
    messaggio: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Build products list for WhatsApp message
    const productsText = cartItems.length > 0 
      ? `\n\nProdotti selezionati:\n${cartItems.map(item => `- ${item.name} (${item.quantity}g)`).join('\n')}`
      : '';
    
    // Build WhatsApp message
    const message = `Richiesta preventivo da ${formData.nome} ${formData.cognome}
    
Email: ${formData.email}
Telefono: ${formData.telefono}
${formData.azienda ? `Azienda: ${formData.azienda}` : ''}

Messaggio:
${formData.messaggio}${productsText}`;
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/393330000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Richiesta inviata!",
        description: "Ti contatteremo entro 24 ore per confermare la tua richiesta.",
      });
      
      // Reset form
      setFormData({
        nome: "",
        cognome: "",
        email: "",
        telefono: "",
        azienda: "",
        messaggio: ""
      });
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Telefono",
      details: "+39 0522 000 000",
      description: "Lun-Ven 9:00-18:00"
    },
    {
      icon: Mail,
      title: "Email", 
      details: "info@verdedoro.it",
      description: "Risposta entro 24h"
    },
    {
      icon: MapPin,
      title: "Indirizzo",
      details: "Via delle Microgreens, 42",
      description: "42121 Reggio Emilia (RE)"
    },
    {
      icon: MessageSquare,
      title: "WhatsApp",
      details: "+39 333 000 0000",
      description: "Chat diretta"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-subtle">
        <div className="container-width text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-primary mb-6">
            Contattaci
          </h1>
          <p className="font-body text-xl text-muted-foreground max-w-4xl mx-auto">
            Siamo qui per aiutarti! Che tu sia uno chef, un ristoratore o semplicemente 
            un appassionato di cucina sana, saremo felici di consigliarti i microgreens 
            perfetti per le tue esigenze.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="font-display text-2xl text-primary flex items-center">
                    <MessageSquare className="mr-3 h-6 w-6" />
                    Richiedi un Preventivo
                  </CardTitle>
                  <p className="text-muted-foreground font-body">
                    Compila il form per ricevere una proposta personalizzata
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Cart Summary */}
                  {cartItems.length > 0 && (
                    <div className="mb-8 p-4 bg-secondary rounded-lg">
                      <h3 className="font-display font-semibold text-primary mb-4 flex items-center">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Prodotti Selezionati
                      </h3>
                      <div className="space-y-3">
                        {cartItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <span className="font-body font-medium">{item.name}</span>
                              <span className="text-muted-foreground text-sm ml-2">
                                {item.quantity}g
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-3 mt-3">
                          <p className="text-sm text-muted-foreground">
                            Riceverai un preventivo dettagliato via WhatsApp
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        />
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
                          onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                        />
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
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
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
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="azienda" className="font-body font-medium">
                        Azienda / Ristorante
                      </Label>
                      <Input
                        id="azienda"
                        placeholder="Nome della tua attività (opzionale)"
                        className="mt-2"
                        value={formData.azienda}
                        onChange={(e) => setFormData({ ...formData, azienda: e.target.value })}
                      />
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
                        onChange={(e) => setFormData({ ...formData, messaggio: e.target.value })}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      variant="oro" 
                      size="lg" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Invio in corso..." : "Invia Richiesta"}
                      {!isLoading && <CheckCircle className="ml-2 h-5 w-5" />}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="font-display text-xl text-primary">
                    Informazioni di Contatto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-verde">
                        <info.icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-body font-semibold text-primary">
                          {info.title}
                        </h3>
                        <p className="font-body text-foreground">
                          {info.details}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-subtle">
                <CardHeader>
                  <CardTitle className="font-display text-xl text-primary flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Consegne
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-oro-primary" />
                      <span className="text-sm font-body">
                        Consegna in 24-48h in Emilia-Romagna
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-verde-primary" />
                      <span className="text-sm font-body">
                        Spedizione gratuita per ordini superiori a €50
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-verde-primary" />
                      <span className="text-sm font-body">
                        Packaging sostenibile e refrigerato
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-oro-primary text-accent-foreground">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold mb-3">
                    Hai fretta?
                  </h3>
                  <p className="text-sm mb-4">
                    Contattaci direttamente su WhatsApp per una risposta immediata.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-oro-primary"
                    asChild
                  >
                    <a href="https://wa.me/39333000000?text=Ciao! Vorrei informazioni sui vostri microgreens">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Scrivici su WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contatti;