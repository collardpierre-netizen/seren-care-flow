import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Cookie } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const COOKIE_CONSENT_KEY = "serencare_cookie_consent";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const loadAnalytics = () => {
  if (document.querySelector('script[data-serencare-analytics="true"]')) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-EVZ781H036";
  script.dataset.serencareAnalytics = "true";
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: unknown[]) => window.dataLayer?.push(args);
  gtag("js", new Date());
  gtag("config", "G-EVZ781H036", { anonymize_ip: true });
};

const CookieSettings = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return;
    try {
      const saved = JSON.parse(stored) as CookiePreferences & { timestamp?: string };
      setPreferences({ essential: true, analytics: !!saved.analytics, marketing: !!saved.marketing });
      if (saved.timestamp) setSavedAt(saved.timestamp);
    } catch {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
    }
  }, []);

  const save = (prefs: CookiePreferences) => {
    const timestamp = new Date().toISOString();
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ ...prefs, timestamp }));
    setPreferences(prefs);
    setSavedAt(timestamp);
    if (prefs.analytics) loadAnalytics();
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 4000);
  };

  const formattedDate = savedAt
    ? new Date(savedAt).toLocaleDateString("fr-BE", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      <Helmet>
        <title>Gérer mes cookies | SerenCare</title>
        <meta
          name="description"
          content="Choisissez précisément les cookies que vous acceptez sur SerenCare : cookies essentiels, cookies de mesure d'audience et cookies marketing."
        />
        <link rel="canonical" href="https://www.serencare.be/cookies" />
      </Helmet>
      <Layout>
        <section className="section-padding bg-background">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  Gérer mes cookies
                </h1>
              </div>

              <p className="text-muted-foreground mb-8">
                Vous décidez ce que vous acceptez. Votre choix est enregistré sur cet appareil et
                reste modifiable à tout moment depuis cette page.
              </p>

              {formattedDate && (
                <p className="text-sm text-muted-foreground mb-8">
                  Dernier choix enregistré le {formattedDate}.
                </p>
              )}

              <div className="space-y-4">
                <div className="rounded-xl border border-border p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <Label className="font-display text-base font-semibold">
                        Cookies essentiels
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Toujours actifs. Ils permettent le fonctionnement du site : session de
                        connexion, sécurité, panier et mémorisation de votre choix de cookies.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ils ne servent jamais à vous suivre.
                      </p>
                    </div>
                    <Switch checked disabled aria-label="Cookies essentiels, toujours actifs" />
                  </div>
                </div>

                <div className="rounded-xl border border-border p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="analytics" className="font-display text-base font-semibold">
                        Mesure d'audience
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Google Analytics, avec adresse IP anonymisée. Nous voyons uniquement des
                        statistiques globales de visite, jamais votre identité.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Désactivé tant que vous ne l'acceptez pas.
                      </p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={preferences.analytics}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, analytics: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marketing" className="font-display text-base font-semibold">
                        Marketing
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Cookies publicitaires. Aucun cookie de ce type n'est déposé aujourd'hui sur
                        le site. Votre choix sera respecté si nous en utilisons un jour.
                      </p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={preferences.marketing}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, marketing: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button className="min-h-11 flex-1" onClick={() => save(preferences)}>
                  Enregistrer mes choix
                </Button>
                <Button
                  variant="outline"
                  className="min-h-11 flex-1"
                  onClick={() => save({ essential: true, analytics: true, marketing: true })}
                >
                  Tout accepter
                </Button>
                <Button
                  variant="outline"
                  className="min-h-11 flex-1"
                  onClick={() => save({ essential: true, analytics: false, marketing: false })}
                >
                  Tout refuser
                </Button>
              </div>

              {justSaved && (
                <p
                  role="status"
                  className="mt-4 flex items-center gap-2 text-sm text-primary"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Vos choix sont enregistrés.
                </p>
              )}

              <div className="mt-10 rounded-xl bg-muted/50 p-5 md:p-6 text-sm text-muted-foreground space-y-2">
                <p>
                  Si vous refusez la mesure d'audience, le script correspondant n'est pas chargé
                  tant que vous ne changez pas d'avis sur cette page.
                </p>
                <p>
                  Pour en savoir plus sur vos données, consultez notre{" "}
                  <Link to="/confidentialite" className="text-primary hover:underline">
                    politique de confidentialité
                  </Link>
                  .
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default CookieSettings;
