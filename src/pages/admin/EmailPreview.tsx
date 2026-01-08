import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, Mail, CheckCircle, Package, Truck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EmailPreview = () => {
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("welcome");
  const { toast } = useToast();

  // Sample data for previews
  const sampleData = {
    welcome: {
      firstName: "Marie",
    },
    order_confirmation: {
      firstName: "Marie",
      orderNumber: "SC-2026-001234",
      items: [
        { name: "TENA Pants Plus", size: "Medium", quantity: 2, unitPrice: 24.90 },
        { name: "TENA Bed Plus", size: null, quantity: 1, unitPrice: 18.50 },
      ],
      subtotal: 68.30,
      shippingFee: 0,
      discount: 5.00,
      total: 63.30,
      shippingAddress: {
        firstName: "Marie",
        lastName: "Dupont",
        address: "123 Rue de la Paix",
        postalCode: "1000",
        city: "Bruxelles",
        country: "Belgique",
      },
      estimatedDelivery: "Lundi 13 janvier 2026",
    },
    order_shipped: {
      firstName: "Marie",
      orderNumber: "SC-2026-001234",
      trackingNumber: "BE123456789",
      trackingUrl: "https://track.bpost.be/BE123456789",
      carrier: "bpost",
      estimatedDelivery: "Lundi 13 janvier 2026",
    },
    order_delivered: {
      firstName: "Marie",
      orderNumber: "SC-2026-001234",
    },
    subscription_created: {
      firstName: "Marie",
      nextDeliveryDate: "15 février 2026",
      frequency: "mensuelle",
    },
    team_order_notification: {
      orderNumber: "SC-2026-001234",
      customerEmail: "marie.dupont@example.com",
      total: 63.30,
      items: [
        { name: "TENA Pants Plus", size: "Medium", quantity: 2 },
        { name: "TENA Bed Plus", size: null, quantity: 1 },
      ],
      isSubscription: true,
    },
  };

  const templates = [
    { id: "welcome", name: "Bienvenue", icon: User, description: "Email de bienvenue après inscription" },
    { id: "order_confirmation", name: "Confirmation commande", icon: CheckCircle, description: "Confirmation après paiement" },
    { id: "order_shipped", name: "Colis expédié", icon: Truck, description: "Notification d'expédition" },
    { id: "order_delivered", name: "Colis livré", icon: Package, description: "Confirmation de livraison" },
    { id: "subscription_created", name: "Abonnement créé", icon: Mail, description: "Confirmation d'abonnement" },
    { id: "team_order_notification", name: "Notification équipe", icon: Mail, description: "Alerte interne nouvelle commande" },
  ];

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer une adresse email de test.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const templateData = sampleData[selectedTemplate as keyof typeof sampleData] || {};
      
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: testEmail,
          template: selectedTemplate,
          data: templateData,
        },
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: `L'email de test "${selectedTemplate}" a été envoyé à ${testEmail}.`,
      });
    } catch (error: unknown) {
      console.error("Error sending test email:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'envoyer l'email de test.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Prévisualisation des emails - Admin SerenCare</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Système d'emails SerenCare</h1>
              <p className="text-muted-foreground">Prévisualisez et testez les templates d'emails</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            {/* Sidebar - Template List */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Templates disponibles</CardTitle>
                  <CardDescription>Sélectionnez un template à prévisualiser</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                        selectedTemplate === template.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <template.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className={`text-xs ${selectedTemplate === template.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {template.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Test Email Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Envoyer un test</CardTitle>
                  <CardDescription>Testez le template sélectionné</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <Button
                    onClick={handleSendTest}
                    disabled={isSending || !testEmail}
                    className="w-full"
                  >
                    {isSending ? (
                      <>Envoi en cours...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer le test
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Prévisualisation</CardTitle>
                <CardDescription>
                  Aperçu du template "{templates.find(t => t.id === selectedTemplate)?.name}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="desktop">
                  <TabsList className="mb-4">
                    <TabsTrigger value="desktop">Desktop</TabsTrigger>
                    <TabsTrigger value="mobile">Mobile</TabsTrigger>
                    <TabsTrigger value="data">Données</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="desktop">
                    <div className="border rounded-lg overflow-hidden bg-muted/50">
                      <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">Email Preview</span>
                      </div>
                      <div className="p-4 bg-[#fafafa] min-h-[600px]">
                        <div className="max-w-[600px] mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
                          {/* Email Header */}
                          <div className="bg-[#1a5f4a] px-8 py-6 text-center">
                            <div className="text-white text-xl font-serif">SerenCare</div>
                            <div className="text-white/80 text-sm mt-1">
                              {selectedTemplate === "welcome" && "Bienvenue"}
                              {selectedTemplate === "order_confirmation" && "Commande confirmée"}
                              {selectedTemplate === "order_shipped" && "Colis expédié"}
                              {selectedTemplate === "order_delivered" && "Colis livré"}
                              {selectedTemplate === "subscription_created" && "Abonnement activé"}
                              {selectedTemplate === "team_order_notification" && "Nouvelle commande"}
                            </div>
                          </div>
                          
                          {/* Email Body Preview */}
                          <div className="p-8">
                            <p className="text-[#1a5f4a] text-xl font-serif mb-4">
                              {selectedTemplate === "welcome" && "Bienvenue, Marie"}
                              {selectedTemplate === "order_confirmation" && "Merci pour votre commande, Marie"}
                              {selectedTemplate === "order_shipped" && "Bonne nouvelle, Marie"}
                              {selectedTemplate === "order_delivered" && "Votre colis est arrivé, Marie"}
                              {selectedTemplate === "subscription_created" && "Merci, Marie"}
                              {selectedTemplate === "team_order_notification" && "Nouvelle commande reçue"}
                            </p>
                            <p className="text-gray-600 mb-4">
                              {selectedTemplate === "welcome" && "Nous sommes heureux de vous accueillir au sein de la famille SerenCare."}
                              {selectedTemplate === "order_confirmation" && "Nous avons bien reçu votre commande et nous la préparons avec le plus grand soin."}
                              {selectedTemplate === "order_shipped" && "Votre commande n° SC-2026-001234 est en route vers vous."}
                              {selectedTemplate === "order_delivered" && "Votre commande n° SC-2026-001234 a été livrée avec succès."}
                              {selectedTemplate === "subscription_created" && "Votre abonnement SerenCare est maintenant actif."}
                              {selectedTemplate === "team_order_notification" && "Commande n° SC-2026-001234 - 63,30 €"}
                            </p>
                            
                            {/* Sample CTA */}
                            <div className="text-center my-6">
                              <span className="inline-block bg-[#1a5f4a] text-white px-8 py-3 rounded-lg">
                                {selectedTemplate === "welcome" && "Découvrir nos produits"}
                                {selectedTemplate === "order_confirmation" && "Suivre ma commande"}
                                {selectedTemplate === "order_shipped" && "Suivre mon colis"}
                                {selectedTemplate === "order_delivered" && "Commander à nouveau"}
                                {selectedTemplate === "subscription_created" && "Gérer mon abonnement"}
                                {selectedTemplate === "team_order_notification" && "Voir dans l'admin"}
                              </span>
                            </div>
                          </div>
                          
                          {/* Email Footer */}
                          <div className="bg-[#fafafa] px-8 py-6 text-center border-t">
                            <p className="text-gray-500 text-sm">
                              Besoin d'aide ? contact@serencare.be | +32 2 123 45 67
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                              © 2026 SerenCare. Tous droits réservés.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mobile">
                    <div className="flex justify-center">
                      <div className="w-[375px] border rounded-[2rem] overflow-hidden bg-muted/50 shadow-xl">
                        <div className="bg-black h-8 flex items-center justify-center">
                          <div className="w-20 h-4 bg-black rounded-full" />
                        </div>
                        <div className="h-[667px] overflow-auto bg-[#fafafa]">
                          <div className="bg-white m-2 rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-[#1a5f4a] px-4 py-4 text-center">
                              <div className="text-white text-lg font-serif">SerenCare</div>
                            </div>
                            <div className="p-4">
                              <p className="text-[#1a5f4a] text-lg font-serif mb-3">
                                Bienvenue, Marie
                              </p>
                              <p className="text-gray-600 text-sm mb-4">
                                Nous sommes heureux de vous accueillir...
                              </p>
                              <div className="text-center">
                                <span className="inline-block bg-[#1a5f4a] text-white text-sm px-6 py-2.5 rounded-lg">
                                  Découvrir nos produits
                                </span>
                              </div>
                            </div>
                            <div className="bg-[#fafafa] px-4 py-4 text-center border-t">
                              <p className="text-gray-400 text-xs">
                                © 2026 SerenCare
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="data">
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-medium mb-2">Données du template</h4>
                      <pre className="text-sm overflow-auto bg-background p-4 rounded border">
                        {JSON.stringify(sampleData[selectedTemplate as keyof typeof sampleData] || {}, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailPreview;
