import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, User } from "lucide-react";

const Blog = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Hero Section */}
        <section className="relative py-20 px-6">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-serif">
                Blog di microgreens
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Esplora il mondo dei microgreens attraverso ricette originali, guide agli usi culinari, 
                approfondimenti sui benefici nutrizionali e consigli pratici per consumo e conservazione.
              </p>
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto">
            <Card className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-muted shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="mb-8">
                  <BookOpen className="w-16 h-16 mx-auto text-primary mb-4" />
                  <h2 className="text-3xl font-bold text-foreground mb-4 font-serif">
                    Articoli in arrivo
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Stiamo preparando contenuti esclusivi per condividere la nostra passione 
                    e conoscenza sui microgreens. Torna presto per scoprire ricette innovative, 
                    consigli degli chef e tutto quello che c'è da sapere su questi piccoli 
                    tesori nutrizionali.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  <div className="text-center">
                    <Clock className="w-8 h-8 mx-auto text-verde mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Guide Pratiche</h3>
                    <p className="text-sm text-muted-foreground">
                      Consigli per conservazione e utilizzo
                    </p>
                  </div>
                  <div className="text-center">
                    <User className="w-8 h-8 mx-auto text-oro mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Ricette Chef</h3>
                    <p className="text-sm text-muted-foreground">
                      Creazioni originali dai migliori chef
                    </p>
                  </div>
                  <div className="text-center">
                    <BookOpen className="w-8 h-8 mx-auto text-terra mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Approfondimenti</h3>
                    <p className="text-sm text-muted-foreground">
                      Benefici nutrizionali e proprietà
                    </p>
                  </div>
                </div>

                <Button variant="verde" size="lg" className="font-semibold">
                  Torna Presto per i Nostri Articoli
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Blog;