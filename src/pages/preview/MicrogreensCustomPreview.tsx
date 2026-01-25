import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import heroImageFallback from "@/assets/microgreens-varieties.jpg";
import chefImageFallback from "@/assets/chef-custom-microgreens.jpg";

interface Category {
  id: string;
  name: string;
  items: string[];
  is_visible: boolean;
}

interface SectionContent {
  [key: string]: any;
}

interface Section {
  id: string;
  content: SectionContent;
  is_visible: boolean;
  sort_order: number;
}

const MicrogreensCustomPreview = () => {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (userRole !== 'admin' && userRole !== 'editor'))) {
      navigate('/admin/login');
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('microgreens_custom_sections')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      
      // Transform to use draft content with fallback to published content
      const transformedSections = (data || []).map(section => ({
        id: section.id,
        content: (section.draft_content ?? section.content) as SectionContent,
        is_visible: section.draft_is_visible ?? section.is_visible,
        sort_order: section.sort_order,
      }));
      setSections(transformedSections);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  const getSection = (id: string) => sections.find(s => s.id === id);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Caricamento...</div>
        </div>
      </Layout>
    );
  }

  const seoSection = getSection('seo');
  const heroSection = getSection('hero');
  const introSection = getSection('intro');
  const varietiesSection = getSection('varieties');
  const ctaSection = getSection('cta');

  const heroImage = heroSection?.content.image_url || heroImageFallback;
  const introImage = introSection?.content.image_url || chefImageFallback;

  return (
    <Layout>
      <Helmet>
        <title>{seoSection?.content.meta_title || 'Microgreens su Misura | Verde d\'Oro'}</title>
        <meta name="description" content={seoSection?.content.meta_description || ''} />
        {seoSection?.content.og_title && <meta property="og:title" content={seoSection.content.og_title} />}
        {seoSection?.content.og_description && <meta property="og:description" content={seoSection.content.og_description} />}
        {seoSection?.content.robots && <meta name="robots" content={seoSection.content.robots} />}
        <link rel="canonical" href={seoSection?.content.canonical_url || `${window.location.origin}/microgreens-su-misura`} />
      </Helmet>

      {/* Preview Banner */}
      <div className="bg-amber-500 text-white text-center py-2 text-sm font-medium">
        Modalità Anteprima - Stai visualizzando una bozza
      </div>

      {/* Hero Section */}
      {heroSection?.is_visible && (
        <section className="relative h-96 md:h-[500px] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-hero-transparent" />
          <div className="relative z-10 text-center text-white">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
              {heroSection.content.title || 'Microgreens su Misura'}
            </h1>
          </div>
        </section>
      )}

      {/* Intro Section */}
      {introSection?.is_visible && (
        <section className="section-padding bg-background">
          <div className="container-width">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div 
                  className="h-96 rounded-2xl bg-cover bg-center shadow-soft"
                  style={{ backgroundImage: `url(${introImage})` }}
                >
                  <div className="absolute inset-0 bg-gradient-verde/10 rounded-2xl" />
                </div>
              </div>
              <div>
              <div 
                className="font-body text-xl text-muted-foreground leading-relaxed prose prose-xl max-w-none [&_a]:text-primary [&_a]:underline [&_p]:my-2"
                dangerouslySetInnerHTML={{ __html: introSection.content.text || '' }}
              />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Varieties Section */}
      {varietiesSection?.is_visible && (
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
                {varietiesSection.content.title || 'Varietà Disponibili su Ordinazione'}
              </h2>
              <div 
                className="font-body text-lg text-muted-foreground max-w-3xl mx-auto prose prose-lg max-w-none [&_a]:text-primary [&_a]:underline [&_p]:my-2"
                dangerouslySetInnerHTML={{ __html: varietiesSection.content.description || '' }}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(varietiesSection.content.categories || [])
                .filter((cat: Category) => cat.is_visible)
                .map((category: Category) => (
                  <Card key={category.id} className="h-full hover-lift border-border/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-display font-semibold text-white bg-gradient-verde px-4 py-3 rounded-lg text-center shadow-soft">
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {category.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <div className="w-2 h-2 bg-verde-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="font-body text-sm text-muted-foreground leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {ctaSection?.is_visible && (
        <section className="section-padding bg-gradient-verde text-white">
          <div className="container-width text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              {ctaSection.content.title || 'Inizia il Tuo Progetto su Misura'}
            </h2>
            <div 
              className="font-body text-lg mb-8 leading-relaxed max-w-2xl mx-auto text-white/90 prose prose-lg prose-invert max-w-none [&_a]:text-oro-primary [&_a]:underline [&_p]:my-2"
              dangerouslySetInnerHTML={{ __html: ctaSection.content.description || '' }}
            />
            <Button variant="oro" size="lg" className="px-8 py-4 text-lg" asChild>
              <Link to={ctaSection.content.button_link || '/contatti'}>
                <Mail className="w-5 h-5 mr-2" />
                {ctaSection.content.button_text || 'Richiedi la Tua Varietà di Microgreens'}
              </Link>
            </Button>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default MicrogreensCustomPreview;