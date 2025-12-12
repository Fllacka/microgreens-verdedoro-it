import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Leaf, Heart, Users, Award, ArrowRight, Shield, Sprout, Star } from "lucide-react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import chefImage from "@/assets/chef-microgreens.jpg";
import { generateBreadcrumbSchema } from "@/lib/seo";

interface ChiSiamoSection {
  id: string;
  content: Record<string, any>;
  is_visible: boolean;
}

const iconMap: Record<string, any> = {
  Leaf,
  Heart,
  Users,
  Award,
  Shield,
  Sprout,
  Star,
};

const ChiSiamo = () => {
  const [sections, setSections] = useState<Record<string, ChiSiamoSection>>({});
  const [heroImageUrl, setHeroImageUrl] = useState<string>(chefImage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("chi_siamo_sections")
        .select("*")
        .order("sort_order");

      if (error) throw error;

      const sectionsMap: Record<string, ChiSiamoSection> = {};
      data?.forEach((section) => {
        sectionsMap[section.id] = {
          ...section,
          content: section.content as Record<string, any>,
        };
      });
      setSections(sectionsMap);

      // Fetch hero image if exists
      if (sectionsMap.hero?.content?.image_id) {
        const { data: mediaData } = await supabase
          .from("media")
          .select("file_path")
          .eq("id", sectionsMap.hero.content.image_id)
          .single();
        if (mediaData) {
          setHeroImageUrl(mediaData.file_path);
        }
      }
    } catch (error) {
      console.error("Error fetching chi siamo sections:", error);
    } finally {
      setLoading(false);
    }
  };

  // Default values for fallback
  const defaultValues = [
    { icon: "Leaf", title: "Sostenibilità", description: "Coltiviamo nel rispetto dell'ambiente, utilizzando metodi naturali e sostenibili per preservare la terra per le future generazioni." },
    { icon: "Heart", title: "Passione", description: "Ogni microgreen è coltivato con amore e dedizione, dalla semina alla raccolta, per garantire il massimo della qualità e del sapore." },
    { icon: "Users", title: "Famiglia", description: "Siamo un'azienda familiare che crede nei valori tradizionali dell'agricoltura italiana, trasmessi di generazione in generazione." },
    { icon: "Award", title: "Eccellenza", description: "La nostra missione è portare sulle vostre tavole solo il meglio, con standard qualitativi che non accettano compromessi." },
  ];

  const seoContent = sections.seo?.content || {};
  const heroContent = sections.hero?.content || {};
  const missionContent = sections.mission?.content || {};
  const storyContent = sections.story?.content || {};
  const ctaContent = sections.cta?.content || {};

  const values = missionContent.values || defaultValues;
  const paragraphs = storyContent.paragraphs || [
    "La nostra avventura è iniziata nel 2020, quando abbiamo deciso di trasformare la nostra passione per l'agricoltura in una realtà imprenditoriale. Situati nelle fertili terre di Reggio Emilia, abbiamo scelto di specializzarci nei microgreens per la loro incredibile densità nutrizionale e il loro potenziale culinario inesplorato.",
    "Quello che ci distingue è l'attenzione maniacale alla qualità: dalla selezione dei semi biologici alle tecniche di coltivazione innovative, ogni fase del processo è seguita personalmente dal nostro team. Non utilizziamo pesticidi o fertilizzanti chimici, affidandoci esclusivamente ai metodi naturali che la terra dell'Emilia ci ha insegnato.",
    "Oggi, Verde D'Oro fornisce ristoranti stellati, chef appassionati e famiglie che credono in un'alimentazione sana e consapevole. La nostra visione è semplice: portare l'eccellenza italiana nel mondo dei microgreens, un germoglio alla volta.",
  ];
  const stats = storyContent.stats || [
    { value: "25+", label: "Varietà di Microgreens" },
    { value: "100%", label: "Biologico e Naturale" },
    { value: "24h", label: "Dalla Raccolta alla Consegna" },
  ];
  const certifications = storyContent.certifications || ["Agricoltura Biologica", "Produzione Sostenibile", "Qualità Italiana"];

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://verdedoro.it';
  const canonicalUrl = seoContent.canonical_url 
    ? `${currentUrl}${seoContent.canonical_url}`
    : `${currentUrl}/chi-siamo`;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Chi Siamo", url: "/chi-siamo" },
  ]);

  return (
    <Layout>
      <Helmet>
        <title>{seoContent.meta_title || "Chi Siamo - Verde D'Oro Microgreens"}</title>
        <meta name="description" content={seoContent.meta_description || "Scopri la storia di Verde D'Oro, azienda familiare di Reggio Emilia specializzata in microgreens biologici."} />
        <meta name="robots" content={seoContent.robots || "index, follow"} />
        <link rel="canonical" href={canonicalUrl} />
        {seoContent.og_title && <meta property="og:title" content={seoContent.og_title} />}
        {seoContent.og_description && <meta property="og:description" content={seoContent.og_description} />}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        {seoContent.structured_data && (
          <script type="application/ld+json">{seoContent.structured_data}</script>
        )}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Hero Section */}
      {(sections.hero?.is_visible !== false) && (
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-primary mb-6">
                  {heroContent.title || "La Nostra Storia"}
                </h1>
                <div 
                  className="font-body text-xl text-muted-foreground mb-8 leading-relaxed prose prose-lg max-w-none [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: heroContent.description || "Nel cuore dell'Emilia-Romagna, dove la tradizione agricola si sposa con l'innovazione, nasce Verde D'Oro Microgreens. La nostra storia inizia dalla passione per l'agricoltura sostenibile e dalla volontà di portare sulle tavole italiane il meglio della natura." }}
                />
                <Button variant="oro" size="lg" asChild>
                  <Link to={heroContent.button_link || "/microgreens"}>
                    {heroContent.button_text || "Scopri i Nostri Prodotti"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-soft">
                <img
                  src={heroImageUrl}
                  alt={heroContent.image_alt || "La nostra storia - Verde D'Oro Microgreens"}
                  className="absolute inset-0 w-full h-full object-cover"
                  fetchPriority="high"
                  loading="eager"
                  width={600}
                  height={384}
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-verde/10 rounded-2xl" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mission Section */}
      {(sections.mission?.is_visible !== false) && (
        <section className="section-padding bg-background">
          <div className="container-width">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
                {missionContent.title || "La Nostra Missione"}
              </h2>
              <div 
                className="font-body text-xl text-muted-foreground leading-relaxed prose prose-lg max-w-none [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: missionContent.description || "Vogliamo rivoluzionare il modo di intendere l'alimentazione sana e sostenibile, offrendo microgreens di altissima qualità che racchiudono tutto il sapore e i nutrienti della tradizione agricola italiana. Ogni prodotto Verde D'Oro è il risultato di ricerca, passione e rispetto per l'ambiente." }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value: any, index: number) => {
                const IconComponent = iconMap[value.icon] || Leaf;
                return (
                  <Card key={index} className="text-center hover-lift border-border/50">
                    <CardContent className="p-8">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-oro mb-6">
                        <IconComponent className="h-8 w-8 text-accent-foreground" />
                      </div>
                      <h3 className="font-display text-xl font-semibold text-primary mb-4">
                        {value.title}
                      </h3>
                      <p className="font-body text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Story Section */}
      {(sections.story?.is_visible !== false) && (
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <h2 className="font-display text-4xl font-bold text-primary mb-8">
                  {storyContent.title || "Da Reggio Emilia al Mondo"}
                </h2>
                
                <div className="space-y-8 font-body text-muted-foreground leading-relaxed">
                  {paragraphs.map((paragraph: string, index: number) => (
                    <div 
                      key={index} 
                      className="text-lg prose prose-lg max-w-none [&_a]:text-primary [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: paragraph }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-8">
                <Card className="p-8 bg-primary text-primary-foreground">
                  <h3 className="font-display text-2xl font-bold mb-4">I Nostri Numeri</h3>
                  <div className="space-y-4">
                    {stats.map((stat: any, index: number) => (
                      <div key={index}>
                        <div className="text-3xl font-display font-bold text-oro-primary">{stat.value}</div>
                        <div className="text-primary-foreground/80">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card className="p-8 bg-oro-primary text-accent-foreground">
                  <h3 className="font-display text-2xl font-bold mb-4">Certificazioni</h3>
                  <ul className="space-y-3">
                    {certifications.map((cert: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <Award className="h-5 w-5 mr-3" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {(sections.cta?.is_visible !== false) && (
        <section className="section-padding bg-primary text-primary-foreground">
          <div className="container-width text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {ctaContent.title || "Unisciti alla Rivoluzione Verde"}
            </h2>
            <div 
              className="font-body text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto prose prose-lg prose-invert max-w-none [&_a]:text-oro-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: ctaContent.description || "Scopri il sapore autentico dei nostri microgreens e diventa parte della nostra storia. Insieme possiamo costruire un futuro più sostenibile e gustoso." }}
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="oro" size="lg" asChild>
                <Link to={ctaContent.primary_button_link || "/microgreens"}>
                  {ctaContent.primary_button_text || "Esplora i Nostri Microgreens"}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ChiSiamo;
