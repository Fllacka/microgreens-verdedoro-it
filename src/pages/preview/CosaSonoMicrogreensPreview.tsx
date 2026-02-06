import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { ContentBlockRenderer } from "@/components/ContentBlockRenderer";
import OptimizedImage from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { ChevronRight, AlertCircle, HelpCircle } from "lucide-react";

// Import fallback images
import heroImage from "@/assets/cosa-sono-microgreens-hero.jpg";

interface ContentBlock {
  id: string;
  type: "heading" | "text" | "image";
  level?: "h1" | "h2" | "h3";
  content?: string;
  url?: string;
  alt?: string;
}

interface HeroContent {
  title: string;
  subtitle: string;
  imageId?: string | null;
}

interface SeoContent {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  robots: string;
  published?: boolean;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQContent {
  title: string;
  items: FAQItem[];
}

// Reusable prose styling constant
const proseClasses = "prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-verde-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-verde-light [&_p]:my-4 [&_p]:min-h-[1.5em] [&_p:empty]:min-h-[1.5em] [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 prose-headings:font-display prose-headings:text-primary prose-p:text-muted-foreground prose-strong:text-primary";

const CosaSonoMicrogreensPreview = () => {
  const [loading, setLoading] = useState(true);
  const [heroData, setHeroData] = useState<HeroContent>({
    title: "Cosa sono i Microgreens?",
    subtitle: "Scopri il mondo delle micro-verdure: nutrienti, sostenibili e sorprendenti",
    imageId: null,
  });
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [faqData, setFaqData] = useState<FAQContent>({
    title: "Domande Frequenti sui Microgreens",
    items: [],
  });
  const [seoData, setSeoData] = useState<SeoContent>({
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    canonicalUrl: "",
    robots: "index, follow",
    published: true,
  });
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("cosa_sono_microgreens_sections")
        .select("*")
        .order("sort_order");

      if (error) throw error;

      if (data) {
        const imageIds: string[] = [];

        data.forEach((section) => {
          // Use draft content with fallback to published content
          const content = (section.draft_content ?? section.content) as Record<string, any>;
          switch (section.id) {
            case "hero":
              setHeroData({
                title: content.title || "",
                subtitle: content.subtitle || "",
                imageId: content.imageId || null,
              });
              if (content.imageId) imageIds.push(content.imageId);
              break;
            case "content":
              if (content.blocks && Array.isArray(content.blocks)) {
                setContentBlocks(content.blocks as ContentBlock[]);
              }
              break;
            case "faq":
              if (content.items && Array.isArray(content.items)) {
                setFaqData({
                  title: content.title || "Domande Frequenti sui Microgreens",
                  items: content.items as FAQItem[],
                });
              }
              break;
            case "seo":
              setSeoData({
                metaTitle: content.metaTitle || "",
                metaDescription: content.metaDescription || "",
                ogTitle: content.ogTitle || "",
                ogDescription: content.ogDescription || "",
                canonicalUrl: content.canonicalUrl || "",
                robots: content.robots || "index, follow",
                published: content.published !== false,
              });
              break;
          }
        });

        // Fetch hero image URL if present
        if (imageIds.length > 0) {
          const { data: mediaData } = await supabase
            .from("media")
            .select("id, file_path")
            .in("id", imageIds);

          if (mediaData) {
            const heroSection = data.find((s) => s.id === "hero");
            // Use draft content for hero image lookup
            const heroContent = (heroSection?.draft_content ?? heroSection?.content) as Record<string, any>;
            const foundMedia = mediaData.find((m) => m.id === heroContent?.imageId);
            if (foundMedia) setHeroImageUrl(foundMedia.file_path);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Caricamento...</div>
        </div>
      </Layout>
    );
  }

  const pageTitle = seoData.metaTitle || heroData.title || "Cosa sono i Microgreens?";
  const pageDescription = seoData.metaDescription || "Scopri cosa sono i microgreens e tutti i loro benefici.";

  return (
    <Layout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="noindex, nofollow" />
        {seoData.ogTitle && <meta property="og:title" content={seoData.ogTitle} />}
        {seoData.ogDescription && <meta property="og:description" content={seoData.ogDescription} />}
      </Helmet>

      {/* Preview Banner */}
      <div className="bg-amber-100 border-b border-amber-300 px-4 py-3">
        <div className="container mx-auto flex items-center gap-2 text-amber-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">
            Modalità Anteprima {!seoData.published && "- Questa pagina non è ancora pubblicata"}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {heroImageUrl ? (
          <>
            <div className="absolute inset-0">
              <OptimizedImage
                src={heroImageUrl}
                alt={heroData.title}
                className="w-full h-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>
            <div className="container mx-auto px-4 relative z-10 text-center">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                {heroData.title}
              </h1>
              {heroData.subtitle && (
                <div 
                  className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto prose prose-lg prose-invert max-w-none [&_a]:text-oro-primary [&_a]:underline [&_p]:my-2"
                  dangerouslySetInnerHTML={{ __html: heroData.subtitle }}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0">
              <OptimizedImage
                src={heroImage}
                alt={heroData.title}
                className="w-full h-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>
            <div className="container mx-auto px-4 relative z-10 text-center">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                {heroData.title}
              </h1>
              {heroData.subtitle && (
                <div 
                  className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto prose prose-lg prose-invert max-w-none [&_a]:text-oro-primary [&_a]:underline [&_p]:my-2"
                  dangerouslySetInnerHTML={{ __html: heroData.subtitle }}
                />
              )}
            </div>
          </>
        )}
      </section>

      {/* Content Blocks */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {contentBlocks.length > 0 ? (
              <ContentBlockRenderer blocks={contentBlocks} />
            ) : (
              <p className="text-center text-muted-foreground">
                Nessun contenuto disponibile. Aggiungi blocchi di contenuto dal CMS.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {faqData.items.length > 0 && (
        <section className="section-padding bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Section Divider */}
              <div className="border-t border-border/30 mb-12" />
              
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-verde-primary/10">
                  <HelpCircle className="h-6 w-6 text-verde-primary" />
                </div>
                <h2 className="font-display text-3xl font-bold text-primary">{faqData.title}</h2>
              </div>
              <Accordion type="single" collapsible className="space-y-4">
                {faqData.items.map((faq, index) => (
                  <AccordionItem 
                    key={faq.id || index} 
                    value={`faq-${index}`}
                    className="border-2 border-verde-primary/20 rounded-xl px-6 bg-gradient-to-br from-verde-primary/5 to-transparent shadow-sm hover:shadow-md hover:border-verde-primary/30 transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left font-display text-lg font-semibold text-primary hover:no-underline py-5 [&[data-state=open]]:text-verde-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="border-t border-verde-primary/10 pt-4">
                        <div 
                          className={proseClasses}
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-verde-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto a Scoprire i Nostri Microgreens?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Esplora la nostra selezione di microgreens freschi, coltivati con cura per garantirti qualità e sapore in ogni piatto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="group">
              <Link to="/microgreens">
                Scopri i Prodotti
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
              <Link to="/contatti">
                Contattaci
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CosaSonoMicrogreensPreview;
