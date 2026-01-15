import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie } from "lucide-react";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = "serencare_cookie_consent";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay showing the banner for a better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...prefs,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    saveConsent({ essential: true, analytics: true, marketing: true });
  };

  const rejectAll = () => {
    saveConsent({ essential: true, analytics: false, marketing: false });
  };

  const saveCustom = () => {
    saveConsent(preferences);
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:left-6 md:right-6 md:bottom-6"
          >
            <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl shadow-2xl p-4 md:p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    Nous utilisons des cookies
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    SerenCare utilise des cookies pour garantir le bon fonctionnement du site, 
                    mémoriser vos préférences et analyser notre trafic de manière anonyme. 
                    Vous pouvez personnaliser vos choix à tout moment.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" onClick={rejectAll}>
                      Tout refuser
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                      Personnaliser
                    </Button>
                    <Button size="sm" onClick={acceptAll}>
                      Tout accepter
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Paramètres des cookies</DialogTitle>
            <DialogDescription>
              Gérez vos préférences de cookies. Les cookies essentiels sont nécessaires 
              au bon fonctionnement du site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Essential Cookies */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="font-medium">Cookies essentiels</Label>
                <p className="text-sm text-muted-foreground">
                  Nécessaires au fonctionnement du site (session, sécurité, panier).
                </p>
              </div>
              <Switch checked disabled />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="font-medium">Cookies analytiques</Label>
                <p className="text-sm text-muted-foreground">
                  Nous aident à comprendre comment vous utilisez le site (anonyme).
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, analytics: checked }))
                }
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="font-medium">Cookies marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Permettent d'afficher des publicités pertinentes.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, marketing: checked }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={rejectAll}>
              Tout refuser
            </Button>
            <Button onClick={saveCustom}>
              Enregistrer mes choix
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
