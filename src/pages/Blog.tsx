import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, User, ArrowRight, Calendar, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import varietiesImage from "@/assets/microgreens-varieties.jpg";
import heroImage from "@/assets/hero-microgreens.jpg";

const Blog = () => {
  const featuredArticles = [
    {
      id: "valori-nutrizionali-microgreens",
      title: "I Valori Nutrizionali Straordinari dei Microgreens",
      excerpt: "Scopri perché questi piccoli germogli contengono fino a 40 volte più nutrienti delle verdure mature e come possono rivoluzionare la tua alimentazione.",
      category: "Nutrizione",
      date: "15 Marzo 2024",
      readTime: "5 min",
      image: varietiesImage,
      featured: true
    },
    {
      id: "ricette-chef-microgreens",
      title: "Ricette Gourmet con Microgreens",
      excerpt: "Le creazioni degli chef stellati che utilizzano i nostri microgreens per piatti unici e memorabili.",
      category: "Ricette",
      date: "10 Marzo 2024",
      readTime: "7 min",
      image: heroImage,
      featured: false
    },
    {
      id: "conservazione-microgreens",
      title: "Come Conservare i Microgreens al Meglio",
      excerpt: "Consigli pratici per mantenere freschezza e proprietà nutritive dei tuoi microgreens più a lungo.",
      category: "Guide",
      date: "5 Marzo 2024",
      readTime: "4 min",
      image: varietiesImage,
      featured: false
    }
  ];

  const categories = [
    { name: "Nutrizione", count: 8, color: "verde" },
    { name: "Ricette", count: 12, color: "oro" },
    { name: "Guide", count: 6, color: "terra" },
    { name: "Sostenibilità", count: 4, color: "verde" }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-block bg-oro-primary text-accent-foreground px-4 py-2 rounded-full text-sm font-body font-medium mb-6 animate-fade-in">
                Il Mondo dei Microgreens
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
                Blog di <span className="text-primary">Microgreens</span>
              </h1>
              <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto animate-fade-in">
                Esplora il mondo dei microgreens attraverso ricette originali, guide agli usi culinari, 
                approfondimenti sui benefici nutrizionali e consigli pratici per consumo e conservazione.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="section-padding bg-background">
          <div className="container-width">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
              Esplora per Categoria
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {categories.map((category, index) => (
                <Card key={index} className="hover-lift cursor-pointer border-border/50 bg-card">
                  <CardContent className="p-4 text-center">
                    <Tag className={`w-8 h-8 mx-auto mb-2 ${
                      category.color === 'verde' ? 'text-primary' :
                      category.color === 'oro' ? 'text-accent' : 'text-muted-foreground'
                    }`} />
                    <h3 className="font-body font-semibold text-foreground mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.count} articoli
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article */}
        <section className="section-padding bg-gradient-subtle">
          <div className="container-width">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
              Articolo in Evidenza
            </h2>
            <Card className="overflow-hidden hover-lift border-border/50 bg-card max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-0">
                <div 
                  className="h-64 md:h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${featuredArticles[0].image})` }}
                />
                <CardContent className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="outline" className="text-xs">
                      {featuredArticles[0].category}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featuredArticles[0].date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredArticles[0].readTime}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                    {featuredArticles[0].title}
                  </h3>
                  <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                    {featuredArticles[0].excerpt}
                  </p>
                  <Button variant="verde" className="inline-flex items-center w-fit" asChild>
                    <Link to={`/blog/${featuredArticles[0].id}`}>
                      Leggi l'articolo
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>

        {/* Latest Articles */}
        <section className="section-padding bg-background">
          <div className="container-width">
            <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
              Ultimi Articoli
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.slice(1).map((article, index) => (
                <Card key={index} className="overflow-hidden hover-lift border-border/50 bg-card">
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${article.image})` }}
                  />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </div>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="font-body text-muted-foreground text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {article.date}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/blog/${article.id}`}>
                          Leggi
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="section-padding bg-gradient-verde text-white">
          <div className="container-width text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-display text-3xl font-bold mb-4">
                Non Perdere Nessun Articolo
              </h2>
              <p className="font-body mb-8 text-white/90">
                Iscriviti alla nostra newsletter per ricevere le ultime novità, 
                ricette esclusive e consigli pratici direttamente nella tua inbox.
              </p>
              <Button variant="oro" size="lg" className="font-semibold">
                Iscriviti alla Newsletter
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Blog;