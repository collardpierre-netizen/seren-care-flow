import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Phone, ChevronRight, ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { openCart, getItemCount } = useCart();
  const itemCount = getItemCount();

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Boutique", href: "/boutique" },
    { name: "Aide au choix", href: "/aide-au-choix" },
    { name: "Prescripteurs", href: "/prescripteurs" },
    { name: "À propos", href: "/a-propos" },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur SerenCare !",
    });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40">
      <nav className="container-main">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="SerenCare" className="w-9 h-9 rounded-lg transition-transform group-hover:scale-105" />
            <span className="font-display font-bold text-xl text-foreground tracking-tight">SerenCare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-primary bg-highlight"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a 
              href="tel:+3202648422" 
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>+32 02 648 42 22</span>
            </a>
            
            {/* Cart button */}
            <Button variant="ghost" size="icon" onClick={openCart} className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </Button>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem onSelect={() => navigate('/admin')}>
                      Administration
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => navigate('/mon-compte')}>
                    Mon compte
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/connexion">Connexion</Link>
              </Button>
            )}

            <Button asChild size="default">
              <Link to="/boutique" className="gap-2">
                Découvrir
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile - Cart + Menu */}
          <div className="lg:hidden flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={openCart} className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </Button>
            <button
              className="p-2.5 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-border/40"
            >
              <div className="py-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => {
                      setIsOpen(false);
                      // Ensure scroll to top on mobile navigation
                      setTimeout(() => {
                        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                        document.documentElement.scrollTop = 0;
                        document.body.scrollTop = 0;
                      }, 100);
                    }}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-highlight text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {user && isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-muted"
                  >
                    Administration
                  </Link>
                )}
                
                <div className="pt-4 px-4 space-y-3 border-t border-border/40 mt-4">
                  <a 
                    href="tel:+3202648422" 
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                  >
                    <Phone className="w-4 h-4" />
                    +32 02 648 42 22
                  </a>
                  
                  {user ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <Button variant="outline" className="w-full" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Déconnexion
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" asChild>
                        <Link to="/connexion" onClick={() => setIsOpen(false)}>Connexion</Link>
                      </Button>
                      <Button asChild>
                        <Link to="/inscription" onClick={() => setIsOpen(false)}>S'inscrire</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;
