import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import { ShoppingCart, Minus, Plus, Heart, Zap, Shield, Star, Leaf, Droplet, Sun } from "lucide-react";
import { Helmet } from "react-helmet";

// Microgreens data
const microgreensData = {
  "ravanello-rosso": {
    name: "Ravanello Rosso",
    category: "Brassicaceae",
    shortDescription: "Sapore piccante e croccante, perfetto per dare carattere ai tuoi piatti con un tocco vivace e colorato.",
    fullDescription: "I microgreens di ravanello rosso sono tra i più apprezzati per il loro sapore deciso e la loro versatilità in cucina. Coltivati con semi biologici certificati nella nostra sede di Reggio Emilia, questi giovani germogli vengono raccolti al momento ottimale di maturazione per garantire il massimo delle proprietà nutritive e del sapore.",
    image: "/src/assets/microgreens-varieties.jpg",
    benefits: ["Ricco di vitamina C", "Antiossidante naturale", "Supporto immunitario"],
    detailedBenefits: [{
      icon: Heart,
      title: "Salute cardiovascolare",
      description: "Ricco di antiossidanti che supportano la salute del cuore"
    }, {
      icon: Zap,
      title: "Energia naturale",
      description: "Alto contenuto di vitamine del gruppo B per energia costante"
    }, {
      icon: Shield,
      title: "Sistema immunitario",
      description: "Vitamina C e composti solforati rafforzano le difese"
    }, {
      icon: Leaf,
      title: "Detox naturale",
      description: "Proprietà depurative per il fegato e l'organismo"
    }],
    uses: ["Insalate fresche", "Toast e bruschette", "Piatti orientali"],
    culinaryUses: "Ideale per insalate fresche dove il suo sapore piccante emerge perfettamente. Ottimo su toast con avocado, in panini gourmet, o come guarnizione per piatti di pesce crudo. In cucina orientale, si abbina perfettamente a sushi, poke bowl e ramen.",
    popular: true,
    rating: 4.8,
    inStock: true
  },
  "pisello": {
    name: "Pisello",
    category: "Fabaceae",
    shortDescription: "Dolce e delicato, con un sapore fresco di pisello appena colto. Perfetto per piatti leggeri e raffinati.",
    fullDescription: "I microgreens di pisello offrono un sapore delicato e dolce che ricorda i piselli freschi di primavera. Questi germogli sono particolarmente apprezzati per la loro texture croccante e il colore verde brillante che illumina qualsiasi piatto.",
    image: "/src/assets/microgreens-close-up.jpg",
    benefits: ["Alto contenuto proteico", "Ricco di fibre", "Vitamine A e C"],
    detailedBenefits: [{
      icon: Zap,
      title: "Proteine vegetali",
      description: "Eccellente fonte di proteine per diete plant-based"
    }, {
      icon: Heart,
      title: "Salute digestiva",
      description: "Alto contenuto di fibre per il benessere intestinale"
    }, {
      icon: Shield,
      title: "Vitamine essenziali",
      description: "Ricco di vitamine A, C e K per il benessere generale"
    }, {
      icon: Leaf,
      title: "Antiossidanti",
      description: "Polifenoli e flavonoidi per contrastare i radicali liberi"
    }],
    uses: ["Risotti cremosi", "Pasta fresca", "Insalate delicate"],
    culinaryUses: "Perfetto per risotti primaverili, pasta con ricotta e limone, o come base per insalate delicate. Si sposa bene con formaggi freschi, pesce bianco e piatti a base di uova come frittate e omelette.",
    popular: false,
    rating: 4.6,
    inStock: true
  },
  "basilico": {
    name: "Basilico",
    category: "Erbe Aromatiche",
    shortDescription: "Aroma intenso e profumato, concentra tutto il sapore del basilico in foglie giovani e tenere.",
    fullDescription: "I microgreens di basilico offrono un'intensità aromatica superiore al basilico maturo, con un profumo più concentrato e un sapore più delicato. Ideali per chi vuole portare l'eccellenza della cucina italiana nel piatto.",
    image: "/src/assets/hero-microgreens.jpg",
    benefits: ["Proprietà antibatteriche", "Anti-infiammatorio", "Ricco di vitamina K"],
    detailedBenefits: [{
      icon: Shield,
      title: "Antibatterico naturale",
      description: "Oli essenziali con proprietà antimicrobiche"
    }, {
      icon: Heart,
      title: "Anti-infiammatorio",
      description: "Composti che riducono l'infiammazione"
    }, {
      icon: Zap,
      title: "Vitamina K",
      description: "Essenziale per la coagulazione e la salute delle ossa"
    }, {
      icon: Leaf,
      title: "Digestione",
      description: "Favorisce la digestione e riduce il gonfiore"
    }],
    uses: ["Caprese gourmet", "Pasta al pomodoro", "Pizza napoletana"],
    culinaryUses: "Ideale per insalate caprese, bruschette, pasta al pomodoro fresco e pizza. Ottimo anche in pesto fresco, su carpacci di pesce, o come guarnizione finale per zuppe e minestre.",
    popular: true,
    rating: 4.9,
    inStock: true
  }
};
const ProductDetail = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(100);
  const product = id ? microgreensData[id as keyof typeof microgreensData] : null;
  if (!product) {
    return <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Prodotto non trovato</h1>
          <Button onClick={() => navigate("/microgreens")}>Torna ai prodotti</Button>
        </div>
      </Layout>;
  }
  const relatedProducts = Object.entries(microgreensData).filter(([key]) => key !== id).slice(0, 3).map(([key, data]) => ({
    id: key,
    ...data
  }));
  const handleAddToCart = () => {
    console.log(`Added ${quantity} ${product.name} to cart`);
  };
  const incrementQuantity = () => setQuantity(q => q + 100);
  const decrementQuantity = () => setQuantity(q => Math.max(100, q - 100));
  return <Layout>
      <Helmet>
        <title>{product.name} - Verde D'Oro Microgreens</title>
        <meta name="description" content={product.shortDescription} />
        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.name,
          "description": product.fullDescription,
          "image": product.image,
          "brand": {
            "@type": "Brand",
            "name": "Verde D'Oro"
          },
          "aggregateRating": product.rating ? {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "bestRating": "5",
            "worstRating": "1"
          } : undefined,
          "offers": {
            "@type": "Offer",
            "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "priceCurrency": "EUR"
          }
        })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Product Image */}
            <div className="relative rounded-lg overflow-hidden shadow-lg aspect-square">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="eager" />
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-verde-primary/10 text-verde-primary border-verde-primary/20">
                  {product.category}
                </Badge>
                {product.popular && <Badge variant="outline" className="border-oro-primary text-oro-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Popolare
                  </Badge>}
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
                {product.name}
              </h1>

              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                {product.shortDescription}
              </p>
            </div>
          </div>

          {/* Purchase Section - Centered and Compact */}
          <div className="flex justify-center">
            <Card className="w-full md:w-auto md:min-w-[500px] border border-border/50 bg-muted/30">
              <CardContent className="p-5">
                {/* Quantity Label */}
                <div className="mb-4">
                  <label className="font-display font-medium text-primary text-base mb-2 block">
                    Quantità
                  </label>
                  
                  {/* Quick Preset Pills */}
                  <div className="flex gap-2 mb-3">
                    {[100, 200, 300, 500].map((preset) => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(preset)}
                        className={`h-7 px-3 text-xs transition-all duration-200 ${
                          quantity === preset
                            ? 'bg-verde-primary text-white border-verde-primary hover:bg-verde-primary/90'
                            : 'hover:border-verde-primary/50'
                        }`}
                      >
                        {preset} gr
                      </Button>
                    ))}
                  </div>

                  {/* Main Selector */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={decrementQuantity} 
                      disabled={quantity <= 100} 
                      className="h-9 w-9 rounded-full border disabled:opacity-30 hover:bg-verde-primary hover:text-white hover:border-verde-primary transition-all duration-200"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="relative">
                      <input 
                        type="number" 
                        value={quantity} 
                        onChange={e => {
                          const value = parseInt(e.target.value) || 100;
                          const rounded = Math.max(100, Math.round(value / 100) * 100);
                          setQuantity(rounded);
                        }} 
                        onFocus={e => e.target.select()} 
                        className="w-24 text-center text-lg font-semibold border border-border rounded-lg h-9 bg-background focus:outline-none focus:border-verde-primary focus:ring-1 focus:ring-verde-primary/20 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        min="100" 
                        step="100" 
                        inputMode="numeric" 
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium pointer-events-none">
                        gr
                      </span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={incrementQuantity} 
                      className="h-9 w-9 rounded-full border hover:bg-verde-primary hover:text-white hover:border-verde-primary transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Minimum Order Notice */}
                  <p className="text-[11px] text-muted-foreground text-center">
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
                  {product.inStock ? <Badge variant="secondary" className="bg-verde-primary/10 text-verde-primary text-xs">
                      ✓ Disponibile
                    </Badge> : <Badge variant="destructive" className="text-xs">
                      Non disponibile
                    </Badge>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Overview Section */}
      <section className="container mx-auto px-4 py-12">
        {/* Title and Description */}
        <div className="mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
            Panoramica del prodotto
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-4xl">
            {product.fullDescription}
          </p>
        </div>

        {/* Two Column Layout: Benefits and Culinary Uses */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Benefits Column */}
          <div>
            <h3 className="font-display text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <Leaf className="h-6 w-6 text-verde-primary" />
              Benefici
            </h3>
            <div className="space-y-4">
              {product.benefits.map((benefit, index) => <div key={index} className="flex items-start gap-3 p-4 border-l-4 border-verde-primary bg-verde-primary/5 rounded-r-lg">
                  <Leaf className="h-5 w-5 text-verde-primary mt-0.5 flex-shrink-0" />
                  <p className="text-foreground">{benefit}</p>
                </div>)}
            </div>
          </div>

          {/* Culinary Uses Column */}
          <div>
            <h3 className="font-display text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-verde-primary" />
              Usi Culinari
            </h3>
            <div className="p-6 bg-muted rounded-lg">
              <p className="text-foreground leading-relaxed">
                {product.culinaryUses}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="container mx-auto px-4 py-16 bg-gradient-subtle">
        <h2 className="font-display text-3xl font-bold text-center mb-12">
          Altri prodotti che ti potrebbero interessare
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {relatedProducts.map(relatedProduct => <ProductCard key={relatedProduct.id} name={relatedProduct.name} category={relatedProduct.category} description={relatedProduct.shortDescription} benefits={relatedProduct.benefits} uses={relatedProduct.uses} image={relatedProduct.image} rating={relatedProduct.rating} popular={relatedProduct.popular} onCardClick={() => navigate(`/prodotto/${relatedProduct.id}`)} onAddToCart={() => console.log(`Added ${relatedProduct.name} to cart`)} />)}
        </div>
      </section>
    </Layout>;
};
export default ProductDetail;