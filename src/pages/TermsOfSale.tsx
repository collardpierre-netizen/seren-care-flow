import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const TermsOfSale = () => {
  return (
    <>
      <Helmet>
        <title>Conditions Générales de Vente | SerenCare</title>
        <meta name="description" content="Conditions Générales de Vente de SerenCare - Vente de protections pour l'incontinence par Pharmacie Allard." />
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
                Conditions Générales de Vente (CGV)
              </h1>

              <p className="text-muted-foreground mb-2">Version 2025 – SerenCare</p>
              <p className="text-muted-foreground mb-8">Pharmacie Allard – Noralphar – APB 212033</p>

              <div className="space-y-10 text-foreground">
                {/* 1. Objet */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    1. Objet
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Les présentes Conditions Générales de Vente (CGV) régissent les ventes effectuées sur la plateforme SerenCare, opérée par :
                  </p>
                  <div className="bg-muted/50 rounded-xl p-6 space-y-2 text-sm mb-4">
                    <p className="font-semibold">Pharmacie Allard – Noralphar</p>
                    <p>Titulaire : Sonia Bourahli</p>
                    <p>APB : 212033</p>
                    <p>Adresse : Avenue Georges Lecointe 50, 1180 Uccle – Belgique</p>
                    <p>TVA : BE 0684.671.728</p>
                    <p>Téléphone : <a href="tel:+3202216492" className="text-primary hover:underline">+32 02 216 49 23</a></p>
                    <p>Email : <a href="mailto:ohall@noralphar.com" className="text-primary hover:underline">ohall@noralphar.com</a></p>
                  </div>
                  <p className="text-muted-foreground">
                    SerenCare est une boutique en ligne spécialisée dans la vente de protections pour l'incontinence 
                    et produits d'hygiène destinés aux particuliers.
                  </p>
                </section>

                {/* 2. Produits */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    2. Produits
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Les produits proposés sur SerenCare sont :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Protections absorbantes pour l'incontinence (légère, modérée, forte)</li>
                    <li>Dispositifs médicaux conformes au règlement MDR (EU 2017/745)</li>
                    <li>Produits d'hygiène et accessoires</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Les caractéristiques essentielles des produits sont décrites sur chaque fiche produit. 
                    Les photographies sont aussi fidèles que possible mais ne peuvent assurer une similitude parfaite.
                  </p>
                </section>

                {/* 3. Prix */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    3. Prix
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Les prix sont indiqués en euros (€) TTC (toutes taxes comprises). Le taux de TVA applicable 
                    est celui en vigueur en Belgique au moment de la commande.
                  </p>
                  <p className="text-muted-foreground">
                    SerenCare se réserve le droit de modifier ses prix à tout moment. Les produits seront facturés 
                    sur la base des tarifs en vigueur au moment de l'enregistrement de la commande.
                  </p>
                </section>

                {/* 4. Commandes */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    4. Commandes
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Le client passe commande sur le site SerenCare en suivant le processus de commande en ligne. 
                    La commande n'est définitive qu'après confirmation du paiement.
                  </p>
                  <p className="text-muted-foreground">
                    SerenCare se réserve le droit de refuser ou d'annuler toute commande en cas de :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                    <li>Litige existant avec le client</li>
                    <li>Non-paiement d'une commande antérieure</li>
                    <li>Suspicion de fraude</li>
                  </ul>
                </section>

                {/* 5. Abonnements */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    5. Abonnements
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    SerenCare propose un système d'abonnement permettant de recevoir automatiquement les produits 
                    à intervalle régulier (toutes les 4 semaines par défaut).
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><span className="font-medium text-foreground">Réduction :</span> Les abonnés bénéficient d'une réduction de 10% sur les produits</li>
                    <li><span className="font-medium text-foreground">Modification :</span> L'abonnement peut être modifié, suspendu ou annulé à tout moment depuis l'espace client</li>
                    <li><span className="font-medium text-foreground">Sans engagement :</span> Aucune durée minimale d'engagement n'est requise</li>
                    <li><span className="font-medium text-foreground">Facturation :</span> Le prélèvement est effectué automatiquement avant chaque livraison</li>
                  </ul>
                </section>

                {/* 6. Paiement */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    6. Paiement
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Les moyens de paiement acceptés sont :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Carte bancaire (Visa, Mastercard, Bancontact)</li>
                    <li>Prélèvement SEPA</li>
                    <li>Paiement en 3x sans frais (via Alma)</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Les paiements sont sécurisés par cryptage SSL et authentification 3D Secure.
                  </p>
                </section>

                {/* 7. Livraison */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    7. Livraison
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    SerenCare livre en Belgique et dans les pays limitrophes. Les délais de livraison sont indicatifs :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><span className="font-medium text-foreground">Belgique :</span> 24-48h ouvrées</li>
                    <li><span className="font-medium text-foreground">France, Luxembourg, Pays-Bas :</span> 3-5 jours ouvrés</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    <span className="font-medium text-foreground">Livraison gratuite</span> à partir de 49€ d'achat. 
                    En dessous, les frais de livraison s'élèvent à 4,90€.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    <span className="font-medium text-foreground">Emballage discret :</span> Toutes les livraisons sont 
                    effectuées dans un emballage neutre, sans mention du contenu.
                  </p>
                </section>

                {/* 8. Droit de rétractation */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    8. Droit de rétractation
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Conformément à la législation européenne, vous disposez d'un délai de 14 jours à compter de la 
                    réception de votre commande pour exercer votre droit de rétractation, sans avoir à justifier de 
                    motifs ni à payer de pénalités.
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Exception :</span> Ce droit ne s'applique pas aux 
                    produits descellés qui ne peuvent être renvoyés pour des raisons d'hygiène ou de protection de la santé.
                  </p>
                </section>

                {/* 9. Garantie */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    9. Garantie
                  </h2>
                  <p className="text-muted-foreground">
                    Tous les produits vendus sur SerenCare bénéficient de la garantie légale de conformité 
                    (articles 1649bis et suivants du Code civil belge) et de la garantie des vices cachés.
                  </p>
                </section>

                {/* 10. Réclamations */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    10. Réclamations
                  </h2>
                  <p className="text-muted-foreground">
                    Pour toute réclamation, vous pouvez nous contacter :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                    <li>Par email : <a href="mailto:ohall@noralphar.com" className="text-primary hover:underline">ohall@noralphar.com</a></li>
                    <li>Par téléphone : <a href="tel:+3202216492" className="text-primary hover:underline">+32 02 216 49 23</a> (Du lundi au vendredi de 09h à 15h)</li>
                  </ul>
                </section>

                {/* 11. Médiation */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    11. Médiation
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    En cas de litige non résolu, le consommateur peut recourir gratuitement au service de médiation :
                  </p>
                  <div className="bg-muted/50 rounded-xl p-6 text-sm">
                    <p className="font-semibold">Service de médiation pour le consommateur</p>
                    <p className="text-muted-foreground mt-2">
                      <a href="https://mediationconsommateur.be" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        https://mediationconsommateur.be
                      </a>
                    </p>
                  </div>
                </section>

                {/* 12. Protection des données */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    12. Protection des données
                  </h2>
                  <p className="text-muted-foreground">
                    Les informations concernant la collecte et le traitement des données personnelles sont 
                    détaillées dans notre{" "}
                    <Link to="/confidentialite" className="text-primary hover:underline">
                      Politique de confidentialité
                    </Link>.
                  </p>
                </section>

                {/* 13. Droit applicable */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    13. Droit applicable
                  </h2>
                  <p className="text-muted-foreground">
                    Les présentes CGV sont soumises au droit belge. En cas de litige, et après tentative de 
                    résolution amiable, les tribunaux belges seront compétents.
                  </p>
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

export default TermsOfSale;
