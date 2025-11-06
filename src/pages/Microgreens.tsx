import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { Leaf, Star } from "lucide-react";
import varietiesImage from "@/assets/microgreens-varieties.jpg";
import chefImage from "@/assets/chef-microgreens.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  benefits: string[];
  uses: string[];
  rating: number;
  popular: boolean;
  media?: {
    file_path: string;
  };
}

const Microgreens = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            description,
            category,
            benefits,
            uses,
            rating,
            popular,
            media:media!products_image_id_fkey (
              file_path
            )
          `)
          .eq("published", true)
          .order("popular", { ascending: false })
          .order("name");

        if (error) throw error;
        if (data) setProducts(data as any);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Errore nel caricamento dei prodotti");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  return <Layout>
      <Helmet>
        <title>I Nostri Microgreens - Verde D'Oro</title>
        <meta
          name="description"
          content="Scopri la nostra selezione di microgreens biologici coltivati a Reggio Emilia. Basilico, ravanello rosso, pisello e molte altre varietà per la tua cucina gourmet."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="section-padding bg-gradient-subtle">
        <div className="container-width text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-primary mb-6">
            I Nostri Microgreens
          </h1>
          <p className="font-body text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
            Scopri la nostra selezione di microgreens coltivati con passione nel cuore dell'Emilia-Romagna. 
            Ogni varietà è scelta per il suo sapore unico e i suoi benefici nutrizionali eccezionali.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding bg-background">
        <div className="container-width">
          {loading ? (
            <p className="text-center">Caricamento prodotti...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  category={product.category}
                  description={product.description}
                  benefits={product.benefits}
                  uses={product.uses}
                  image={product.media?.file_path || chefImage}
                  rating={product.rating}
                  popular={product.popular}
                  onCardClick={() => navigate(`/prodotto/${product.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="section-padding bg-gradient-subtle">
        <div className="container-width">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-4xl font-bold text-primary mb-6">
                Perché i Nostri Microgreens Sono Speciali
              </h2>
              <div className="space-y-6 font-body text-muted-foregreen leading-relaxed">
                <div className="flex items-start space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-verde-primary flex-shrink-0 mt-1">
                    <Leaf className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">Coltivazione Biologica</h3>
                    <p className="text-muted-foreground">
                      Utilizziamo esclusivamente semi biologici certificati e metodi di coltivazione 
                      naturali, senza pesticidi o fertilizzanti chimici.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-oro-primary flex-shrink-0 mt-1">
                    <Star className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">Massima Freschezza</h3>
                    <p className="text-muted-foreground">
                      I nostri microgreens vengono raccolti al momento ottimale e consegnati 
                      entro 24 ore per garantire sapore e proprietà nutrizionali al massimo.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-verde-primary flex-shrink-0 mt-1">
                    <Leaf className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">Tradizione Italiana</h3>
                    <p className="text-muted-foreground">
                      Ogni varietà è selezionata per esaltare i sapori della cucina italiana, 
                      dalle erbe aromatiche ai microgreens più innovativi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-96 rounded-2xl bg-cover bg-center shadow-soft" style={{
            backgroundImage: `url(${varietiesImage})`
          }}>
              <div className="absolute inset-0 bg-gradient-verde/10 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    </Layout>;
};
export default Microgreens;