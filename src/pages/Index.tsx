import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { Leaf, Heart, Truck, Shield, Star, ArrowRight, CheckCircle, ShoppingCart } from "lucide-react";
import heroImage from "@/assets/hero-microgreens.jpg";
import varietiesImage from "@/assets/microgreens-varieties.jpg";
import chefImage from "@/assets/chef-microgreens.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  featured_image_id: string | null;
}

interface MediaItem {
  id: string;
  file_path: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBlogPosts = async () => {
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, published_at, featured_image_id')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (posts && posts.length > 0) {
        setBlogPosts(posts);
        
        // Fetch media for featured images
        const imageIds = posts
          .map(p => p.featured_image_id)
          .filter((id): id is string => id !== null);
        
        if (imageIds.length > 0) {
          const { data: media } = await supabase
            .from('media')
            .select('id, file_path')
            .in('id', imageIds);
          
          if (media) {
            const map: Record<string, string> = {};
            media.forEach((m: MediaItem) => {
              map[m.id] = m.file_path;
            });
            setMediaMap(map);
          }
        }
      }
    };

    fetchBlogPosts();
  }, []);
  const benefits = [{
    icon: Heart,
    title: "Ricchi di Nutrienti",
    description: "Fino a 40 volte più nutrienti delle verdure mature"
  }, {
    icon: Leaf,
    title: "100% Naturali",
    description: "Coltivati senza pesticidi, freschi e sostenibili"
  }, {
    icon: Truck,
    title: "Consegna Fresca",
    description: "Raccolti al momento giusto e consegnati entro 24h"
  }, {
    icon: Shield,
    title: "Qualità Garantita",
    description: "Controlli rigorosi dalla semina alla tavola"
  }];
  const steps = [{
    number: "1",
    title: "Ordina",
    description: "Scegli i microgreens perfetti per le tue esigenze dal nostro catalogo o richiedi una consulenza",
    icon: Leaf
  }, {
    number: "2",
    title: "Semina",
    description: "Prepariamo la semina secondo le tue necessità, utilizzando solo semi biologici certificati",
    icon: Heart
  }, {
    number: "3",
    title: "Raccolta",
    description: "Raccogliamo al momento giusto per garantire massima freschezza e concentrazione nutrizionale",
    icon: Truck
  }, {
    number: "4",
    title: "Consegna",
    description: "Ricevi i tuoi microgreens freschi entro 24 ore dalla raccolta, direttamente a casa o in azienda",
    icon: Shield
  }];
  const featuredProducts = [{
    id: "basilico",
    name: "Basilico",
    description: "Aroma mediterraneo concentrato",
    benefits: ["Oli essenziali", "Proprietà digestive", "Aroma intenso"],
    uses: ["Pasta", "Bruschette", "Caprese"],
    image: chefImage,
    category: "Erbe Aromatiche"
  }, {
    id: "ravanello-rosso",
    name: "Ravanello Rosso",
    description: "Croccante e leggermente piccante",
    benefits: ["Vitamina C", "Fibre", "Minerali"],
    uses: ["Sushi", "Tartare", "Antipasti"],
    image: varietiesImage,
    category: "Brassicaceae"
  }, {
    id: "pisello",
    name: "Pisello",
    description: "Dolce e delicato",
    benefits: ["Proteine", "Vitamine del gruppo B", "Ferro"],
    uses: ["Zuppe", "Risotti", "Contorni"],
    image: chefImage,
    category: "Legumi"
  }];
  return <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{
      backgroundImage: `url(${heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
        <div className="absolute inset-0 bg-gradient-hero" />
        
        <div className="relative z-10 container-width text-left text-white">
          <div className="max-w-2xl">
            <div className="inline-block bg-oro-primary text-accent-foreground px-4 py-2 rounded-full text-sm font-body font-medium mb-6">
              Microgreens di Reggio Emilia
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              Verde <span className="text-oro-primary">D'Oro</span>
            </h1>
            <p className="font-body text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
              Microgreens coltivati con passione a Reggio Emilia, dall'orto al piatto in giornata per una cucina che fa la differenza.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="oro" size="lg" className="text-lg px-8 py-4" asChild>
                <Link to="/microgreens">
                  Scopri i microgreens
                </Link>
              </Button>
              <Button variant="hero" size="lg" className="text-lg px-8 py-4" asChild>
                <Link to="/microgreens-su-misura">Microgreens su misura</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cosa sono i microgreens Section */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img src={varietiesImage} alt="Albero con microgreens che crescono" className="w-full h-80 object-cover rounded-lg shadow-elegant" />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
                Cosa sono i microgreens?
              </h2>
              <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                I microgreens sono germogli giovani di ortaggi e piante aromatiche raccolti dopo 7-14 
                giorni dalla germinazione. Concentrano in poche foglie una quantità straordinaria di 
                vitamine, minerali e antiossidanti - fino a 40 volte in più rispetto alle verdure mature.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-display font-semibold text-primary mb-3">Sapore Intenso</h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Concentrazione di sapori unici e distintivi per piatti gourmet.
                  </p>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-primary mb-3">Valore Nutritivo</h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Fino a 40 volte più nutrienti rispetto alle verdure mature in fase di crescita.
                  </p>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-primary mb-3">Supporto di Stagione</h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Coltivazione costante tutto l'anno senza dipendere dalle stagioni.
                  </p>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-primary mb-3">Cucina Sostenibile</h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Prodotto locale a km 0 che riduce l'impatto ambientale.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Button variant="verde" className="inline-flex items-center">
                  <Link to="/cosa-sono-i-microgreens">Scopri di più</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Come Funziona Section */}
      <section className="section-padding bg-gradient-subtle">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
              Come Funziona?
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Da coltivazione della massima qualità per portare Qualità, eccellenza, identità: 
              i valori che caratterizzano la nostra azienda e i nostri prodotti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => <div key={index} className="relative text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-verde mb-6">
                  <step.icon className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-primary mb-4">
                  {step.number}. {step.title}
                </h3>
                <p className="font-body text-muted-foreground text-sm">
                  {step.description}
                </p>
                
                {index < steps.length - 1 && <div className="hidden lg:block absolute top-10 -right-4 w-8">
                    <ArrowRight className="h-6 w-6 text-oro-primary" />
                  </div>}
              </div>)}
          </div>
        </div>
      </section>

      {/* Ordini e Consegne Section */}
      <section className="section-padding bg-background">
        <div className="container-width text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
            Ordini e consegne
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Direttamente consegnare a Reggio Emilia e provincia per tutti i ordini ricevuti. Consegna 
            entro 24 ore dalla raccolta a CO2!
          </p>
          <Button variant="verde" size="lg" asChild>
            <Link to="/contatti">Ordina i microgreens</Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-gradient-subtle">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
              I Nostri Microgreens in Evidenza
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Scopri i microgreens più richiesti. Trova la varietà che fa per te adatta 
              al tuo utilizzo in cucina per dare un tocco speciale ai tuoi piatti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product, index) => (
              <ProductCard
                key={index}
                name={product.name}
                category={product.category}
                description={product.description}
                benefits={product.benefits}
                uses={product.uses}
                image={product.image}
                onCardClick={() => navigate(`/prodotto/${product.id}`)}
              />
            ))}
          </div>

          <div className="text-center">
            <Button variant="verde" size="lg" asChild>
              <Link to="/microgreens">
                Visualizza tutti i prodotti
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Microgreens su Misura Section */}
      <section className="section-padding bg-gradient-verde text-white">
        <div className="container-width">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Microgreens su Misura
              </h2>
              <p className="font-body mb-6 leading-relaxed text-white">
                Sei un ristoratore, uno chef o hai esigenze particolari? Progettiamo insieme 
                la soluzione perfetta per te. Varietà specifiche, dimensioni personalizzate, 
                consegne programmate: tutto ciò che ti serve per distinguerti.
              </p>
              <p className="font-body mb-8 text-base text-slate-50">
                Fornitura regolare attraverso contratti personalizzati per ristoranti, hotel, 
                catering e eventi. Consulenza gratuita per integrare i nostri microgreens 
                nel tuo menu e valorizzare i tuoi piatti.
              </p>
              <Button variant="oro" size="lg" asChild>
                <Link to="/microgreens-su-misura">
                  Richiedi un preventivo
                </Link>
              </Button>
            </div>
            <div className="lg:order-2">
              <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
                <img src={chefImage} alt="Chef con microgreens" className="w-full h-64 object-cover rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {blogPosts.length > 0 && (
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
              Esplora il Nostro Blog
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
              Consigli, ricette e l'incredibile mondo dei microgreens e scoprirne più che 
              mai sulle curiosità nutrizionali e tutto culinarie.
            </p>
            
            <div className={`grid gap-8 mb-8 ${blogPosts.length === 1 ? 'max-w-md mx-auto' : blogPosts.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 md:grid-cols-3'}`}>
              {blogPosts.map((post) => {
                const imageUrl = post.featured_image_id && mediaMap[post.featured_image_id] 
                  ? mediaMap[post.featured_image_id] 
                  : varietiesImage;
                
                return (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <Card className="overflow-hidden hover-lift border-border/50 h-full">
                      <div 
                        className="h-48 bg-cover bg-center relative" 
                        style={{ backgroundImage: `url(${imageUrl})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-hero/20" />
                      </div>
                      <CardContent className="p-6 text-left">
                        <h3 className="font-display text-xl font-semibold text-primary mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="font-body text-muted-foreground text-sm mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        {post.published_at && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(post.published_at), 'd MMM yyyy', { locale: it })}
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8">
              <Button variant="verde" size="lg" asChild>
                <Link to="/blog">
                  Leggi tutti gli articoli
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </Layout>;
};
export default Index;