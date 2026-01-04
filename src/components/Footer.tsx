import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: "Boutique", href: "/boutique" },
      { name: "Aide au choix", href: "/aide-au-choix" },
      { name: "Abonnement", href: "/abonnement" },
      { name: "FAQ", href: "/faq" },
    ],
    prescripteurs: [
      { name: "Infirmiers & Médecins", href: "/prescripteurs/professionnels" },
      { name: "Pharmaciens", href: "/prescripteurs/pharmaciens" },
      { name: "EHPAD & Résidences", href: "/prescripteurs/etablissements" },
      { name: "Devenir partenaire", href: "/prescripteurs" },
    ],
    about: [
      { name: "Notre mission", href: "/a-propos" },
      { name: "Nos marques", href: "/marques" },
      { name: "Contact", href: "/contact" },
      { name: "Blog", href: "/blog" },
    ],
    legal: [
      { name: "Mentions légales", href: "/mentions-legales" },
      { name: "CGV", href: "/cgv" },
      { name: "Politique de confidentialité", href: "/confidentialite" },
      { name: "Cookies", href: "/cookies" },
    ],
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">S</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">SerenCare</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              La tranquillité d'esprit pour vous et vos proches. Des protections adaptées, livrées automatiquement.
            </p>
            <div className="space-y-3">
              <a href="tel:0123456789" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4 text-primary" />
                01 23 45 67 89
              </a>
              <a href="mailto:contact@serencare.fr" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4 text-primary" />
                contact@serencare.fr
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                Paris, France
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Prescripteurs */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Prescripteurs</h4>
            <ul className="space-y-3">
              {footerLinks.prescripteurs.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">À propos</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Légal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} SerenCare. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-muted-foreground">Marques partenaires :</span>
              <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <span>TENA</span>
                <span>•</span>
                <span>Hartmann</span>
                <span>•</span>
                <span>Lille Healthcare</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
