import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { ShoppingCart, Leaf, Star, Filter, Heart, Zap, Shield } from "lucide-react";
import varietiesImage from "@/assets/microgreens-varieties.jpg";
import chefImage from "@/assets/chef-microgreens.jpg";
const Microgreens = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Brassicaceae", "Legumi", "Erbe Aromatiche", "Cereali", "Amarantaceae"];
  const products = [{
    name: "Rucola",
    category: "Brassicaceae",
    description: "Sapore piccante e intenso, perfetta per insalate gourmet",
    benefits: ["Ricca di vitamina K", "Antiossidanti naturali", "Sapore deciso"],
    uses: ["Insalate", "Pizza", "Carpacci"],
    image: varietiesImage,
    rating: 4.9,
    popular: true
  }, {
    name: "Basilico",
    category: "Erbe Aromatiche",
    description: "Aroma mediterraneo concentrato, essenza della cucina italiana",
    benefits: ["Oli essenziali", "Proprietà digestive", "Aroma intenso"],
    uses: ["Pasta", "Bruschette", "Caprese"],
    image: chefImage,
    rating: 4.8,
    popular: true
  }, {
    name: "Ravanello",
    category: "Brassicaceae",
    description: "Croccante e leggermente piccante, aggiunge carattere ai piatti",
    benefits: ["Vitamina C", "Fibre", "Minerali"],
    uses: ["Sushi", "Tartare", "Antipasti"],
    image: varietiesImage,
    rating: 4.7,
    popular: false
  }, {
    name: "Pisello",
    category: "Legumi",
    description: "Dolce e delicato, ricco di proteine vegetali",
    benefits: ["Proteine", "Vitamine del gruppo B", "Ferro"],
    uses: ["Zuppe", "Risotti", "Contorni"],
    image: chefImage,
    rating: 4.6,
    popular: false
  }, {
    name: "Prezzemolo",
    category: "Erbe Aromatiche",
    description: "Fresco e aromatico, indispensabile in cucina",
    benefits: ["Vitamina A", "Ferro", "Calcio"],
    uses: ["Condimenti", "Salse", "Decorazioni"],
    image: varietiesImage,
    rating: 4.5,
    popular: false
  }, {
    name: "Girasole",
    category: "Amarantaceae",
    description: "Croccante e nutriente, dal sapore leggermente nocciolato",
    benefits: ["Vitamina E", "Magnesio", "Selenio"],
    uses: ["Insalate", "Bowls", "Smoothies"],
    image: chefImage,
    rating: 4.4,
    popular: false
  }];
  const filteredProducts = selectedCategory === "All" ? products : products.filter(product => product.category === selectedCategory);
  return <Layout>
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
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Filter className="h-5 w-5 text-muted-foreground mr-2 mt-2" />
            {categories.map(category => <Button key={category} variant={selectedCategory === category ? "verde" : "outline"} size="sm" onClick={() => setSelectedCategory(category)} className="mb-2">
                {category}
              </Button>)}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <Card 
                key={index} 
                className="product-card overflow-hidden border-border/50 relative cursor-pointer group"
                onClick={() => console.log('Navigate to product:', product.name)}
              >
                {/* Product Image */}
                <div className="h-48 bg-cover bg-center relative" style={{
                  backgroundImage: `url(${product.image})`
                }}>
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
                  
                  {/* Category badge - top-left, semi-transparent white */}
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-white/90 text-gray-700 border-0 backdrop-blur-sm text-xs font-medium">
                      {product.category}
                    </Badge>
                  </div>
                  
                  {/* Popular badge - outline style with gold */}
                  {product.popular && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="outline" className="border-oro-primary text-oro-primary bg-white/90 backdrop-blur-sm">
                        <Star className="h-3 w-3 mr-1" />
                        Popolare
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Product name - larger and bolder */}
                  <h3 className="font-display text-2xl font-bold text-primary mb-3 leading-tight">
                    {product.name}
                  </h3>
                  
                  {/* Description - limited to 2 lines with ellipsis */}
                  <p className="font-body text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Benefits - horizontal pills with icons, max 3 */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {product.benefits.slice(0, 3).map((benefit, i) => {
                        const icons = [Heart, Zap, Shield];
                        const IconComponent = icons[i % icons.length];
                        return (
                          <Badge key={i} variant="secondary" className="bg-verde-primary/10 text-verde-primary border-verde-primary/20 text-xs px-3 py-1">
                            <IconComponent className="h-3 w-3 mr-1" />
                            {benefit}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Uses - small outlined tags in single row, max 3 */}
                  <div className="mb-6 flex-grow">
                    <div className="flex flex-wrap gap-1">
                      {product.uses.slice(0, 3).map((use, i) => (
                        <Badge key={i} variant="outline" className="text-xs px-2 py-0.5 border-muted-foreground/30 text-muted-foreground">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* CTA Button - gold outline, positioned at bottom */}
                  <Button 
                    variant="outline" 
                    className="cta-button w-full border-oro-primary text-oro-primary hover:bg-oro-primary hover:text-white px-4 py-2 transition-all duration-300 mt-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Add to cart:', product.name);
                    }}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    Aggiungi al Carrello
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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