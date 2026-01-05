import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LegalNotice = () => {
  return (
    <>
      <Helmet>
        <title>Mentions légales | SerenCare</title>
        <meta name="description" content="Mentions légales de SerenCare - Informations légales obligatoires conformément à la législation belge et européenne." />
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
                Mentions légales
              </h1>

              <p className="text-muted-foreground mb-8">
                Informations légales obligatoires conformément à la législation belge et européenne
              </p>

              <div className="space-y-10 text-foreground">
                {/* Éditeur */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Éditeur de la plateforme
                  </h2>
                  <div className="bg-muted/50 rounded-xl p-6 space-y-2 text-sm">
                    <p className="font-semibold">Pharmacie Allard – Noralphar</p>
                    <p>Titulaire : Sonia Bourahli</p>
                    <p className="font-medium mt-4">Adresse du siège social</p>
                    <p>Avenue Georges Lecointe 50<br />1180 Uccle, Belgique</p>
                    <p className="font-medium mt-4">Téléphone</p>
                    <p><a href="tel:+3202216492" className="text-primary hover:underline">+32 02 216 49 23</a></p>
                    <p className="font-medium mt-4">Email</p>
                    <p><a href="mailto:ohall@noralphar.com" className="text-primary hover:underline">ohall@noralphar.com</a></p>
                  </div>
                </section>

                {/* Numéros d'identification */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Numéros d'identification et autorisations
                  </h2>
                  <div className="bg-muted/50 rounded-xl p-6 space-y-3 text-sm">
                    <div>
                      <p className="font-medium">Numéro APB</p>
                      <p className="text-muted-foreground">212033 – Association Pharmaceutique Belge</p>
                    </div>
                    <div>
                      <p className="font-medium">Numéro de TVA</p>
                      <p className="text-muted-foreground">BE 0684.671.728 – TVA intracommunautaire</p>
                    </div>
                  </div>
                </section>

                {/* Nature de l'activité */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Nature de l'activité
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    SerenCare est une plateforme e-commerce spécialisée dans la vente de protections pour l'incontinence 
                    destinées aux particuliers. La plateforme permet la vente de :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Protections absorbantes pour l'incontinence</li>
                    <li>Dispositifs médicaux conformes au règlement MDR (EU 2017/745)</li>
                    <li>Produits d'hygiène et accessoires associés</li>
                  </ul>
                </section>

                {/* Hébergement */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Hébergement de la plateforme
                  </h2>
                  <div className="bg-muted/50 rounded-xl p-6 text-sm">
                    <p className="font-semibold">Lovable Cloud (Supabase)</p>
                    <p className="text-muted-foreground mt-2">
                      Infrastructure cloud conforme RGPD et hébergée dans l'Union Européenne
                    </p>
                  </div>
                </section>

                {/* Directeur de publication */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Directeur de publication
                  </h2>
                  <p className="text-muted-foreground">
                    Sonia Bourahli<br />
                    Pharmacien titulaire – APB 212033
                  </p>
                </section>

                {/* Autorités de contrôle */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Autorités de contrôle et réglementation
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-xl p-6 text-sm">
                      <p className="font-semibold">FAGG/AFMPS</p>
                      <p className="text-muted-foreground">Agence Fédérale des Médicaments et des Produits de Santé</p>
                      <a href="https://www.afmps.be" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.afmps.be</a>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-6 text-sm">
                      <p className="font-semibold">APB</p>
                      <p className="text-muted-foreground">Association Pharmaceutique Belge</p>
                      <a href="https://www.apb.be" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.apb.be</a>
                    </div>
                  </div>
                </section>

                {/* Propriété intellectuelle */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Propriété intellectuelle
                  </h2>
                  <p className="text-muted-foreground">
                    L'ensemble du contenu du site SerenCare (textes, images, vidéos, logos, marques) est protégé 
                    par les lois relatives à la propriété intellectuelle. Toute reproduction, même partielle, 
                    est strictement interdite sans autorisation préalable écrite.
                  </p>
                </section>

                {/* Données personnelles */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Données personnelles
                  </h2>
                  <p className="text-muted-foreground">
                    Les informations concernant la collecte et le traitement des données personnelles sont 
                    détaillées dans notre{" "}
                    <Link to="/confidentialite" className="text-primary hover:underline">
                      Politique de confidentialité
                    </Link>.
                  </p>
                </section>

                {/* Litiges */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Règlement des litiges
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    En cas de litige, le consommateur peut recourir gratuitement au service de médiation :
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

                {/* Droit applicable */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Droit applicable
                  </h2>
                  <p className="text-muted-foreground">
                    Le présent site est soumis au droit belge. En cas de litige, les tribunaux belges seront compétents.
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

export default LegalNotice;
