import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="section-padding bg-gradient-subtle min-h-[60vh] flex items-center">
        <div className="container-width">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="font-display text-8xl md:text-9xl font-bold text-primary mb-4">
                404
              </h1>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-4">
                Pagina Non Trovata
              </h2>
              <p className="font-body text-lg text-muted-foreground mb-8">
                Spiacenti, la pagina che stai cercando non esiste o è stata spostata. 
                Torna alla homepage per continuare a esplorare i nostri microgreens.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="oro" size="lg" asChild>
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" />
                  Torna alla Home
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-5 w-5" />
                Torna Indietro
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
