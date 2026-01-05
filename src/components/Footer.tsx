import { Link } from "react-router-dom";
import { Phone, Mail, ArrowUpRight, MapPin, Clock } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: "Boutique", href: "/boutique" },
      { name: "Aide au choix", href: "/aide-au-choix" },
      { name: "Abonnement", href: "/boutique?mode=subscription" },
      { name: "FAQ", href: "/a-propos#faq" },
    ],
    prescripteurs: [
      { name: "Espace Pro", href: "/prescripteurs" },
      { name: "Maisons de repos & EHPAD", href: "/prescripteurs#contact" },
      { name: "Médecins & Pharmaciens", href: "/prescripteurs#contact" },
      { name: "Devenir partenaire", href: "/prescripteurs#contact" },
    ],
    about: [
      { name: "Notre mission", href: "/a-propos" },
      { name: "Nos marques", href: "/marques" },
      { name: "Contact", href: "/a-propos#faq" },
    ],
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container-main py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">S</span>
              </div>
              <span className="font-display font-bold text-xl text-background tracking-tight">SerenCare</span>
            </Link>
            <p className="text-background/70 text-sm mb-6 max-w-xs leading-relaxed">
              La tranquillité d'esprit pour vous et vos proches. Des protections de qualité, livrées automatiquement.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-background">Pharmacie Allard</p>
              <a href="tel:+3202648422" className="flex items-center gap-3 text-sm text-background/80 hover:text-background transition-colors group">
                <Phone className="w-4 h-4" />
                +32 02 648 42 22
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a href="mailto:contact@pharmacie-allard.be" className="flex items-center gap-3 text-sm text-background/80 hover:text-background transition-colors group">
                <Mail className="w-4 h-4" />
                contact@pharmacie-allard.be
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <div className="flex items-center gap-3 text-sm text-background/80">
                <Clock className="w-4 h-4" />
                Lun-Dim 8h-20h
              </div>
              <div className="flex items-start gap-3 text-sm text-background/80">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Av. de l'Hippodrome 148<br />1050 Ixelles, Belgique</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-background text-sm uppercase tracking-wider mb-5">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Prescripteurs */}
          <div>
            <h4 className="font-display font-semibold text-background text-sm uppercase tracking-wider mb-5">Prescripteurs</h4>
            <ul className="space-y-3">
              {footerLinks.prescripteurs.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h4 className="font-display font-semibold text-background text-sm uppercase tracking-wider mb-5">À propos</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-background/50">
              © {currentYear} SerenCare. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-xs text-background/50">
              <Link to="/mentions-legales" className="hover:text-background/70 transition-colors">Mentions légales</Link>
              <Link to="/cgv" className="hover:text-background/70 transition-colors">CGV</Link>
              <Link to="/confidentialite" className="hover:text-background/70 transition-colors">Confidentialité</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
