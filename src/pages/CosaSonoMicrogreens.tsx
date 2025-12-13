import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import OptimizedImage from "@/components/ui/optimized-image";
import { 
  Leaf, 
  Sprout, 
  Clock, 
  Sun, 
  Droplets, 
  Heart, 
  Shield,
  ChefHat,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Globe,
  History,
  Salad,
  Utensils
} from "lucide-react";

// Import images
import heroImage from "@/assets/cosa-sono-microgreens-hero.jpg";
import comparisonImage from "@/assets/microgreens-vs-germogli.jpg";
import culinaryImage from "@/assets/microgreens-culinary-use.jpg";

import { generateBreadcrumbSchema, generateFAQSchema, combineSchemas } from "@/lib/seo";

const CosaSonoMicrogreens = () => {
  const canonicalUrl = "https://verdedoro.it/cosa-sono-i-microgreens";
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://verdedoro.it" },
    { name: "Cosa sono i Microgreens?", url: canonicalUrl }
  ]);

  const faqSchema = generateFAQSchema([
    {
      question: "Cosa sono i Microgreens?",
      answer: "I microgreens sono giovani piantine commestibili, raccolte appena dopo la formazione delle prime foglie vere (cotiledoni). Rappresentano una fase intermedia tra i germogli e le verdure adulte, con dimensioni tipiche tra 2,5 e 7,5 centimetri."
    },
    {
      question: "Qual è la differenza tra Microgreens e Germogli?",
      answer: "I germogli crescono senza luce e terra, consumando tutto (seme incluso), mentre i microgreens crescono con luce e substrato, consumando solo stelo e foglie. I microgreens hanno sapori più intensi e sono più sicuri dal punto di vista igienico."
    },
    {
      question: "Perché i Microgreens sono considerati Superfood?",
      answer: "I microgreens contengono concentrazioni di nutrienti fino a 40 volte superiori rispetto agli ortaggi maturi. Sono ricchi di vitamina C, vitamina K, beta-carotene e antiossidanti come luteina e zeaxantina."
    }
  ]);

  const combinedSchema = combineSchemas(breadcrumbSchema, faqSchema);

  return (
    <Layout>
      <Helmet>
        <title>Cosa sono i Microgreens? Guida Completa ai Superfood | Verde D'Oro</title>
        <meta 
          name="description" 
          content="Scopri cosa sono i microgreens, i benefici nutrizionali, la differenza con i germogli e come usarli in cucina. Guida completa ai superfood più nutrienti." 
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Cosa sono i Microgreens? Guida Completa ai Superfood" />
        <meta property="og:description" content="Scopri cosa sono i microgreens, i benefici nutrizionali e come usarli in cucina. Guida completa ai superfood." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="it_IT" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(combinedSchema)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Microgreens freschi e vibranti"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
            fetchPriority="high"
            loading="eager"
            decoding="sync"
          />
          <div className="absolute inset-0 bg-gradient-hero-transparent" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 container-width text-center text-primary-foreground py-20">
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center justify-center gap-2 text-sm text-primary-foreground/80">
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link></li>
              <li>/</li>
              <li className="text-primary-foreground font-medium">Cosa sono i Microgreens?</li>
            </ol>
          </nav>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Cosa sono i Microgreens?
          </h1>
          <p className="font-body text-lg md:text-xl max-w-3xl mx-auto text-primary-foreground/90 animate-fade-in">
            Scopri il mondo dei superfood più nutrienti e versatili della natura
          </p>
        </div>
      </section>

      {/* Definition Section */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Sprout className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary uppercase tracking-wider">Definizione</span>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Cosa Sono i Microgreens?
              </h2>
              
              <div className="prose prose-lg max-w-none text-muted-foreground font-body space-y-4">
                <p>
                  I <strong className="text-foreground">microgreens</strong> (o micro-ortaggi) sono giovani piantine commestibili, 
                  raccolte appena dopo la formazione delle prime foglie vere (i cotiledoni). Rappresentano una fase 
                  intermedia tra i germogli e le verdure adulte, con dimensioni tipiche tra <strong className="text-foreground">2,5 e 7,5 centimetri</strong>.
                </p>
                <p>
                  Questi piccoli vegetali possono essere ottenuti da semi di ortaggi comuni (come ravanello, cavolo, rucola), 
                  erbe aromatiche (basilico, coriandolo) e persino cereali (grano, orzo).
                </p>
                <p>
                  Nonostante le loro dimensioni ridotte, i microgreens vantano <strong className="text-foreground">sapori intensi e concentrati</strong> e 
                  un profilo nutrizionale che, in molti casi, supera quello delle piante adulte.
                </p>
              </div>

              {/* Quick Facts */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">7-21</p>
                    <p className="text-sm text-muted-foreground">giorni di crescita</p>
                  </CardContent>
                </Card>
                <Card className="border-accent/20 bg-accent/5">
                  <CardContent className="p-4 text-center">
                    <Leaf className="h-6 w-6 text-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">2.5-7.5</p>
                    <p className="text-sm text-muted-foreground">cm di altezza</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
                <OptimizedImage
                  src={heroImage}
                  alt="Microgreens freschi appena raccolti"
                  className="relative rounded-xl w-full h-auto"
                  containerClassName="rounded-xl overflow-hidden shadow-lg"
                  aspectRatio="4/3"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Benefits Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container-width">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Sostenibilità</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Benefici Ecologici
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Un'alternativa sostenibile per un futuro più verde
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Droplets,
                title: "Meno Acqua",
                description: "Richiedono una frazione dell'acqua necessaria per coltivare ortaggi tradizionali"
              },
              {
                icon: Sun,
                title: "Meno Spazio",
                description: "Coltivabili in ambienti controllati, serre urbane o anche in casa"
              },
              {
                icon: Clock,
                title: "Ciclo Rapido",
                description: "Pronti per il raccolto in soli 7-21 giorni dalla semina"
              },
              {
                icon: Leaf,
                title: "Zero Sprechi",
                description: "Raccolto fresco su richiesta, minimizzando gli sprechi alimentari"
              }
            ].map((benefit, index) => (
              <Card key={index} className="hover-lift border-border/50 bg-card">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-8 max-w-3xl mx-auto font-body">
            I microgreens rappresentano una soluzione ideale per chi cerca 
            <strong className="text-foreground"> prodotti freschi e locali</strong>, riducendo l'impatto ambientale 
            legato ai trasporti e alla conservazione.
          </p>
        </div>
      </section>

      {/* History Timeline Section */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-accent/10">
                <History className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium text-accent uppercase tracking-wider">Storia</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              La Storia dei Microgreens
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Dalle cucine californiane alla tua tavola
            </p>
          </div>

          {/* Timeline */}
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary via-accent to-primary hidden md:block" />
            
            {/* Timeline items */}
            <div className="space-y-12 md:space-y-0">
              {/* 1980s */}
              <div className="relative md:grid md:grid-cols-2 md:gap-8 md:items-center md:pb-16">
                <div className="md:text-right md:pr-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                    Anni '80
                  </span>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">Le Origini in California</h3>
                  <p className="text-muted-foreground font-body">
                    I microgreens fanno la loro prima apparizione nei ristoranti di alta cucina di San Francisco, 
                    utilizzati come guarnizioni eleganti e innovative.
                  </p>
                </div>
                <div className="hidden md:flex md:items-center md:justify-start md:pl-8">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
              </div>

              {/* 1990s-2000s */}
              <div className="relative md:grid md:grid-cols-2 md:gap-8 md:items-center md:pb-16">
                <div className="hidden md:flex md:items-center md:justify-end md:pr-8">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <Globe className="h-6 w-6 text-accent-foreground" />
                  </div>
                </div>
                <div className="md:pl-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-2">
                    Anni '90-2000
                  </span>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">Espansione Globale</h3>
                  <p className="text-muted-foreground font-body">
                    La tendenza si diffonde in Europa e nel resto del mondo. Chef stellati iniziano a 
                    incorporare i microgreens nei loro piatti signature.
                  </p>
                </div>
              </div>

              {/* Today */}
              <div className="relative md:grid md:grid-cols-2 md:gap-8 md:items-center">
                <div className="md:text-right md:pr-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                    Oggi
                  </span>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">Superfood Accessibile</h3>
                  <p className="text-muted-foreground font-body">
                    Grazie alla coltivazione locale e alle ricerche sui benefici nutrizionali, 
                    i microgreens sono ora accessibili a tutti, dai ristoranti alle cucine domestiche.
                  </p>
                </div>
                <div className="hidden md:flex md:items-center md:justify-start md:pl-8">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Microgreens vs Sprouts Comparison */}
      <section className="section-padding bg-secondary/30">
        <div className="container-width">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Sprout className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Confronto</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Microgreens vs Germogli
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Scopri le differenze fondamentali tra questi due superfood
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Comparison Image */}
            <div className="relative">
              <OptimizedImage
                src={comparisonImage}
                alt="Confronto tra microgreens e germogli"
                className="rounded-xl w-full h-auto"
                containerClassName="rounded-xl overflow-hidden shadow-lg"
                aspectRatio="4/3"
              />
            </div>

            {/* Comparison Table */}
            <div className="space-y-6">
              {/* Comparison items */}
              {[
                {
                  aspect: "Coltivazione",
                  microgreens: "Crescono con luce e substrato (terra o altro)",
                  germogli: "Crescono al buio, senza terra, solo con acqua"
                },
                {
                  aspect: "Parte consumata",
                  microgreens: "Solo stelo e foglie",
                  germogli: "Tutto, compreso il seme"
                },
                {
                  aspect: "Tempo di crescita",
                  microgreens: "7-21 giorni",
                  germogli: "2-7 giorni"
                },
                {
                  aspect: "Sapore",
                  microgreens: "Intenso e variegato",
                  germogli: "Più delicato"
                },
                {
                  aspect: "Sicurezza alimentare",
                  microgreens: "Più sicuri (meno rischio batterico)",
                  germogli: "Maggiore rischio contaminazione"
                }
              ].map((item, index) => (
                <div key={index} className="bg-card rounded-lg p-4 border border-border/50">
                  <h4 className="font-display font-semibold text-foreground mb-3">{item.aspect}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-primary uppercase">Microgreens</span>
                        <p className="text-sm text-muted-foreground">{item.microgreens}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase">Germogli</span>
                        <p className="text-sm text-muted-foreground">{item.germogli}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Superfood / Nutrition Section */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-accent/10">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium text-accent uppercase tracking-wider">Nutrizione</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Perché i Microgreens sono Superfood?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Concentrati di nutrienti in formato mini
            </p>
          </div>

          {/* Key Stat */}
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
              <CardContent className="p-8 text-center">
                <p className="text-5xl md:text-6xl font-bold text-accent mb-2">40x</p>
                <p className="text-lg text-foreground font-display">
                  più nutrienti rispetto agli ortaggi maturi
                </p>
                <p className="text-sm text-muted-foreground mt-2 font-body">
                  Secondo uno studio del Journal of Agricultural and Food Chemistry
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Nutrient Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { name: "Vitamina C", benefit: "Supporta il sistema immunitario", color: "primary" },
              { name: "Vitamina K", benefit: "Essenziale per la coagulazione", color: "accent" },
              { name: "Beta-carotene", benefit: "Precursore della vitamina A", color: "primary" },
              { name: "Antiossidanti", benefit: "Luteina e zeaxantina per la vista", color: "accent" }
            ].map((nutrient, index) => (
              <Card key={index} className="hover-lift border-border/50">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    nutrient.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'
                  }`}>
                    <Sparkles className={`h-6 w-6 ${
                      nutrient.color === 'primary' ? 'text-primary' : 'text-accent'
                    }`} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                    {nutrient.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">
                    {nutrient.benefit}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Family Benefits */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  Famiglia Brassicacee
                </h3>
                <p className="text-muted-foreground font-body mb-4">
                  Cavolo, broccoli, ravanello e senape sono ricchi di <strong className="text-foreground">glucosinolati</strong>, 
                  composti bioattivi studiati per le loro proprietà antiossidanti e potenzialmente antitumorali.
                </p>
                <ul className="space-y-2">
                  {["Cavolo rosso", "Broccoli", "Ravanello", "Senape"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Salad className="h-5 w-5 text-accent" />
                  Famiglia Asteracee
                </h3>
                <p className="text-muted-foreground font-body mb-4">
                  Lattuga, cicoria e girasole apportano <strong className="text-foreground">fibre, acido folico</strong> e 
                  composti fenolici utili per la salute cardiovascolare.
                </p>
                <ul className="space-y-2">
                  {["Lattuga", "Cicoria", "Girasole", "Tarassaco"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Culinary Usage Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container-width">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <ChefHat className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary uppercase tracking-wider">In Cucina</span>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Come Usare i Microgreens in Cucina
              </h2>
              
              <p className="text-lg text-muted-foreground font-body mb-8">
                I microgreens sono estremamente versatili. Si consumano preferibilmente crudi per 
                preservare al massimo i nutrienti, ma possono anche essere aggiunti a piatti caldi 
                all'ultimo momento.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Salad,
                    title: "Insalate e Bowl",
                    description: "Aggiungi colore, texture e sapore intenso alle tue insalate"
                  },
                  {
                    icon: Utensils,
                    title: "Guarnizioni Gourmet",
                    description: "Eleva la presentazione di qualsiasi piatto con un tocco elegante"
                  },
                  {
                    icon: Heart,
                    title: "Smoothie e Succhi",
                    description: "Boost nutrizionale per le tue bevande preferite"
                  }
                ].map((use, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <use.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{use.title}</h3>
                      <p className="text-sm text-muted-foreground font-body">{use.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pro Tip */}
              <div className="mt-8 p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-foreground font-body">
                  <strong className="text-accent">Consiglio:</strong> Conserva i microgreens in frigorifero, 
                  preferibilmente nel loro contenitore originale o in un sacchetto con carta assorbente. 
                  Consumali entro 5-7 giorni per gustarli al massimo della freschezza.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl blur-xl" />
              <OptimizedImage
                src={culinaryImage}
                alt="Piatto gourmet guarnito con microgreens freschi"
                className="relative rounded-xl w-full h-auto"
                containerClassName="rounded-xl overflow-hidden shadow-lg"
                aspectRatio="4/3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-verde text-primary-foreground">
        <div className="container-width text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Pronto a Scoprire i Nostri Microgreens?
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-8 font-body">
            Esplora la nostra selezione di microgreens freschi, coltivati con passione nel cuore dell'Emilia-Romagna.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/microgreens">
                Scopri i Prodotti
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/contatti">
                Richiedi Preventivo
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CosaSonoMicrogreens;
