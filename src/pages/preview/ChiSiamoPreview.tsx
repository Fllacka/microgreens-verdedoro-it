import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Leaf, Heart, Users, Award, ArrowRight, Shield, Sprout, Star } from "lucide-react";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";

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

const ChiSiamoPreview = () => {
  const [sections, setSections] = useState<Record<string, ChiSiamoSection>>({});
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    const hasAccess = roles?.some(r => r.role === "admin" || r.role === "editor");
    if (!hasAccess) {
      navigate("/admin/login");
      return;
    }

    setAuthorized(true);
    fetchSections();
  };

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("chi_siamo_sections")
        .select("*")
        .order("sort_order");

      if (error) throw error;

      const sectionsMap: Record<string, ChiSiamoSection> = {};
      data?.forEach((section) => {
        // Use draft content with fallback to published content
        const content = (section.draft_content ?? section.content) as Record<string, any>;
        const isVisible = section.draft_is_visible ?? section.is_visible;
        sectionsMap[section.id] = {
          id: section.id,
          content,
          is_visible: isVisible,
        };
      });
      setSections(sectionsMap);

      // Fetch hero image if exists - prioritize draft image
      const heroContent = sectionsMap.hero?.content;
      const heroImageId = heroContent?.image_id;
      if (heroImageId) {
        const { data: mediaData } = await supabase
          .from("media")
          .select("file_path")
          .eq("id", heroImageId)
          .maybeSingle();
        if (mediaData) {
          setHeroImageUrl(mediaData.file_path);
        }
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!authorized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const seoContent = sections.seo?.content || {};
  const heroContent = sections.hero?.content || {};
  const missionContent = sections.mission?.content || {};
  const storyContent = sections.story?.content || {};
  const ctaContent = sections.cta?.content || {};

  return (
    <>
      <Helmet>
        <title>{seoContent.meta_title || "Chi Siamo - Verde D'Oro Microgreens"}</title>
        <meta name="description" content={seoContent.meta_description || ""} />
        <meta name="robots" content={seoContent.robots || "index, follow"} />
        {seoContent.og_title && <meta property="og:title" content={seoContent.og_title} />}
        {seoContent.og_description && <meta property="og:description" content={seoContent.og_description} />}
      </Helmet>

      {/* Preview Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black text-center py-2 font-semibold">
        Modalità Anteprima - <Link to="/admin/chi-siamo" className="underline">Torna all'editor</Link>
      </div>

      <div className="pt-10">
        <Layout>
          {/* Hero Section */}
          {sections.hero?.is_visible && (
            <section className="section-padding bg-gradient-subtle">
              <div className="container-width">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h1 className="font-display text-4xl md:text-6xl font-bold text-primary mb-6">
                      {heroContent.title || "La Nostra Storia"}
                    </h1>
                    <div 
                      className="font-body text-xl text-muted-foreground mb-8 leading-relaxed prose prose-xl max-w-none [&_a]:text-primary [&_a]:underline [&_p]:my-2"
                      dangerouslySetInnerHTML={{ __html: heroContent.description || '' }}
                    />
                    {heroContent.button_text && (
                      <Button variant="oro" size="lg" asChild>
                        <Link to={heroContent.button_link || "/microgreens"}>
                          {heroContent.button_text}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <div 
                      className="h-96 rounded-2xl bg-cover bg-center shadow-soft" 
                      style={{ backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : undefined }}
                    >
                      <div className="absolute inset-0 bg-gradient-verde/10 rounded-2xl" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Mission Section */}
          {sections.mission?.is_visible && (
            <section className="section-padding bg-background">
              <div className="container-width">
                <div className="max-w-4xl mx-auto text-center mb-16">
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
                    {missionContent.title || "La Nostra Missione"}
                  </h2>
                  <div 
                    className="font-body text-xl text-muted-foreground leading-relaxed prose prose-xl max-w-none [&_a]:text-primary [&_a]:underline [&_p]:my-2"
                    dangerouslySetInnerHTML={{ __html: missionContent.description || '' }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {(missionContent.values || []).map((value: any, index: number) => {
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
          {sections.story?.is_visible && (
            <section className="section-padding bg-gradient-subtle">
              <div className="container-width">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2">
                    <h2 className="font-display text-4xl font-bold text-primary mb-8">
                      {storyContent.title || "Da Reggio Emilia al Mondo"}
                    </h2>
                    
                    <div className="space-y-8 font-body text-muted-foreground leading-relaxed">
                      {(storyContent.paragraphs || []).map((paragraph: string, index: number) => (
                        <p key={index} className="text-lg">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <Card className="p-8 bg-primary text-primary-foreground">
                      <h3 className="font-display text-2xl font-bold mb-4">I Nostri Numeri</h3>
                      <div className="space-y-4">
                        {(storyContent.stats || []).map((stat: any, index: number) => (
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
                        {(storyContent.certifications || []).map((cert: string, index: number) => (
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
          {sections.cta?.is_visible && (
            <section className="section-padding bg-primary text-primary-foreground">
              <div className="container-width text-center">
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                  {ctaContent.title || "Unisciti alla Rivoluzione Verde"}
                </h2>
                <div 
                  className="font-body text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto prose prose-xl prose-invert max-w-none [&_a]:text-oro-primary [&_a]:underline [&_p]:my-2"
                  dangerouslySetInnerHTML={{ __html: ctaContent.description || '' }}
                />
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {ctaContent.primary_button_text && (
                    <Button variant="oro" size="lg" asChild>
                      <Link to={ctaContent.primary_button_link || "/microgreens"}>
                        {ctaContent.primary_button_text}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </section>
          )}
        </Layout>
      </div>
    </>
  );
};

export default ChiSiamoPreview;
