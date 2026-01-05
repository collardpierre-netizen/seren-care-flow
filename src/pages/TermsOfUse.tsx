import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const TermsOfUse = () => {
  return (
    <>
      <Helmet>
        <title>Conditions Générales d'Utilisation | SerenCare</title>
        <meta name="description" content="Conditions Générales d'Utilisation de SerenCare - Règles d'utilisation de la plateforme." />
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
                Conditions Générales d'Utilisation (CGU)
              </h1>

              <p className="text-muted-foreground mb-2">Version 2025 – SerenCare</p>
              <p className="text-muted-foreground mb-8">Pharmacie Allard – Noralphar – APB 212033</p>

              <div className="space-y-10 text-foreground">
                {/* 1. Objet des CGU */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    1. Objet des CGU
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Les présentes Conditions Générales d'Utilisation (CGU) définissent les modalités d'accès et d'utilisation 
                    de la plateforme SerenCare, exploitée par :
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
                  <p className="text-muted-foreground mb-4">
                    SerenCare est une boutique en ligne spécialisée dans la vente de protections pour l'incontinence 
                    destinées aux particuliers.
                  </p>
                  <p className="text-muted-foreground">
                    Les CGU complètent :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                    <li>les <Link to="/cgv" className="text-primary hover:underline">Conditions Générales de Vente</Link></li>
                    <li>la <Link to="/confidentialite" className="text-primary hover:underline">Politique de confidentialité</Link></li>
                    <li>les <Link to="/mentions-legales" className="text-primary hover:underline">Mentions légales</Link></li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Tout utilisateur déclare accepter pleinement les présentes CGU.
                  </p>
                </section>

                {/* 2. Accès au site */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    2. Accès au site
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    L'accès au site SerenCare est ouvert à toute personne majeure souhaitant acheter des produits 
                    pour elle-même ou pour un proche.
                  </p>
                  <p className="text-muted-foreground">
                    L'utilisation du site implique l'acceptation pleine et entière des présentes CGU.
                  </p>
                </section>

                {/* 3. Création de compte */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    3. Création d'un compte
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    L'ouverture d'un compte nécessite :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Une adresse email valide</li>
                    <li>Un mot de passe sécurisé</li>
                    <li>Des informations d'identification exactes</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    L'utilisateur s'engage à fournir des informations exactes et à les tenir à jour. 
                    Le compte est personnel et ne peut être partagé.
                  </p>
                </section>

                {/* 4. Obligations de l'utilisateur */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    4. Obligations de l'utilisateur
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    L'utilisateur s'engage à :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Utiliser le site conformément à sa destination</li>
                    <li>Ne pas porter atteinte au bon fonctionnement du site</li>
                    <li>Ne pas collecter d'informations sur les autres utilisateurs</li>
                    <li>Respecter les droits de propriété intellectuelle</li>
                    <li>Ne pas utiliser le site à des fins illicites</li>
                  </ul>
                </section>

                {/* 5. Propriété intellectuelle */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    5. Propriété intellectuelle
                  </h2>
                  <p className="text-muted-foreground">
                    L'ensemble du contenu du site (textes, images, logos, vidéos, graphismes) est protégé 
                    par les droits de propriété intellectuelle. Toute reproduction, représentation ou exploitation 
                    non autorisée est strictement interdite.
                  </p>
                </section>

                {/* 6. Responsabilité */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    6. Responsabilité
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    SerenCare s'efforce de maintenir le site accessible 24h/24 et 7j/7, mais ne peut garantir 
                    une disponibilité permanente. Des interruptions peuvent survenir pour maintenance ou raisons techniques.
                  </p>
                  <p className="text-muted-foreground">
                    Les informations présentes sur le site sont fournies à titre indicatif et ne constituent 
                    pas un avis médical. Pour toute question de santé, consultez un professionnel.
                  </p>
                </section>

                {/* 7. Liens externes */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    7. Liens externes
                  </h2>
                  <p className="text-muted-foreground">
                    Le site peut contenir des liens vers des sites externes. SerenCare n'est pas responsable 
                    du contenu de ces sites et décline toute responsabilité quant aux dommages pouvant résulter 
                    de leur consultation.
                  </p>
                </section>

                {/* 8. Modification des CGU */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    8. Modification des CGU
                  </h2>
                  <p className="text-muted-foreground">
                    SerenCare se réserve le droit de modifier les présentes CGU à tout moment. 
                    Les modifications entrent en vigueur dès leur publication sur le site. 
                    L'utilisation continue du site vaut acceptation des nouvelles conditions.
                  </p>
                </section>

                {/* 9. Droit applicable */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    9. Droit applicable
                  </h2>
                  <p className="text-muted-foreground">
                    Les présentes CGU sont soumises au droit belge. En cas de litige, les tribunaux belges 
                    seront compétents.
                  </p>
                </section>

                {/* 10. Contact */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    10. Contact
                  </h2>
                  <p className="text-muted-foreground">
                    Pour toute question relative aux présentes CGU :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                    <li>Email : <a href="mailto:ohall@noralphar.com" className="text-primary hover:underline">ohall@noralphar.com</a></li>
                    <li>Téléphone : <a href="tel:+3202216492" className="text-primary hover:underline">+32 02 216 49 23</a> (Du lundi au vendredi de 09h à 15h)</li>
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

export default TermsOfUse;
