import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Share2, Heart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import nutritionHeroImage from "@/assets/microgreens-nutrition-hero.jpg";
import closeUpImage from "@/assets/microgreens-close-up.jpg";
import varietiesImage from "@/assets/microgreens-varieties.jpg";

const BlogArticle = () => {
  const nutritionalData = [
    {
      nutrient: "Vitamina C",
      comparison: "6 volte maggiore",
      microgreen: "Cavolo Rosso",
      description: "Essenziale per il sistema immunitario"
    },
    {
      nutrient: "Vitamina E",
      comparison: "40 volte maggiore", 
      microgreen: "Girasole",
      description: "Potente antiossidante naturale"
    },
    {
      nutrient: "Beta-carotene",
      comparison: "25 volte maggiore",
      microgreen: "Cilantro",
      description: "Precursore della vitamina A"
    },
    {
      nutrient: "Vitamina K",
      comparison: "4 volte maggiore",
      microgreen: "Rucola",
      description: "Importante per la coagulazione"
    }
  ];

  const benefits = [
    {
      title: "Concentrazione Nutrizionale",
      description: "I microgreens vengono raccolti nel momento di massima concentrazione di nutrienti, quando la pianta ha utilizzato tutti i suoi depositi energetici per la crescita iniziale.",
      icon: "🌱"
    },
    {
      title: "Biodisponibilità",
      description: "I nutrienti nei microgreens sono in forme più facilmente assorbibili dall'organismo rispetto alle verdure mature.",
      icon: "⚡"
    },
    {
      title: "Varietà Nutrizionale",
      description: "Ogni varietà di microgreen offre un profilo nutrizionale unico, permettendo una dieta più diversificata e completa.",
      icon: "🎨"
    }
  ];

  return (
    <Layout>
      <article className="min-h-screen bg-background">
        {/* Article Header */}
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <div className="mb-8">
                <Button variant="outline" size="sm" asChild className="mb-4">
                  <Link to="/blog" className="inline-flex items-center">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Torna al Blog
                  </Link>
                </Button>
              </div>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge variant="outline" className="text-xs">
                  Nutrizione
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    15 Marzo 2024
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    5 min di lettura
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    1.2k visualizzazioni
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                I Valori Nutrizionali Straordinari dei Microgreens
              </h1>

              {/* Subtitle */}
              <p className="font-body text-xl text-muted-foreground mb-8 leading-relaxed">
                Scopri perché questi piccoli germogli contengono fino a 40 volte più nutrienti 
                delle verdure mature e come possono rivoluzionare la tua alimentazione quotidiana.
              </p>

              {/* Social Actions */}
              <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="sm" className="inline-flex items-center">
                  <Heart className="mr-2 w-4 h-4" />
                  Mi piace
                </Button>
                <Button variant="outline" size="sm" className="inline-flex items-center">
                  <Share2 className="mr-2 w-4 h-4" />
                  Condividi
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Image */}
        <section className="mb-12">
          <div className="container-width">
            <div className="max-w-4xl mx-auto">
              <img 
                src={nutritionHeroImage} 
                alt="Microgreens con infografica nutrizionale" 
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-elegant"
                loading="lazy"
                width={1600}
                height={900}
              />
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="section-padding">
          <div className="container-width">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                {/* Introduction */}
                <div className="mb-12">
                  <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
                    Negli ultimi anni, i microgreens hanno conquistato l'attenzione di nutrizionisti, 
                    chef e appassionati di alimentazione sana in tutto il mondo. Ma cosa rende questi 
                    piccoli germogli così speciali dal punto di vista nutrizionale?
                  </p>
                  <p className="font-body text-lg text-muted-foreground leading-relaxed">
                    La risposta risiede nel momento unico della loro raccolta: quando la pianta è 
                    nel pieno della sua crescita iniziale e concentra tutti i suoi nutrienti in 
                    poche foglie delicate ma incredibilmente ricche.
                  </p>
                </div>

                {/* Nutritional Comparison Section */}
                <div className="mb-12">
                  <h2 className="font-display text-3xl font-bold text-foreground mb-8">
                    Il Confronto Nutrizionale
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {nutritionalData.map((item, index) => (
                      <Card key={index} className="border-border/50 bg-card hover-lift">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-display text-xl font-semibold text-foreground">
                              {item.nutrient}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {item.microgreen}
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold text-primary mb-2">
                            {item.comparison}
                          </div>
                          <p className="font-body text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Text + Image Section */}
                <div className="mb-12">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                        La Scienza dietro i Microgreens
                      </h2>
                      <p className="font-body text-muted-foreground leading-relaxed mb-6">
                        Uno studio condotto dall'Università del Maryland ha analizzato 25 varietà 
                        di microgreens, confrontando il loro contenuto nutrizionale con quello delle 
                        corrispondenti verdure mature. I risultati sono stati sorprendenti.
                      </p>
                      <p className="font-body text-muted-foreground leading-relaxed">
                        I microgreens di cavolo rosso, ad esempio, contenevano 40 volte più vitamina E 
                        e 6 volte più vitamina C rispetto al cavolo maturo. Questi dati confermano 
                        che i microgreens non sono solo una tendenza culinaria, ma un vero e proprio 
                        superfood concentrato.
                      </p>
                    </div>
                    <div>
                      <img 
                        src={closeUpImage} 
                        alt="Microgreens al microscopio mostrando la struttura cellulare ricca di nutrienti" 
                        className="w-full h-80 object-cover rounded-lg shadow-elegant"
                        loading="lazy"
                        width={800}
                        height={600}
                      />
                    </div>
                  </div>
                </div>

                {/* Benefits Section */}
                <div className="mb-12">
                  <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
                    I Benefici Unici dei Microgreens
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                      <Card key={index} className="border-border/50 bg-card text-center hover-lift">
                        <CardContent className="p-8">
                          <div className="text-4xl mb-4">{benefit.icon}</div>
                          <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                            {benefit.title}
                          </h3>
                          <p className="font-body text-muted-foreground leading-relaxed">
                            {benefit.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Conclusion */}
                <div className="mb-12">
                  <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                    Una Rivoluzione Nutrizionale
                  </h2>
                  <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
                    I microgreens rappresentano una vera rivoluzione nel mondo dell'alimentazione. 
                    Non solo offrono sapori intensi e unici, ma concentrano in pochi grammi una 
                    quantità di nutrienti che richiederebbe porzioni molto più grandi di verdure tradizionali.
                  </p>
                  <p className="font-body text-lg text-muted-foreground leading-relaxed">
                    Incorporare i microgreens nella tua dieta quotidiana significa fare una scelta 
                    consapevole verso un'alimentazione più ricca, più sana e più sostenibile. 
                    Il futuro del cibo è piccolo, ma incredibilmente potente.
                  </p>
                </div>

                {/* Call to Action */}
                <Card className="bg-gradient-subtle border-border/50 text-center">
                  <CardContent className="p-8">
                    <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                      Prova i Nostri Microgreens
                    </h3>
                    <p className="font-body text-muted-foreground mb-6">
                      Scopri tutta la potenza nutrizionale dei microgreens Verde D'Oro, 
                      coltivati con passione a Reggio Emilia.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button variant="verde" size="lg" asChild>
                        <Link to="/microgreens">
                          Esplora i Prodotti
                        </Link>
                      </Button>
                      <Button variant="outline" size="lg" asChild>
                        <Link to="/microgreens-su-misura">
                          Microgreens su Misura
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
                Articoli Correlati
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="overflow-hidden hover-lift border-border/50 bg-card">
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${varietiesImage})` }}
                  />
                  <CardContent className="p-6">
                    <Badge variant="outline" className="text-xs mb-3">
                      Ricette
                    </Badge>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                      Ricette Gourmet con Microgreens
                    </h3>
                    <p className="font-body text-muted-foreground text-sm mb-4">
                      Le creazioni degli chef stellati che utilizzano i nostri microgreens...
                    </p>
                    <Button variant="outline" size="sm">
                      Leggi articolo
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden hover-lift border-border/50 bg-card">
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${varietiesImage})` }}
                  />
                  <CardContent className="p-6">
                    <Badge variant="outline" className="text-xs mb-3">
                      Guide
                    </Badge>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                      Come Conservare i Microgreens
                    </h3>
                    <p className="font-body text-muted-foreground text-sm mb-4">
                      Consigli pratici per mantenere freschezza e proprietà nutritive...
                    </p>
                    <Button variant="outline" size="sm">
                      Leggi articolo
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </article>
    </Layout>
  );
};

export default BlogArticle;