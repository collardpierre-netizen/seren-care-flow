import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";

const TermsOfSale = () => {
  return (
    <>
      <Helmet>
        <title>Conditions Générales de Vente | SerenCare</title>
        <meta name="description" content="Conditions générales de vente du site SerenCare - Pharmacie Allard. Informations sur les commandes, livraisons, paiements et retours." />
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
                Conditions Générales de Vente
              </h1>

              <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Article 1 - Objet
                  </h2>
                  <p>
                    Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits effectuées par la Pharmacie Allard, exerçant sous la marque commerciale SerenCare, via son site internet.
                  </p>
                  <p className="mt-4">
                    Toute commande implique l'acceptation sans réserve des présentes CGV.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Article 2 - Produits
                  </h2>
                  <p>
                    Les produits proposés à la vente sont des dispositifs médicaux et produits d'hygiène pour l'incontinence. Les caractéristiques essentielles des produits sont décrites sur chaque fiche produit.
                  </p>
                  <p className="mt-4">
                    Les photographies des produits sont les plus fidèles possibles mais ne peuvent assurer une similitude parfaite avec le produit offert.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Article 3 - Prix
                  </h2>
                  <p>
                    Les prix sont indiqués en euros, toutes taxes comprises (TTC). Ils tiennent compte de la TVA applicable au jour de la commande. La Pharmacie Allard se réserve le droit de modifier ses prix à tout moment.
                  </p>
                  <p className="mt-4">
                    Les produits seront facturés sur la base des tarifs en vigueur au moment de la validation de la commande.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Article 4 - Commandes
                  </h2>
                  <p>
                    Le client sélectionne les produits qu'il souhaite commander et valide son panier. La commande est définitive après confirmation du paiement.
                  </p>
                  <p className="mt-4">
                    La Pharmacie Allard se réserve le droit de refuser toute commande pour des motifs légitimes (commande anormale, client de mauvaise foi, etc.).
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Article 5 - Abonnements
                  </h2>
                  <p>
                    SerenCare propose des formules d'abonnement permettant une livraison régulière des produits. L'abonnement peut être :
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2">
                    <li>Modifié à tout moment (fréquence, quantité, produits)</li>
                    <li>Suspendu temporairement sans frais</li>
                    <li>Résilié à tout moment sans engagement minimum</li>
                  </ul>
                  <p className="mt-4">
                    Les abonnés bénéficient d'une réduction de 10% sur tous les produits inclus dans leur abonnement.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Article 6 - Paiement
                  </h2>
                  <p>
                    Le paiement s'effectue en ligne par carte bancaire (Visa, Mastercard, Bancontact) via notre prestataire de paiement sécurisé Stripe.
                  </p>
                  <p className="mt-4">
                    Pour les abonnements, le prélèvement est automatique selon la fréquence choisie.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Article 7 - Livraison
                  </h2>
                  <p>
                    Les livraisons sont effectuées en Belgique uniquement. Les délais de livraison sont de 2 à 5 jours ouvrés.
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2">
                    <li><strong className="text-foreground">Livraison standard :</strong> 4,90€ (gratuite dès 50€ d'achat)</li>
                    <li><strong className="text-foreground">Livraison express :</strong> 9,90€ (24-48h)</li>
                    <li><strong className="text-foreground">Abonnement :</strong> Livraison offerte</li>
                  </ul>
                  <p className="mt-4">
                    Les colis sont livrés en emballage discret, sans mention du contenu.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Article 8 - Droit de rétractation
                  </h2>
                  <p>
                    Conformément à la législation belge et européenne, le client dispose d'un délai de 14 jours à compter de la réception des produits pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.
                  </p>
                  <p className="mt-4">
                    <strong className="text-foreground">Exceptions :</strong> Pour des raisons d'hygiène, les produits descellés ne peuvent être retournés.
                  </p>
                  <p className="mt-4">
                    Pour exercer ce droit, contactez-nous à contact@pharmacie-allard.be ou par téléphone au +32 02 648 42 22.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Article 9 - Garantie
                  </h2>
                  <p>
                    Tous les produits vendus bénéficient de la garantie légale de conformité (articles 1649bis et suivants du Code civil belge) et de la garantie des vices cachés.
                  </p>
                  <p className="mt-4">
                    En cas de produit défectueux ou non conforme, le client peut demander le remplacement ou le remboursement du produit.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Article 10 - Réclamations
                  </h2>
                  <p>
                    Pour toute réclamation, le client peut contacter le service client :
                  </p>
                  <ul className="list-none space-y-1 mt-4">
                    <li><strong className="text-foreground">Par email :</strong> contact@pharmacie-allard.be</li>
                    <li><strong className="text-foreground">Par téléphone :</strong> +32 02 648 42 22 (Lun-Dim 8h-20h)</li>
                  </ul>
                  <p className="mt-4">
                    Nous nous engageons à répondre dans un délai de 48 heures ouvrées.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Article 11 - Médiation
                  </h2>
                  <p>
                    En cas de litige, le client peut recourir à un service de médiation :
                  </p>
                  <ul className="list-none space-y-1 mt-4">
                    <li><strong className="text-foreground">Service de Médiation pour le Consommateur</strong></li>
                    <li>Boulevard du Roi Albert II, 8 Bte 1, 1000 Bruxelles</li>
                    <li>https://mediationconsommateur.be</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Article 12 - Protection des données
                  </h2>
                  <p>
                    Les données personnelles collectées sont traitées conformément à notre{" "}
                    <a href="/confidentialite" className="text-primary hover:underline">
                      Politique de confidentialité
                    </a>.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Article 13 - Droit applicable
                  </h2>
                  <p>
                    Les présentes CGV sont soumises au droit belge. En cas de litige, les tribunaux de Bruxelles seront seuls compétents.
                  </p>
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

export default TermsOfSale;
