import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { 
  Leaf, 
  Heart, 
  Truck, 
  Shield, 
  Star,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import heroImage from "@/assets/hero-microgreens.jpg";
import varietiesImage from "@/assets/microgreens-varieties.jpg";
import chefImage from "@/assets/chef-microgreens.jpg";

const Index = () => {
  const benefits = [
    {
      icon: Heart,
      title: "Ricchi di Nutrienti",
      description: "Fino a 40 volte più nutrienti delle verdure mature"
    },
    {
      icon: Leaf,
      title: "100% Naturali",
      description: "Coltivati senza pesticidi, freschi e sostenibili"
    },
    {
      icon: Truck,
      title: "Consegna Fresca",
      description: "Raccolti al momento giusto e consegnati entro 24h"
    },
    {
      icon: Shield,
      title: "Qualità Garantita",
      description: "Controlli rigorosi dalla semina alla tavola"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Semina",
      description: "Selezioniamo i migliori semi biologici per ogni varietà di microgreen"
    },
    {
      number: "02", 
      title: "Coltivazione",
      description: "Crescita controllata in ambiente ottimale con acqua pura"
    },
    {
      number: "03",
      title: "Raccolta",
      description: "Taglio al momento perfetto per massimizzare sapore e nutrienti"
    },
    {
      number: "04",
      title: "Consegna",
      description: "Confezionamento e spedizione immediate per garantire freschezza"
    }
  ];

  const featuredProducts = [
    {
      name: "Rucola",
      description: "Sapore piccante e intenso",
      image: varietiesImage,
      category: "Brassicaceae"
    },
    {
      name: "Basilico",
      description: "Aroma mediterraneo concentrato", 
      image: chefImage,
      category: "Erbe Aromatiche"
    },
    {
      name: "Ravanello",
      description: "Croccante e leggermente piccante",
      image: varietiesImage, 
      category: "Brassicaceae"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-hero" />
        
        <div className="relative z-10 container-width text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Verde D'Oro
              <span className="block text-oro-primary font-display italic">Microgreens</span>
            </h1>
            <p className="font-body text-xl md:text-2xl mb-8 text-white/90 animate-slide-in-left">
              L'eccellenza italiana nel mondo dei microgreens. 
              <br className="hidden md:block" />
              Da Reggio Emilia, nutrizione e sapore concentrati.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Button variant="oro" size="lg" className="text-lg px-8 py-4" asChild>
                <Link to="/microgreens">
                  Scopri i Nostri Microgreens
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero" size="lg" className="text-lg px-8 py-4" asChild>
                <Link to="/chi-siamo">La Nostra Storia</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              Perché Scegliere i Nostri Microgreens
            </h2>
            <p className="font-body text-xl text-muted-foreground max-w-3xl mx-auto">
              Ogni microgreen Verde D'Oro è coltivato con passione e dedizione, 
              seguendo metodi naturali e sostenibili per offrire il meglio della natura.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover-lift border-border/50">
                <CardContent className="p-8">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-verde mb-6">
                    <benefit.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-primary mb-4">
                    {benefit.title}
                  </h3>
                  <p className="font-body text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-gradient-subtle">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              Come Coltiviamo l'Eccellenza
            </h2>
            <p className="font-body text-xl text-muted-foreground max-w-3xl mx-auto">
              Il nostro processo in quattro fasi garantisce microgreens di altissima qualità, 
              dalla semina alla vostra tavola.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-oro mb-6 text-2xl font-display font-bold text-accent-foreground">
                  {step.number}
                </div>
                <h3 className="font-display text-2xl font-semibold text-primary mb-4">
                  {step.title}
                </h3>
                <p className="font-body text-muted-foreground">
                  {step.description}
                </p>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-4 w-8">
                    <ArrowRight className="h-6 w-6 text-oro-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              I Nostri Microgreens Più Apprezzati
            </h2>
            <p className="font-body text-xl text-muted-foreground max-w-3xl mx-auto">
              Scopri le varietà più amate dai nostri clienti, 
              ognuna con il suo sapore unico e benefici nutrizionali.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product, index) => (
              <Card key={index} className="overflow-hidden hover-lift border-border/50">
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${product.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-hero/20" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-oro-primary text-accent-foreground px-3 py-1 rounded-full text-sm font-body font-medium">
                      {product.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-display text-xl font-semibold text-primary mb-2">
                    {product.name}
                  </h3>
                  <p className="font-body text-muted-foreground mb-4">
                    {product.description}
                  </p>
                  <Button variant="verde" size="sm" className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aggiungi al Carrello
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="oro" size="lg" asChild>
              <Link to="/microgreens">
                Vedi Tutti i Microgreens
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-hero text-white">
        <div className="container-width text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Pronto a Scoprire il Sapore Autentico?
            </h2>
            <p className="font-body text-xl text-white/90 mb-8">
              Contattaci per un preventivo personalizzato o per saperne di più sui nostri microgreens. 
              La qualità italiana ti aspetta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="oro" size="lg" className="text-lg px-8 py-4" asChild>
                <Link to="/contatti">
                  Richiedi Preventivo
                </Link>
              </Button>
              <Button variant="hero" size="lg" className="text-lg px-8 py-4 border-white/20 text-white hover:bg-white/10" asChild>
                <Link to="/microgreens-su-misura">
                  Microgreens su Misura
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
