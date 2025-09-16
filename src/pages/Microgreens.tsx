import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { ShoppingCart, Leaf, Star, Filter } from "lucide-react";
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
            {filteredProducts.map((product, index) => <Card key={index} className="overflow-hidden hover-lift border-border/50 relative">
                {product.popular && <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-oro-primary text-accent-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Popolare
                    </Badge>
                  </div>}
                
                <div className="h-48 bg-cover bg-center relative" style={{
              backgroundImage: `url(${product.image})`
            }}>
                  <div className="absolute inset-0 bg-gradient-hero/20" />
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary" className="bg-background/90">
                      {product.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-xl font-semibold text-primary">
                      {product.name}
                    </h3>
                    
                  </div>
                  
                  <p className="font-body text-muted-foreground mb-4">
                    {product.description}
                  </p>
                  
                  {/* Benefits */}
                  <div className="mb-4">
                    <h4 className="font-body font-medium text-foreground text-sm mb-2">
                      Benefici:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {product.benefits.map((benefit, i) => <Badge key={i} variant="outline" className="text-xs">
                          {benefit}
                        </Badge>)}
                    </div>
                  </div>
                  
                  {/* Uses */}
                  <div className="mb-6">
                    <h4 className="font-body font-medium text-foreground text-sm mb-2">
                      Ideale per:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {product.uses.map((use, i) => <Badge key={i} variant="secondary" className="text-xs">
                          {use}
                        </Badge>)}
                    </div>
                  </div>
                  
                  <Button variant="verde" className="w-full">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Aggiungi al Carrello
                  </Button>
                </CardContent>
              </Card>)}
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