import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Star, AlertTriangle } from "lucide-react";
import { Helmet } from "react-helmet";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlockRenderer } from "@/components/ContentBlockRenderer";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ContentBlock {
  id: string;
  type: "heading" | "text" | "image";
  level?: "h1" | "h2" | "h3";
  content?: string;
  url?: string;
  alt?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  benefits: string[];
  uses: string[];
  benefits_content?: string;
  uses_content?: string;
  image_alt?: string;
  rating: number;
  popular: boolean;
  published: boolean;
  meta_title: string;
  meta_description: string;
  content_blocks: ContentBlock[];
  media?: {
    file_path: string;
  };
}

const ProductPreview = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [quantity, setQuantity] = useState(100);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (authLoading) return;
    
    // Check if user is authenticated and has admin/editor role
    if (!user) {
      navigate("/admin/login");
      return;
    }
    if (userRole === "admin" || userRole === "editor") {
      setAuthorized(true);
    } else {
      toast.error("Non hai i permessi per visualizzare l'anteprima");
      navigate("/");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug || !authorized) return;

      try {
        // Fetch product WITHOUT published filter for preview
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select(`
            *,
            media:media!products_image_id_fkey (
              file_path
            )
          `)
          .eq("slug", slug)
          .maybeSingle();

        if (productError) throw productError;

        if (productData) {
          setProduct({
            ...productData,
            content_blocks: (productData.content_blocks as unknown as ContentBlock[]) || [],
          } as any);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Errore nel caricamento del prodotto");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, authorized]);

  if (!authorized) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Caricamento anteprima...</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Prodotto non trovato</h1>
          <Button onClick={() => navigate("/admin/products")}>Torna ai prodotti</Button>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.slug,
      name: product.name,
      quantity,
      image: product.media?.file_path || "/placeholder.svg",
    });
  };

  return (
    <Layout>
      <Helmet>
        <title>Anteprima: {product.meta_title || `${product.name} - Verde D'Oro Microgreens`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Preview Banner */}
      <div className="bg-yellow-500 text-yellow-900 py-2 px-4 text-center sticky top-0 z-50">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">
            Modalità Anteprima {!product.published && "- Questa pagina non è pubblicata"}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-4 bg-white hover:bg-yellow-50"
            onClick={() => navigate(`/admin/products/${product.id}`)}
          >
            Torna all'editor
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative rounded-lg overflow-hidden shadow-lg aspect-square">
              <img 
                src={product.media?.file_path || "/placeholder.svg"} 
                alt={product.image_alt || product.name} 
                className="w-full h-full object-cover" 
                loading="eager" 
              />
            </div>

            {/* Product Info & Purchase */}
            <div className="flex flex-col justify-start">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-verde-primary/10 text-verde-primary border-verde-primary/20">
                  {product.category}
                </Badge>
                {product.popular && (
                  <Badge variant="outline" className="border-oro-primary text-oro-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Popolare
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
                {product.name}
              </h1>

              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Purchase Section */}
              <div className="flex justify-center">
                <Card className="w-full md:max-w-sm border border-border/50 bg-muted/30">
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <label htmlFor="quantity" className="font-display font-medium text-primary text-sm mb-2 block">
                        Seleziona quantità
                      </label>
                      <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                        <SelectTrigger id="quantity" className="w-full h-12 text-base">
                          <SelectValue placeholder="Seleziona quantità" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100 gr</SelectItem>
                          <SelectItem value="200">200 gr</SelectItem>
                          <SelectItem value="300">300 gr</SelectItem>
                          <SelectItem value="400">400 gr</SelectItem>
                          <SelectItem value="500">500 gr</SelectItem>
                          <SelectItem value="750">750 gr</SelectItem>
                          <SelectItem value="1000">1 kg</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-2">
                        Ordine minimo: 100 gr
                      </p>
                    </div>

                    <Button 
                      variant="oro" 
                      size="lg" 
                      className="w-full h-11 text-base mb-3 shadow-oro hover:shadow-oro/50 transition-all duration-300" 
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Aggiungi al Carrello
                    </Button>

                    <p className="text-xs text-muted-foreground text-center mb-2">
                      Coltivato a Reggio Emilia con semi biologici
                    </p>

                    <div className="flex items-center justify-center">
                      <Badge variant="secondary" className="bg-verde-primary/10 text-verde-primary text-xs">
                        ✓ Disponibile
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Overview - Panoramica del prodotto */}
      {product.content && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-primary mb-8">Panoramica del Prodotto</h2>
            <div 
              className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-primary prose-p:text-muted-foreground prose-a:text-verde-primary prose-strong:text-primary"
              dangerouslySetInnerHTML={{ __html: product.content }}
            />
          </div>
        </section>
      )}

      {/* Product Content with Content Blocks */}
      {product.content_blocks && product.content_blocks.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <ContentBlockRenderer blocks={product.content_blocks} />
        </section>
      )}

      {/* Benefits Section */}
      {product.benefits_content && (
        <section className="container mx-auto px-4 py-12 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-primary mb-8">Benefici</h2>
            <div 
              className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-primary prose-p:text-muted-foreground prose-a:text-verde-primary prose-strong:text-primary"
              dangerouslySetInnerHTML={{ __html: product.benefits_content }}
            />
          </div>
        </section>
      )}

      {/* Uses Section */}
      {product.uses_content && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-primary mb-8">Usi Culinari</h2>
            <div 
              className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-primary prose-p:text-muted-foreground prose-a:text-verde-primary prose-strong:text-primary"
              dangerouslySetInnerHTML={{ __html: product.uses_content }}
            />
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductPreview;
