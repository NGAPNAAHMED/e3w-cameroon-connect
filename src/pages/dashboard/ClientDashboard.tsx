import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  FileText,
  Calculator,
  User,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatXAF, formatDate } from '@/lib/formatters';
import { staff } from '@/data/mockData';

// Mock transactions
const transactions = [
  { id: 1, type: 'credit', label: 'Virement entrant', montant: 250000, date: '2024-01-15' },
  { id: 2, type: 'debit', label: 'Retrait GAB', montant: 50000, date: '2024-01-14' },
  { id: 3, type: 'debit', label: 'Paiement Facture', montant: 35000, date: '2024-01-13' },
  { id: 4, type: 'credit', label: 'Salaire Janvier', montant: 450000, date: '2024-01-10' },
  { id: 5, type: 'debit', label: 'Achat Mobile Money', montant: 20000, date: '2024-01-08' },
];

const notifications = [
  { id: 1, message: 'Votre gestionnaire vous a été assigné', time: '2h' },
  { id: 2, message: 'Complétez votre dossier client', time: '1j' },
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const gestionnaire = staff.find(s => s.email === 'ahmed@e3w.cm');
  
  const soldeCompte = 1245000;
  const kycProgress = 65;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <Card className="glass-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
        <CardContent className="relative p-6 flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/30">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary/20 text-primary text-xl">
              {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-display">
              Bienvenue, {user?.prenom} !
            </h1>
            <p className="text-muted-foreground">
              Gérez vos demandes de crédit et suivez vos opérations
            </p>
          </div>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
              {notifications.length}
            </span>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Solde Card */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Solde du compte</p>
                  <p className="text-3xl font-bold text-primary font-display number-format">
                    {formatXAF(soldeCompte)}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex-col gap-2"
              onClick={() => navigate('/dashboard/dossier')}
            >
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-xs">Mon Dossier</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex-col gap-2"
              onClick={() => navigate('/dashboard/simulation')}
            >
              <Calculator className="w-6 h-6 text-info" />
              <span className="text-xs">Simulation</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex-col gap-2"
              onClick={() => navigate('/dashboard/gestionnaire')}
            >
              <User className="w-6 h-6 text-success" />
              <span className="text-xs">Mon Gestionnaire</span>
            </Button>
          </div>

          {/* Transactions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Historique Transactions
                <Button variant="ghost" size="sm">
                  Voir tout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'credit' ? 'bg-success/20' : 'bg-destructive/20'
                    }`}>
                      {tx.type === 'credit' ? (
                        <ArrowDownLeft className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{tx.label}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                    </div>
                    <p className={`font-semibold number-format ${
                      tx.type === 'credit' ? 'text-success' : 'text-destructive'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatXAF(tx.montant)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* KYC Progress */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Mon Dossier Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{kycProgress}%</span>
                </div>
                <Progress value={kycProgress} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Identification</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Situation Sociale</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-muted-foreground">Professionnel</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Bancaire</span>
                </div>
              </div>

              <Button variant="gold" className="w-full" onClick={() => navigate('/dashboard/dossier')}>
                Compléter mon dossier
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Gestionnaire Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Mon Gestionnaire</CardTitle>
            </CardHeader>
            <CardContent>
              {gestionnaire ? (
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto border-2 border-primary/30">
                    <AvatarImage src={gestionnaire.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {gestionnaire.prenom.charAt(0)}{gestionnaire.nom.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-3 font-semibold">
                    {gestionnaire.prenom} {gestionnaire.nom}
                  </h3>
                  <p className="text-sm text-muted-foreground">{gestionnaire.telephone}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/dashboard/gestionnaire')}>
                    Contacter
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">En attente d'attribution</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                  <Bell className="w-4 h-4 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-muted-foreground">Il y a {n.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
