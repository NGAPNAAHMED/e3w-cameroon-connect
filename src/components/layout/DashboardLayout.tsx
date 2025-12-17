import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ShoppingCart,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserPlus,
  RefreshCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/formatters';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState(3);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'admin' ? [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: UserPlus, label: 'Nouveaux inscrits', path: '/dashboard/nouveaux', badge: 8 },
    { icon: Users, label: 'Gestionnaires', path: '/dashboard/gestionnaires' },
    { icon: RefreshCcw, label: 'Réassignations', path: '/dashboard/reassignations' },
    { icon: FolderKanban, label: 'Dossiers Comité', path: '/dashboard/comite' },
  ] : user?.role === 'gestionnaire' ? [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: Users, label: 'Mon Portefeuille', path: '/dashboard/portefeuille' },
    { icon: ShoppingCart, label: 'Panier', path: '/dashboard/panier', badge: 2 },
    { icon: FolderKanban, label: 'Mes Dossiers', path: '/dashboard/dossiers' },
  ] : [
    { icon: LayoutDashboard, label: 'Mon Espace', path: '/dashboard' },
    { icon: Users, label: 'Ma Fiche KYC', path: '/dashboard/kyc' },
    { icon: FolderKanban, label: 'Mes Demandes', path: '/dashboard/demandes' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground font-display">E³</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground font-display">E³W</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {user?.role === 'admin' ? 'Administration' : user?.role === 'gestionnaire' ? 'Gestionnaire' : 'Espace Client'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={cn("nav-item w-full", isActive && "active")}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10 border-2 border-primary/30">
                <AvatarImage src={user?.avatar} alt={user?.nom} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user ? getInitials(user.nom, user.prenom) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1 justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-foreground font-display">
                  {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {user ? getInitials(user.nom, user.prenom) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user?.prenom}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
