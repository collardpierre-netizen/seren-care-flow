import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Politique de Confidentialité | SerenCare</title>
        <meta name="description" content="Politique de confidentialité et protection des données de SerenCare - Conformité RGPD." />
      </Helmet>
      <Layout>
        <section className="section-padding bg-background">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Politique de Confidentialité & Protection des Données (RGPD)
              </h1>

              <p className="text-muted-foreground mb-2">Version 2025 – SerenCare</p>
              <p className="text-muted-foreground mb-8">Pharmacie Allard – Noralphar – APB 212033</p>

              <div className="space-y-10 text-foreground">
                {/* 1. Responsable du traitement */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    1. Responsable du traitement
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Le traitement des données personnelles est effectué par :
                  </p>
                  <div className="bg-muted/50 rounded-xl p-6 space-y-2 text-sm">
                    <p className="font-semibold">Pharmacie Allard – Noralphar</p>
                    <p>Titulaire : Sonia Bourahli</p>
                    <p>APB : 212033</p>
                    <p>Adresse : Avenue Georges Lecointe 50, 1180 Uccle – Belgique</p>
                    <p>TVA : BE 0684.671.728</p>
                    <p>Téléphone : <a href="tel:+3202216492" className="text-primary hover:underline">+32 02 216 49 23</a></p>
                    <p>Email : <a href="mailto:ohall@noralphar.com" className="text-primary hover:underline">ohall@noralphar.com</a></p>
                  </div>
                </section>

                {/* 2. Finalité du traitement */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    2. Finalité du traitement
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    SerenCare est une boutique en ligne destinée aux particuliers. Les données personnelles collectées sont traitées pour :
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Gestion des comptes clients</h3>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Création et gestion du compte</li>
                        <li>Authentification et sécurité</li>
                        <li>Gestion des préférences</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground">Exécution des commandes</h3>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Traitement des achats</li>
                        <li>Livraison</li>
                        <li>Facturation</li>
                        <li>Gestion des abonnements</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground">Relation client</h3>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Emails transactionnels</li>
                        <li>Service client et assistance</li>
                        <li>Suivi des réclamations</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground">Amélioration du service</h3>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Statistiques anonymisées</li>
                        <li>Analyse de l'utilisation du site</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 3. Données collectées */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    3. Données collectées
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Nous collectons les données suivantes :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><span className="font-medium text-foreground">Données d'identification :</span> nom, prénom, email, téléphone</li>
                    <li><span className="font-medium text-foreground">Données de livraison :</span> adresse postale</li>
                    <li><span className="font-medium text-foreground">Données de paiement :</span> informations de carte bancaire (traitées par notre prestataire de paiement sécurisé Stripe)</li>
                    <li><span className="font-medium text-foreground">Données de navigation :</span> adresse IP, cookies, pages visitées</li>
                    <li><span className="font-medium text-foreground">Données de commande :</span> historique des achats, préférences de produits</li>
                  </ul>
                </section>

                {/* 4. Base légale */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    4. Base légale du traitement
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Le traitement de vos données est fondé sur :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><span className="font-medium text-foreground">L'exécution du contrat :</span> pour traiter vos commandes et livraisons</li>
                    <li><span className="font-medium text-foreground">Le consentement :</span> pour les cookies non essentiels et les communications marketing</li>
                    <li><span className="font-medium text-foreground">L'intérêt légitime :</span> pour améliorer nos services et prévenir la fraude</li>
                    <li><span className="font-medium text-foreground">L'obligation légale :</span> pour la facturation et les obligations comptables</li>
                  </ul>
                </section>

                {/* 5. Destinataires */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    5. Destinataires des données
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Vos données peuvent être transmises à :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Notre équipe interne (service client, logistique)</li>
                    <li>Nos prestataires de livraison (Bpost, DHL)</li>
                    <li>Notre prestataire de paiement (Stripe)</li>
                    <li>Notre hébergeur (Lovable Cloud / Supabase – UE)</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    <span className="font-medium text-foreground">Aucune vente de données :</span> vos données personnelles 
                    ne sont jamais vendues à des tiers.
                  </p>
                </section>

                {/* 6. Durée de conservation */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    6. Durée de conservation
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><span className="font-medium text-foreground">Données de compte :</span> durée de la relation commerciale + 3 ans</li>
                    <li><span className="font-medium text-foreground">Données de commande :</span> 10 ans (obligations comptables)</li>
                    <li><span className="font-medium text-foreground">Données de navigation :</span> 13 mois maximum</li>
                    <li><span className="font-medium text-foreground">Cookies :</span> selon vos préférences (max 13 mois)</li>
                  </ul>
                </section>

                {/* 7. Vos droits */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    7. Vos droits
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Conformément au RGPD, vous disposez des droits suivants :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><span className="font-medium text-foreground">Droit d'accès :</span> obtenir une copie de vos données</li>
                    <li><span className="font-medium text-foreground">Droit de rectification :</span> corriger vos données inexactes</li>
                    <li><span className="font-medium text-foreground">Droit à l'effacement :</span> demander la suppression de vos données</li>
                    <li><span className="font-medium text-foreground">Droit à la portabilité :</span> récupérer vos données dans un format structuré</li>
                    <li><span className="font-medium text-foreground">Droit d'opposition :</span> vous opposer au traitement de vos données</li>
                    <li><span className="font-medium text-foreground">Droit à la limitation :</span> limiter le traitement de vos données</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Pour exercer ces droits, contactez-nous à{" "}
                    <a href="mailto:ohall@noralphar.com" className="text-primary hover:underline">ohall@noralphar.com</a>.
                  </p>
                </section>

                {/* 8. Sécurité */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    8. Sécurité des données
                  </h2>
                  <p className="text-muted-foreground">
                    Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger 
                    vos données contre la perte, l'accès non autorisé, la modification ou la divulgation :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                    <li>Chiffrement SSL/TLS pour toutes les communications</li>
                    <li>Authentification sécurisée des utilisateurs</li>
                    <li>Accès restreint aux données sensibles</li>
                    <li>Hébergement conforme RGPD dans l'Union Européenne</li>
                  </ul>
                </section>

                {/* 9. Cookies */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    9. Politique de cookies
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Notre site utilise des cookies pour :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><span className="font-medium text-foreground">Cookies essentiels :</span> fonctionnement du site, panier, session</li>
                    <li><span className="font-medium text-foreground">Cookies analytiques :</span> statistiques anonymes de visite</li>
                    <li><span className="font-medium text-foreground">Cookies marketing :</span> personnalisation des publicités (avec votre consentement)</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Vous pouvez gérer vos préférences de cookies à tout moment via la bannière de consentement 
                    ou les paramètres de votre navigateur.
                  </p>
                </section>

                {/* 10. Transferts internationaux */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    10. Transferts internationaux
                  </h2>
                  <p className="text-muted-foreground">
                    Vos données sont principalement traitées au sein de l'Union Européenne. En cas de transfert 
                    vers un pays tiers, nous nous assurons que des garanties appropriées sont en place 
                    (clauses contractuelles types, décision d'adéquation).
                  </p>
                </section>

                {/* 11. Réclamations */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    11. Réclamations
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Si vous estimez que le traitement de vos données ne respecte pas la réglementation, 
                    vous pouvez introduire une réclamation auprès de l'Autorité de protection des données :
                  </p>
                  <div className="bg-muted/50 rounded-xl p-6 text-sm">
                    <p className="font-semibold">Autorité de protection des données (APD)</p>
                    <p className="text-muted-foreground mt-2">Rue de la Presse 35, 1000 Bruxelles</p>
                    <p className="mt-2">
                      <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        www.autoriteprotectiondonnees.be
                      </a>
                    </p>
                  </div>
                </section>

                {/* 12. Modifications */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    12. Modifications
                  </h2>
                  <p className="text-muted-foreground">
                    Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
                    En cas de modification substantielle, nous vous en informerons par email ou via une notification sur le site.
                  </p>
                </section>

                {/* 13. Contact */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    13. Contact
                  </h2>
                  <p className="text-muted-foreground">
                    Pour toute question relative à cette politique ou à vos données personnelles :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                    <li>Email : <a href="mailto:ohall@noralphar.com" className="text-primary hover:underline">ohall@noralphar.com</a></li>
                    <li>Téléphone : <a href="tel:+3202216492" className="text-primary hover:underline">+32 02 216 49 23</a> (Du lundi au vendredi de 09h à 15h)</li>
                    <li>Courrier : Pharmacie Allard, Avenue Georges Lecointe 50, 1180 Uccle, Belgique</li>
                  </ul>
                </section>

                <p className="text-sm text-muted-foreground/70 pt-8 border-t border-border">
                  Dernière mise à jour : Janvier 2025
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default PrivacyPolicy;
