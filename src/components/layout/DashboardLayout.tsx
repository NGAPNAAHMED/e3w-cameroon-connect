import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ShoppingCart,
  Bell,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  UserPlus,
  FileText,
  Calculator,
  MessageSquare,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
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
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'admin' ? [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: UserPlus, label: 'Nouveaux inscrits', path: '/dashboard/nouveaux' },
    { icon: Users, label: 'Gestionnaires', path: '/dashboard/gestionnaires' },
    { icon: FolderKanban, label: 'Dossiers à analyser', path: '/dashboard/comite' },
    { icon: Settings, label: 'Paramètres', path: '/dashboard/parametres' },
  ] : user?.role === 'gestionnaire' ? [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: Users, label: 'Mon Portefeuille', path: '/dashboard/portefeuille' },
    { icon: ShoppingCart, label: 'Panier', path: '/dashboard/panier' },
    { icon: FolderKanban, label: 'Mes Dossiers', path: '/dashboard/dossiers' },
    { icon: Calendar, label: 'Agenda', path: '/dashboard/agenda' },
  ] : [
    { icon: LayoutDashboard, label: 'Mon Espace', path: '/dashboard' },
    { icon: FileText, label: 'Mon Dossier Client', path: '/dashboard/dossier' },
    { icon: Calculator, label: 'Simulation Crédit', path: '/dashboard/simulation' },
    { icon: MessageSquare, label: 'Contacter Gestionnaire', path: '/dashboard/contact' },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <Info className="w-4 h-4 text-info" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'À l\'instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col h-screen",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border flex-shrink-0">
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
                {isActive && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border flex-shrink-0">
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
            <Button variant="ghost" size="sm" className="flex-1 justify-start" onClick={() => navigate('/dashboard/parametres')}>
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
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
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Fixed */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0 z-30">
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
              {/* Notifications Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                        Tout marquer lu
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-80">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-border">
                        {notifications.map(notification => (
                          <div 
                            key={notification.id}
                            className={cn(
                              "p-4 hover:bg-accent/50 cursor-pointer transition-colors",
                              !notification.read && "bg-primary/5"
                            )}
                            onClick={() => {
                              markAsRead(notification.id);
                              if (notification.link) navigate(notification.link);
                            }}
                          >
                            <div className="flex gap-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm", !notification.read && "font-medium")}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatTimeAgo(notification.timestamp)}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucune notification</p>
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>

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

        {/* Page Content - Scrollable */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
