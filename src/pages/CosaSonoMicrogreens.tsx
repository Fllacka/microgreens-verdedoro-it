import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import OptimizedImage from "@/components/ui/optimized-image";
import { ArrowRight } from "lucide-react";

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
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
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
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Cosa sono i Microgreens?
          </h1>
          <p className="font-body text-lg md:text-xl max-w-3xl mx-auto text-primary-foreground/90 animate-fade-in">
            Una guida completa al mondo dei micro-ortaggi
          </p>
        </div>
      </section>

      {/* Section 1: Cosa Sono i Microgreens? - Text + Image */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
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
            </div>
            
            <div>
              <OptimizedImage
                src={heroImage}
                alt="Microgreens freschi appena raccolti"
                className="rounded-xl w-full h-auto"
                containerClassName="rounded-xl overflow-hidden shadow-lg"
                aspectRatio="4/3"
                priority={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Perché i Microgreens Fanno Bene all'Ambiente? - Text Only */}
      <section className="section-padding bg-secondary/30">
        <div className="container-width max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
            Perché i Microgreens Fanno Bene all'Ambiente?
          </h2>
          
          <div className="prose prose-lg max-w-none text-muted-foreground font-body space-y-4">
            <p>
              Oltre a essere un concentrato di nutrienti, i microgreens rappresentano un'alternativa 
              sostenibile nell'ambito della produzione alimentare:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Richiedono <strong className="text-foreground">meno acqua</strong> rispetto alla coltivazione di ortaggi tradizionali.</li>
              <li>Possono essere coltivati in <strong className="text-foreground">ambienti controllati</strong>, come serre urbane o piccoli spazi domestici, riducendo i trasporti e l'impatto legato alla logistica.</li>
              <li>Il loro <strong className="text-foreground">ciclo di crescita breve</strong> (7-21 giorni, a seconda della varietà) consente una produzione continua e locale, garantendo freschezza e qualità.</li>
            </ul>
            <p>
              Per tutti questi motivi, i microgreens sono una scelta ideale per chi cerca <strong className="text-foreground">prodotti freschi e locali</strong>, 
              con un minor impatto sull'ambiente.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: La Storia dei Microgreens - Text Only */}
      <section className="section-padding bg-background">
        <div className="container-width max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
            La Storia dei Microgreens
          </h2>
          
          <div className="prose prose-lg max-w-none text-muted-foreground font-body space-y-4">
            <p>
              I microgreens hanno fatto la loro prima comparsa nei <strong className="text-foreground">ristoranti californiani degli anni '80</strong>, 
              inizialmente come guarnizioni colorate e decorative per piatti di alta cucina.
            </p>
            <p>
              Nel corso degli anni, l'interesse per questi piccoli vegetali è cresciuto, tanto che oggi sono 
              coltivati e consumati in tutto il mondo, non solo negli ambienti gourmet ma anche nelle 
              cucine domestiche.
            </p>
            <p>
              La scoperta dei loro <strong className="text-foreground">straordinari valori nutrizionali</strong> ha accelerato la diffusione dei 
              microgreens, trasformandoli da semplice "decorazione" a vero e proprio <strong className="text-foreground">superfood</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Microgreens vs Germogli - Text + Image */}
      <section className="section-padding bg-secondary/30">
        <div className="container-width">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <OptimizedImage
                src={comparisonImage}
                alt="Confronto tra microgreens e germogli"
                className="rounded-xl w-full h-auto"
                containerClassName="rounded-xl overflow-hidden shadow-lg"
                aspectRatio="4/3"
              />
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Microgreens vs Germogli: Quali Sono le Differenze?
              </h2>
              
              <div className="prose prose-lg max-w-none text-muted-foreground font-body space-y-4">
                <p>
                  A prima vista, microgreens e germogli possono sembrare simili, ma in realtà 
                  presentano <strong className="text-foreground">differenze sostanziali</strong>:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-foreground">Coltivazione:</strong> I germogli crescono in acqua o ambienti molto umidi, senza luce; i microgreens crescono su substrato (terra o altro) e necessitano di luce.</li>
                  <li><strong className="text-foreground">Parte consumata:</strong> Dei germogli si consuma tutto, seme compreso; dei microgreens si mangiano solo stelo e foglie.</li>
                  <li><strong className="text-foreground">Tempo di crescita:</strong> I germogli si raccolgono dopo 2-7 giorni, i microgreens dopo 7-21 giorni.</li>
                  <li><strong className="text-foreground">Sicurezza alimentare:</strong> I microgreens comportano un rischio inferiore di contaminazioni batteriche rispetto ai germogli, che crescono in ambienti più umidi e a temperature favorevoli ai batteri.</li>
                </ul>
                <p>
                  Grazie ai loro <strong className="text-foreground">sapori intensi</strong> e alla maggiore sicurezza alimentare, i microgreens 
                  sono spesso preferiti nella ristorazione di qualità.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Perché i Microgreens Sono Considerati un "Superfood"? - Text Only */}
      <section className="section-padding bg-background">
        <div className="container-width max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
            Perché i Microgreens Sono Considerati un "Superfood"?
          </h2>
          
          <div className="prose prose-lg max-w-none text-muted-foreground font-body space-y-4">
            <p>
              I microgreens non sono solo belli da vedere: contengono <strong className="text-foreground">concentrazioni di nutrienti sorprendenti</strong>. 
              Secondo uno studio pubblicato sul <em>Journal of Agricultural and Food Chemistry</em>, alcune varietà 
              di microgreens presentano livelli di vitamine e antiossidanti <strong className="text-foreground">fino a 40 volte superiori</strong> rispetto 
              agli ortaggi maturi della stessa specie.
            </p>
            <p>
              Tra i principali nutrienti troviamo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Vitamina C:</strong> fondamentale per il sistema immunitario.</li>
              <li><strong className="text-foreground">Vitamina K:</strong> essenziale per la coagulazione del sangue e la salute delle ossa.</li>
              <li><strong className="text-foreground">Beta-carotene:</strong> precursore della vitamina A, importante per la vista e la pelle.</li>
              <li><strong className="text-foreground">Antiossidanti:</strong> come luteina e zeaxantina, utili per la protezione degli occhi.</li>
            </ul>
            <p>
              Ogni famiglia botanica offre benefici specifici. Le <strong className="text-foreground">Brassicacee</strong> (cavolo, broccoli, ravanello, senape) 
              sono ricche di glucosinolati, composti bioattivi studiati per le loro proprietà antiossidanti e potenzialmente 
              antitumorali. Le <strong className="text-foreground">Asteracee</strong> (lattuga, cicoria, girasole) apportano fibre, acido folico e composti 
              fenolici utili per la salute cardiovascolare.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Come Usare i Microgreens in Cucina - Text + Image */}
      <section className="section-padding bg-secondary/30">
        <div className="container-width">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Come Usare i Microgreens in Cucina
              </h2>
              
              <div className="prose prose-lg max-w-none text-muted-foreground font-body space-y-4">
                <p>
                  I microgreens sono <strong className="text-foreground">estremamente versatili</strong>. Si consumano preferibilmente crudi per 
                  preservare al massimo i nutrienti, ma possono anche essere aggiunti a piatti caldi 
                  all'ultimo momento. Ecco alcuni suggerimenti:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-foreground">Insalate:</strong> aggiungi i microgreens alle tue insalate per un tocco di colore, croccantezza e sapore.</li>
                  <li><strong className="text-foreground">Guarnizioni:</strong> utilizza i microgreens per decorare e arricchire piatti di carne, pesce, zuppe o uova.</li>
                  <li><strong className="text-foreground">Panini e wrap:</strong> sostituisci la classica lattuga con i microgreens per un gusto più intenso.</li>
                  <li><strong className="text-foreground">Smoothie e succhi:</strong> frullali insieme a frutta e verdura per un boost nutrizionale.</li>
                </ul>
                <p>
                  <strong className="text-foreground">Consiglio:</strong> conserva i microgreens in frigorifero, preferibilmente nel loro contenitore originale 
                  o in un sacchetto con carta assorbente. Consumali entro 5-7 giorni per gustarli al 
                  massimo della freschezza.
                </p>
              </div>
            </div>
            
            <div>
              <OptimizedImage
                src={culinaryImage}
                alt="Piatto gourmet guarnito con microgreens freschi"
                className="rounded-xl w-full h-auto"
                containerClassName="rounded-xl overflow-hidden shadow-lg"
                aspectRatio="4/3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Matching reference image style */}
      <section className="section-padding bg-primary text-primary-foreground">
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
            <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20" asChild>
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
