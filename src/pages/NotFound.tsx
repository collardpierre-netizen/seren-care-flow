import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="section-padding min-h-[60vh] flex items-center">
        <div className="container-main">
          <div className="max-w-md mx-auto text-center">
            <div className="text-8xl font-display font-bold text-primary/20 mb-4">404</div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Page non trouvée
            </h1>
            <p className="text-muted-foreground mb-8">
              Cette page n'existe pas ou a été déplacée.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild>
                <Link to="/" className="gap-2">
                  <Home className="w-4 h-4" />
                  Retour à l'accueil
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Page précédente
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
