import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Leaf, Heart, Users, Award, ArrowRight } from "lucide-react";
import chefImage from "@/assets/chef-microgreens.jpg";

const ChiSiamo = () => {
  const values = [
    {
      icon: Leaf,
      title: "Sostenibilità",
      description: "Coltiviamo nel rispetto dell'ambiente, utilizzando metodi naturali e sostenibili per preservare la terra per le future generazioni."
    },
    {
      icon: Heart,
      title: "Passione",
      description: "Ogni microgreen è coltivato con amore e dedizione, dalla semina alla raccolta, per garantire il massimo della qualità e del sapore."
    },
    {
      icon: Users,
      title: "Famiglia",
      description: "Siamo un'azienda familiare che crede nei valori tradizionali dell'agricoltura italiana, trasmessi di generazione in generazione."
    },
    {
      icon: Award,
      title: "Eccellenza",
      description: "La nostra missione è portare sulle vostre tavole solo il meglio, con standard qualitativi che non accettano compromessi."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-subtle">
        <div className="container-width">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-primary mb-6">
                La Nostra Storia
              </h1>
              <p className="font-body text-xl text-muted-foreground mb-8 leading-relaxed">
                Nel cuore dell'Emilia-Romagna, dove la tradizione agricola si sposa con l'innovazione, 
                nasce Verde D'Oro Microgreens. La nostra storia inizia dalla passione per l'agricoltura 
                sostenibile e dalla volontà di portare sulle tavole italiane il meglio della natura.
              </p>
              <Button variant="oro" size="lg" asChild>
                <Link to="/microgreens">
                  Scopri i Nostri Prodotti
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div 
                className="h-96 rounded-2xl bg-cover bg-center shadow-soft"
                style={{ backgroundImage: `url(${chefImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-verde/10 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
              La Nostra Missione
            </h2>
            <p className="font-body text-xl text-muted-foreground leading-relaxed">
              Vogliamo rivoluzionare il modo di intendere l'alimentazione sana e sostenibile, 
              offrendo microgreens di altissima qualità che racchiudono tutto il sapore e i nutrienti 
              della tradizione agricola italiana. Ogni prodotto Verde D'Oro è il risultato di ricerca, 
              passione e rispetto per l'ambiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover-lift border-border/50">
                <CardContent className="p-8">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-oro mb-6">
                    <value.icon className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-primary mb-4">
                    {value.title}
                  </h3>
                  <p className="font-body text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-gradient-subtle">
        <div className="container-width">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="font-display text-4xl font-bold text-primary mb-8">
                Da Reggio Emilia al Mondo
              </h2>
              
              <div className="space-y-8 font-body text-muted-foreground leading-relaxed">
                <p className="text-lg">
                  La nostra avventura è iniziata nel 2020, quando abbiamo deciso di trasformare 
                  la nostra passione per l'agricoltura in una realtà imprenditoriale. Situati 
                  nelle fertili terre di Reggio Emilia, abbiamo scelto di specializzarci nei 
                  microgreens per la loro incredibile densità nutrizionale e il loro potenziale 
                  culinario inesplorato.
                </p>
                
                <p className="text-lg">
                  Quello che ci distingue è l'attenzione maniacale alla qualità: dalla selezione 
                  dei semi biologici alle tecniche di coltivazione innovative, ogni fase del processo 
                  è seguita personalmente dal nostro team. Non utilizziamo pesticidi o fertilizzanti 
                  chimici, affidandoci esclusivamente ai metodi naturali che la terra dell'Emilia 
                  ci ha insegnato.
                </p>
                
                <p className="text-lg">
                  Oggi, Verde D'Oro fornisce ristoranti stellati, chef appassionati e famiglie 
                  che credono in un'alimentazione sana e consapevole. La nostra visione è semplice: 
                  portare l'eccellenza italiana nel mondo dei microgreens, un germoglio alla volta.
                </p>
              </div>
            </div>
            
            <div className="space-y-8">
              <Card className="p-8 bg-primary text-primary-foreground">
                <h3 className="font-display text-2xl font-bold mb-4">I Nostri Numeri</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-display font-bold text-oro-primary">25+</div>
                    <div className="text-primary-foreground/80">Varietà di Microgreens</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display font-bold text-oro-primary">100%</div>
                    <div className="text-primary-foreground/80">Biologico e Naturale</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display font-bold text-oro-primary">24h</div>
                    <div className="text-primary-foreground/80">Dalla Raccolta alla Consegna</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-8 bg-oro-primary text-accent-foreground">
                <h3 className="font-display text-2xl font-bold mb-4">Certificazioni</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Award className="h-5 w-5 mr-3" />
                    Agricoltura Biologica
                  </li>
                  <li className="flex items-center">
                    <Award className="h-5 w-5 mr-3" />
                    Produzione Sostenibile
                  </li>
                  <li className="flex items-center">
                    <Award className="h-5 w-5 mr-3" />
                    Qualità Italiana
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-width text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Unisciti alla Rivoluzione Verde
          </h2>
          <p className="font-body text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Scopri il sapore autentico dei nostri microgreens e diventa parte della nostra storia. 
            Insieme possiamo costruire un futuro più sostenibile e gustoso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="oro" size="lg" asChild>
              <Link to="/microgreens">Esplora i Prodotti</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link to="/contatti">Contattaci</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ChiSiamo;