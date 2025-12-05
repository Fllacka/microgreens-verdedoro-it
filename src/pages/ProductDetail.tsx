import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Star, Leaf } from "lucide-react";
import { Helmet } from "react-helmet";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  media?: {
    file_path: string;
  };
}

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(100);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      try {
        // Fetch current product
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select(`
            *,
            media:media!products_image_id_fkey (
              file_path
            )
          `)
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle();

        if (productError) throw productError;

        if (productData) {
          setProduct(productData as Product);

          // Fetch related products (exclude current product)
          const { data: relatedData, error: relatedError } = await supabase
            .from("products")
            .select(`
              *,
              media:media!products_image_id_fkey (
                file_path
              )
            `)
            .eq("published", true)
            .neq("slug", slug)
            .limit(3);

          if (relatedError) throw relatedError;
          if (relatedData) {
            setRelatedProducts(relatedData as Product[]);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Errore nel caricamento del prodotto");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Caricamento...</p>
        </div>
      </Layout>
    );
  }
  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Prodotto non trovato</h1>
          <Button onClick={() => navigate("/microgreens")}>Torna ai prodotti</Button>
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
  return <Layout>
      <Helmet>
        <title>{product.meta_title || `${product.name} - Verde D'Oro Microgreens`}</title>
        <meta name="description" content={product.meta_description || product.description} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            description: product.content,
            brand: {
              "@type": "Brand",
              name: "Verde D'Oro",
            },
            aggregateRating: product.rating
              ? {
                  "@type": "AggregateRating",
                  ratingValue: product.rating,
                  bestRating: "5",
                  worstRating: "1",
                }
              : undefined,
            offers: {
              "@type": "Offer",
              availability: "https://schema.org/InStock",
              priceCurrency: "EUR",
            },
          })}
        </script>
      </Helmet>

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
                {product.category && (
                  <Badge variant="secondary" className="bg-verde-primary/10 text-verde-primary border-verde-primary/20">
                    {product.category}
                  </Badge>
                )}
                {product.popular && <Badge variant="outline" className="border-oro-primary text-oro-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Popolare
                  </Badge>}
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
                    {/* Quantity Selector */}
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

                    {/* Add to Cart Button */}
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

                    {/* Stock Status */}
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
              className="prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_a:hover]:text-verde-light [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img[data-align=left]]:float-left [&_img[data-align=left]]:mr-4 [&_img[data-align=left]]:mb-2 [&_img[data-align=center]]:mx-auto [&_img[data-align=center]]:block [&_img[data-align=center]]:float-none [&_img[data-align=right]]:float-right [&_img[data-align=right]]:ml-4 [&_img[data-align=right]]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 prose-headings:font-display prose-headings:text-primary prose-p:text-muted-foreground prose-strong:text-primary"
              dangerouslySetInnerHTML={{ __html: product.content }}
            />
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {product.benefits_content && (
        <section className="container mx-auto px-4 py-12 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-primary mb-8">Benefici</h2>
            <div 
              className="prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_a:hover]:text-verde-light [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img[data-align=left]]:float-left [&_img[data-align=left]]:mr-4 [&_img[data-align=left]]:mb-2 [&_img[data-align=center]]:mx-auto [&_img[data-align=center]]:block [&_img[data-align=center]]:float-none [&_img[data-align=right]]:float-right [&_img[data-align=right]]:ml-4 [&_img[data-align=right]]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 prose-headings:font-display prose-headings:text-primary prose-p:text-muted-foreground prose-strong:text-primary"
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
              className="prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_a:hover]:text-verde-light [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img[data-align=left]]:float-left [&_img[data-align=left]]:mr-4 [&_img[data-align=left]]:mb-2 [&_img[data-align=center]]:mx-auto [&_img[data-align=center]]:block [&_img[data-align=center]]:float-none [&_img[data-align=right]]:float-right [&_img[data-align=right]]:ml-4 [&_img[data-align=right]]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 prose-headings:font-display prose-headings:text-primary prose-p:text-muted-foreground prose-strong:text-primary"
              dangerouslySetInnerHTML={{ __html: product.uses_content }}
            />
          </div>
        </section>
      )}

      {/* Related Products */}
      <section className="container mx-auto px-4 py-16 bg-gradient-subtle">
        <h2 className="font-display text-3xl font-bold text-center mb-12">
          Altri prodotti che ti potrebbero interessare
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard
              key={relatedProduct.id}
              name={relatedProduct.name}
              category={relatedProduct.category}
              description={relatedProduct.description}
              benefits={relatedProduct.benefits}
              uses={relatedProduct.uses}
              image={relatedProduct.media?.file_path || "/placeholder.svg"}
              rating={relatedProduct.rating}
              popular={relatedProduct.popular}
              onCardClick={() => navigate(`/prodotto/${relatedProduct.slug}`)}
            />
          ))}
        </div>
      </section>
    </Layout>;
};
export default ProductDetail;