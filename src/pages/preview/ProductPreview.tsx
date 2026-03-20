import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShoppingCart, Star, AlertTriangle, Leaf, FileText, Heart, ChefHat, HelpCircle } from "lucide-react";
import { Helmet } from "react-helmet";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import OptimizedImage from "@/components/ui/optimized-image";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { generateProductSchema, generateBreadcrumbSchema, generateFAQSchema, combineSchemas, stripHtmlTags } from "@/lib/seo";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface PriceTier {
  weight: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  content: string;
  content_title?: string;
  category: string;
  benefits: string[];
  uses: string[];
  benefits_content?: string;
  benefits_title?: string;
  uses_content?: string;
  uses_title?: string;
  image_alt?: string;
  rating: number;
  popular: boolean;
  published: boolean;
  meta_title: string;
  meta_description: string;
  faq_items?: FAQItem[];
  price_tiers?: PriceTier[];
  media?: {
    file_path: string;
  };
}

// Format price in euros
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

// Reusable prose styling constant
const proseClasses = "prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-verde-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-verde-light [&_p]:my-4 [&_p]:min-h-[1.5em] [&_p:empty]:min-h-[1.5em] [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img[data-align=left]]:float-left [&_img[data-align=left]]:mr-4 [&_img[data-align=left]]:mb-2 [&_img[data-align=center]]:mx-auto [&_img[data-align=center]]:block [&_img[data-align=center]]:float-none [&_img[data-align=right]]:float-right [&_img[data-align=right]]:ml-4 [&_img[data-align=right]]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 prose-headings:font-display prose-headings:text-primary prose-p:text-muted-foreground prose-strong:text-primary";

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
          const data = productData as any;
          
          // If there's a draft_image_id, fetch the draft media separately
          let draftMedia = null;
          if (data.draft_image_id) {
            const { data: mediaData } = await supabase
              .from("media")
              .select("file_path")
              .eq("id", data.draft_image_id)
              .maybeSingle();
            draftMedia = mediaData;
          }

          // Transform data to use draft values with fallback to published
          const transformedProduct: Product = {
            id: data.id,
            // Use draft values with fallback to published values
            name: data.draft_name ?? data.name,
            slug: data.draft_slug ?? data.slug,
            description: data.draft_description ?? data.description ?? "",
            content: data.draft_content ?? data.content ?? "",
            content_title: data.draft_content_title ?? data.content_title,
            category: data.draft_category ?? data.category ?? "",
            benefits: data.draft_benefits ?? data.benefits ?? [],
            uses: data.draft_uses ?? data.uses ?? [],
            benefits_content: data.draft_benefits_content ?? data.benefits_content,
            benefits_title: data.draft_benefits_title ?? data.benefits_title,
            uses_content: data.draft_uses_content ?? data.uses_content,
            uses_title: data.draft_uses_title ?? data.uses_title,
            image_alt: data.draft_image_alt ?? data.image_alt,
            rating: data.rating,
            popular: data.popular,
            published: data.published,
            meta_title: data.draft_meta_title ?? data.meta_title,
            meta_description: data.draft_meta_description ?? data.meta_description,
            faq_items: data.draft_faq_items ?? data.faq_items ?? [],
            price_tiers: data.draft_price_tiers ?? data.price_tiers ?? [],
            // Use draft image if available, otherwise published image
            media: draftMedia ?? data.media,
          };
          setProduct(transformedProduct);
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

  // Get available weight options based on price tiers or defaults
  const defaultWeights = [100, 200, 300, 400, 500, 750, 1000];
  const priceTiers = product?.price_tiers || [];
  const hasPriceTiers = priceTiers.length > 0;
  
  // If price tiers are configured, only show those weights; otherwise show all defaults
  const availableWeights = hasPriceTiers 
    ? priceTiers.map(t => t.weight).sort((a, b) => a - b)
    : defaultWeights;
  
  // Get price for current quantity
  const currentPriceTier = priceTiers.find(t => t.weight === quantity);
  const currentPrice = currentPriceTier?.price;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: `${product.slug}-${quantity}`, // Unique ID per weight
      name: product.name,
      slug: product.slug,
      quantity,
      price: currentPrice,
      image: product.media?.file_path || "/placeholder.svg",
    });
  };

  // Generate structured data for preview validation
  const productSchema = generateProductSchema({
    name: product.name,
    description: product.description || product.content || "",
    slug: product.slug,
    image: product.media?.file_path,
    rating: product.rating,
    category: product.category,
    priceTiers: product.price_tiers,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Microgreens", url: "/microgreens" },
    { name: `Microgreens di ${product.name}`, url: `/microgreens/${product.slug}` },
  ]);

  // Generate FAQ schema if FAQs exist
  const faqSchema = product.faq_items && product.faq_items.length > 0
    ? generateFAQSchema(
        product.faq_items.map(faq => ({
          question: faq.question,
          answer: stripHtmlTags(faq.answer),
        }))
      )
    : null;

  // Combine all schemas
  const allSchemas = faqSchema 
    ? [productSchema, breadcrumbSchema, faqSchema]
    : [productSchema, breadcrumbSchema];

  return (
    <Layout>
      <Helmet>
        <title>Anteprima: {product.meta_title || `Microgreens di ${product.name} - Verde D'Oro Microgreens`}</title>
        <meta name="robots" content="noindex, nofollow" />
        {/* Include structured data in preview for validation */}
        <script type="application/ld+json">
          {JSON.stringify(combineSchemas(...allSchemas))}
        </script>
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
          {/* Breadcrumb Navigation */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-muted-foreground hover:text-verde-primary transition-colors">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/microgreens" className="text-muted-foreground hover:text-verde-primary transition-colors">
                    Microgreens
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary font-medium">{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-square">
              <OptimizedImage
                src={product.media?.file_path || "/placeholder.svg"}
                alt={product.image_alt || product.name}
                className="w-full h-full"
                containerClassName="w-full h-full"
                priority={true}
                objectFit="cover"
              />
            </div>

            {/* Product Info & Purchase - Sticky on Desktop */}
            <div className="flex flex-col justify-start md:sticky md:top-24 md:self-start">
              <div className="flex items-center gap-3 mb-4">
                {product.category && (
                  <Badge variant="secondary" className="bg-verde-primary/10 text-verde-primary border-verde-primary/20">
                    {product.category}
                  </Badge>
                )}
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
              <Card className="w-full border-2 border-verde-primary/20 bg-gradient-to-br from-background to-muted/30 shadow-lg">
                <CardContent className="p-6">
                  {/* Quantity Selector */}
                  <div className="mb-5">
                    <label htmlFor="quantity" className="font-display font-semibold text-primary text-sm mb-2 block">
                      Seleziona quantità
                    </label>
                    
                    <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                      <SelectTrigger id="quantity" className="w-full h-12 text-base border-border/50 focus:border-verde-primary">
                        <SelectValue placeholder="Seleziona quantità" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableWeights.map((weight) => {
                          const tier = priceTiers.find(t => t.weight === weight);
                          const priceLabel = tier?.price ? ` - ${formatPrice(tier.price)}` : '';
                          const weightLabel = weight >= 1000 ? `${weight / 1000} kg` : `${weight} gr`;
                          return (
                            <SelectItem key={weight} value={weight.toString()}>
                              {weightLabel}{priceLabel}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Ordine minimo: {availableWeights[0] >= 1000 ? `${availableWeights[0] / 1000} kg` : `${availableWeights[0]} gr`}
                    </p>
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    variant="oro" 
                    size="lg" 
                    className="w-full h-12 text-base font-semibold mb-4 shadow-oro hover:shadow-oro/50 transition-all duration-300" 
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Aggiungi al Carrello
                    {currentPrice !== undefined && currentPrice > 0 && ` - ${formatPrice(currentPrice)}`}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Coltivato a Reggio Emilia con semi biologici
                  </p>

                  {/* Stock Status */}
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="bg-verde-primary/10 text-verde-primary">
                      <Leaf className="h-3 w-3 mr-1" />
                      Disponibile
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Product Overview - Panoramica del prodotto */}
      {product.content && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Section Divider */}
            <div className="border-t border-border/30 mb-12" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-verde-primary/10">
                <FileText className="h-6 w-6 text-verde-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold text-primary">{product.content_title || "Panoramica del Prodotto"}</h2>
            </div>
            <div 
              className={proseClasses}
              dangerouslySetInnerHTML={{ __html: product.content }}
            />
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {product.benefits_content && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Section Divider */}
            <div className="border-t border-border/30 mb-12" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-verde-primary/10">
                <Heart className="h-6 w-6 text-verde-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold text-primary">{product.benefits_title || "Benefici"}</h2>
            </div>
            <Card className="border border-border/30 bg-gradient-to-br from-verde-primary/5 to-transparent">
              <CardContent className="p-8">
                <div 
                  className={proseClasses}
                  dangerouslySetInnerHTML={{ __html: product.benefits_content }}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Uses Section */}
      {product.uses_content && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Section Divider */}
            <div className="border-t border-border/30 mb-12" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-oro-primary/10">
                <ChefHat className="h-6 w-6 text-oro-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold text-primary">{product.uses_title || "Usi Culinari"}</h2>
            </div>
            <Card className="border border-border/30 bg-gradient-to-br from-oro-primary/5 to-transparent">
              <CardContent className="p-8">
                <div 
                  className={proseClasses}
                  dangerouslySetInnerHTML={{ __html: product.uses_content }}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {product.faq_items && product.faq_items.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Section Divider */}
            <div className="border-t border-border/30 mb-12" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-verde-primary/10">
                <HelpCircle className="h-6 w-6 text-verde-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold text-primary">Domande Frequenti</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {product.faq_items.map((faq, index) => (
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
        </section>
      )}
    </Layout>
  );
};

export default ProductPreview;