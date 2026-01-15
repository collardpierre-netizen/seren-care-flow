import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  RefreshCw,
  FileText,
  Image,
  Film,
  Settings,
  LogOut,
  Menu,
  X,
  UserCheck,
  UserPlus,
  Euro,
  FolderOpen,
  BookOpen,
  Star,
  Building2,
  PackageSearch,
  BarChart3,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import StockNotifications from './StockNotifications';

const navItems = [
  { label: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { label: 'Préparations', href: '/admin/preparations', icon: Package },
  { label: 'Analytics Prép.', href: '/admin/analytics-preparations', icon: BarChart3 },
  { label: 'Produits', href: '/admin/produits', icon: Package },
  { label: 'Catégories', href: '/admin/categories', icon: FolderOpen },
  { label: 'Commandes', href: '/admin/commandes', icon: ShoppingCart },
  { label: 'Abonnements', href: '/admin/abonnements', icon: RefreshCw },
  { label: 'Fournisseurs', href: '/admin/fournisseurs', icon: Building2 },
  { label: 'Réassort', href: '/admin/reassort', icon: PackageSearch },
  { label: 'Alertes stock', href: '/admin/alertes-stock', icon: Bell },
  { label: 'Clients', href: '/admin/clients', icon: Users },
  { label: 'Avis clients', href: '/admin/avis', icon: Star },
  { label: 'Prescripteurs', href: '/admin/prescripteurs', icon: UserCheck },
  { label: 'Candidatures', href: '/admin/candidatures', icon: UserPlus },
  { label: 'Commissions', href: '/admin/commissions', icon: Euro },
  { label: 'Pages', href: '/admin/pages', icon: FileText },
  { label: 'Guides', href: '/admin/guides', icon: BookOpen },
  { label: 'Médias', href: '/admin/medias', icon: Image },
  { label: 'Médias Hero', href: '/admin/hero-media', icon: Film },
  { label: 'Emails', href: '/admin/emails', icon: FileText },
  { label: 'Paramètres', href: '/admin/parametres', icon: Settings },
];

const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-display font-bold text-lg">SerenCare Admin</span>
        <StockNotifications />
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <span className="font-display font-bold text-lg">SerenCare</span>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/admin'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrateur</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
