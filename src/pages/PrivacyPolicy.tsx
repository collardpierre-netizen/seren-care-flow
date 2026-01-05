import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Politique de confidentialité | SerenCare</title>
        <meta name="description" content="Politique de confidentialité du site SerenCare - Pharmacie Allard. Informations sur la collecte, le traitement et la protection de vos données personnelles." />
      </Helmet>
      <Layout>
        <section className="py-16 md:py-24">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
                Politique de confidentialité
              </h1>

              <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    1. Introduction
                  </h2>
                  <p>
                    La Pharmacie Allard, exerçant sous la marque SerenCare, s'engage à protéger la vie privée des utilisateurs de son site internet. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    2. Responsable du traitement
                  </h2>
                  <ul className="list-none space-y-1">
                    <li><strong className="text-foreground">Raison sociale :</strong> Pharmacie Allard SPRL</li>
                    <li><strong className="text-foreground">Adresse :</strong> Avenue de l'Hippodrome 148, 1050 Ixelles, Belgique</li>
                    <li><strong className="text-foreground">Email :</strong> contact@pharmacie-allard.be</li>
                    <li><strong className="text-foreground">Téléphone :</strong> +32 02 648 42 22</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    3. Données collectées
                  </h2>
                  <p>Nous collectons les données suivantes :</p>
                  <ul className="list-disc pl-6 mt-4 space-y-2">
                    <li><strong className="text-foreground">Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
                    <li><strong className="text-foreground">Données de livraison :</strong> adresse postale</li>
                    <li><strong className="text-foreground">Données de commande :</strong> historique des achats, préférences produits</li>
                    <li><strong className="text-foreground">Données de navigation :</strong> adresse IP, cookies, pages visitées</li>
                    <li><strong className="text-foreground">Données de santé :</strong> informations relatives à vos besoins en matière d'incontinence (collectées avec votre consentement explicite)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    4. Finalités du traitement
                  </h2>
                  <p>Vos données sont utilisées pour :</p>
                  <ul className="list-disc pl-6 mt-4 space-y-2">
                    <li>Traiter et livrer vos commandes</li>
                    <li>Gérer votre compte client et vos abonnements</li>
                    <li>Vous fournir des recommandations personnalisées</li>
                    <li>Répondre à vos demandes de contact</li>
                    <li>Vous envoyer des communications marketing (avec votre consentement)</li>
                    <li>Améliorer nos services et notre site web</li>
                    <li>Respecter nos obligations légales</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    5. Base légale du traitement
                  </h2>
                  <p>Le traitement de vos données repose sur :</p>
                  <ul className="list-disc pl-6 mt-4 space-y-2">
                    <li><strong className="text-foreground">L'exécution du contrat :</strong> pour traiter vos commandes</li>
                    <li><strong className="text-foreground">Votre consentement :</strong> pour les données de santé et les communications marketing</li>
                    <li><strong className="text-foreground">L'intérêt légitime :</strong> pour améliorer nos services</li>
                    <li><strong className="text-foreground">L'obligation légale :</strong> pour la facturation et la comptabilité</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    6. Destinataires des données
                  </h2>
                  <p>Vos données peuvent être partagées avec :</p>
                  <ul className="list-disc pl-6 mt-4 space-y-2">
                    <li>Nos prestataires de livraison (pour l'expédition des colis)</li>
                    <li>Notre prestataire de paiement (Stripe) pour sécuriser les transactions</li>
                    <li>Nos outils d'analyse (de manière anonymisée)</li>
                    <li>Les autorités compétentes si la loi l'exige</li>
                  </ul>
                  <p className="mt-4">
                    Nous ne vendons jamais vos données personnelles à des tiers.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    7. Durée de conservation
                  </h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-foreground">Données clients :</strong> 3 ans après la dernière interaction</li>
                    <li><strong className="text-foreground">Données de commande :</strong> 10 ans (obligations comptables)</li>
                    <li><strong className="text-foreground">Données de navigation :</strong> 13 mois maximum</li>
                    <li><strong className="text-foreground">Données de santé :</strong> jusqu'au retrait de votre consentement</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    8. Vos droits
                  </h2>
                  <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                  <ul className="list-disc pl-6 mt-4 space-y-2">
                    <li><strong className="text-foreground">Droit d'accès :</strong> obtenir une copie de vos données</li>
                    <li><strong className="text-foreground">Droit de rectification :</strong> corriger vos données inexactes</li>
                    <li><strong className="text-foreground">Droit à l'effacement :</strong> demander la suppression de vos données</li>
                    <li><strong className="text-foreground">Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                    <li><strong className="text-foreground">Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                    <li><strong className="text-foreground">Droit de limitation :</strong> limiter le traitement de vos données</li>
                    <li><strong className="text-foreground">Droit de retirer votre consentement :</strong> à tout moment</li>
                  </ul>
                  <p className="mt-4">
                    Pour exercer ces droits, contactez-nous à contact@pharmacie-allard.be. Nous répondrons dans un délai d'un mois.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    9. Sécurité des données
                  </h2>
                  <p>
                    Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données :
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2">
                    <li>Chiffrement SSL/TLS pour toutes les communications</li>
                    <li>Hébergement sécurisé sur des serveurs européens</li>
                    <li>Accès restreint aux données personnelles</li>
                    <li>Sauvegarde régulière des données</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    10. Cookies
                  </h2>
                  <p>
                    Notre site utilise des cookies pour améliorer votre expérience. Les types de cookies utilisés sont :
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2">
                    <li><strong className="text-foreground">Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
                    <li><strong className="text-foreground">Cookies de performance :</strong> pour analyser l'utilisation du site</li>
                    <li><strong className="text-foreground">Cookies de fonctionnalité :</strong> pour mémoriser vos préférences</li>
                  </ul>
                  <p className="mt-4">
                    Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    11. Transferts internationaux
                  </h2>
                  <p>
                    Vos données sont principalement stockées au sein de l'Union Européenne. En cas de transfert vers des pays tiers, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types, décision d'adéquation).
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    12. Réclamations
                  </h2>
                  <p>
                    Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de l'Autorité de Protection des Données :
                  </p>
                  <ul className="list-none space-y-1 mt-4">
                    <li><strong className="text-foreground">Autorité de Protection des Données (APD)</strong></li>
                    <li>Rue de la Presse 35, 1000 Bruxelles</li>
                    <li>https://www.autoriteprotectiondonnees.be</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    13. Modifications
                  </h2>
                  <p>
                    Nous nous réservons le droit de modifier cette politique de confidentialité. En cas de modification substantielle, nous vous en informerons par email ou via notre site.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    14. Contact
                  </h2>
                  <p>
                    Pour toute question relative à cette politique, contactez-nous :
                  </p>
                  <ul className="list-none space-y-1 mt-4">
                    <li><strong className="text-foreground">Par email :</strong> contact@pharmacie-allard.be</li>
                    <li><strong className="text-foreground">Par téléphone :</strong> +32 02 648 42 22</li>
                    <li><strong className="text-foreground">Par courrier :</strong> Pharmacie Allard, Avenue de l'Hippodrome 148, 1050 Ixelles, Belgique</li>
                  </ul>
                </section>

                <p className="text-sm text-muted-foreground/70 pt-8 border-t border-border">
                  Dernière mise à jour : Janvier 2026
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
