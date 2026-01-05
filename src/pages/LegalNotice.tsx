import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";

const LegalNotice = () => {
  return (
    <>
      <Helmet>
        <title>Mentions légales | SerenCare</title>
        <meta name="description" content="Mentions légales du site SerenCare - Pharmacie Allard. Informations sur l'éditeur, l'hébergeur et les droits de propriété intellectuelle." />
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
                Mentions légales
              </h1>

              <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    1. Éditeur du site
                  </h2>
                  <p>
                    Le site SerenCare (ci-après « le Site ») est édité par :
                  </p>
                  <ul className="list-none space-y-1 mt-4">
                    <li><strong className="text-foreground">Raison sociale :</strong> Pharmacie Allard SPRL</li>
                    <li><strong className="text-foreground">Forme juridique :</strong> Société Privée à Responsabilité Limitée</li>
                    <li><strong className="text-foreground">Adresse du siège social :</strong> Avenue de l'Hippodrome 148, 1050 Ixelles, Belgique</li>
                    <li><strong className="text-foreground">Numéro d'entreprise (BCE) :</strong> BE 0XXX.XXX.XXX</li>
                    <li><strong className="text-foreground">Numéro de TVA :</strong> BE 0XXX.XXX.XXX</li>
                    <li><strong className="text-foreground">Téléphone :</strong> +32 02 648 42 22</li>
                    <li><strong className="text-foreground">Email :</strong> ohall@noralphar.com</li>
                    <li><strong className="text-foreground">Directeur de la publication :</strong> M./Mme [Nom du pharmacien titulaire]</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    2. Activité réglementée
                  </h2>
                  <p>
                    La Pharmacie Allard est une officine de pharmacie autorisée par l'Agence Fédérale des Médicaments et des Produits de Santé (AFMPS).
                  </p>
                  <ul className="list-none space-y-1 mt-4">
                    <li><strong className="text-foreground">Numéro d'agrément :</strong> [Numéro d'agrément]</li>
                    <li><strong className="text-foreground">Pharmacien titulaire :</strong> [Nom], inscrit à l'Ordre des Pharmaciens de Belgique</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    3. Hébergement
                  </h2>
                  <p>Le Site est hébergé par :</p>
                  <ul className="list-none space-y-1 mt-4">
                    <li><strong className="text-foreground">Nom :</strong> Lovable / Supabase</li>
                    <li><strong className="text-foreground">Adresse :</strong> Services cloud européens</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    4. Propriété intellectuelle
                  </h2>
                  <p>
                    L'ensemble du contenu du Site (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) est la propriété exclusive de la Pharmacie Allard ou de ses partenaires et est protégé par les lois belges et internationales relatives à la propriété intellectuelle.
                  </p>
                  <p className="mt-4">
                    Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du Site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de la Pharmacie Allard.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    5. Données personnelles
                  </h2>
                  <p>
                    Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles. Pour plus d'informations, consultez notre{" "}
                    <a href="/confidentialite" className="text-primary hover:underline">
                      Politique de confidentialité
                    </a>.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    6. Cookies
                  </h2>
                  <p>
                    Le Site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. En naviguant sur le Site, vous acceptez l'utilisation de cookies conformément à notre politique de cookies.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    7. Limitation de responsabilité
                  </h2>
                  <p>
                    La Pharmacie Allard s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le Site. Toutefois, elle ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
                  </p>
                  <p className="mt-4">
                    Les informations présentes sur le Site ne constituent en aucun cas un avis médical. Pour toute question relative à votre santé, consultez un professionnel de santé qualifié.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    8. Droit applicable
                  </h2>
                  <p>
                    Les présentes mentions légales sont soumises au droit belge. En cas de litige, les tribunaux de Bruxelles seront seuls compétents.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    9. Contact
                  </h2>
                  <p>
                    Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
                  </p>
                  <ul className="list-none space-y-1 mt-4">
                    <li><strong className="text-foreground">Par email :</strong> ohall@noralphar.com</li>
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

export default LegalNotice;
