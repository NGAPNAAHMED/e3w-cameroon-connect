import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  UserPlus,
  FolderKanban,
  TrendingUp,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { staff, clients } from '@/data/mockData';
import { getInitials } from '@/lib/formatters';

export default function AdminDashboard() {
  const gestionnaires = staff.filter(s => s.role === 'gestionnaire');
  const nouveauxClients = clients.filter(c => !c.gestionnaireId).length;
  const dossiersComite = clients.filter(c => c.statut === 'comite').length;
  const totalClients = clients.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Clients</p>
                <p className="text-2xl font-bold text-foreground font-display">{totalClients}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Non Assignés</p>
                <p className="text-2xl font-bold text-warning font-display">{nouveauxClients}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">En Comité</p>
                <p className="text-2xl font-bold text-info font-display">{dossiersComite}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Gestionnaires</p>
                <p className="text-2xl font-bold text-success font-display">{gestionnaires.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gestionnaires Workload */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center justify-between">
              Charge de Travail
              <Button variant="ghost" size="sm">
                Voir tout <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {gestionnaires.map(g => {
              const clientCount = clients.filter(c => c.gestionnaireId === g.id).length;
              const maxClients = 50;
              const percentage = (clientCount / maxClients) * 100;
              
              return (
                <div key={g.id} className="flex items-center gap-4">
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={g.avatar} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {getInitials(g.nom, g.prenom)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{g.prenom} {g.nom}</span>
                      <span className="text-sm text-muted-foreground">{clientCount} clients</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Nouveaux Inscrits */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center justify-between">
              Nouveaux Inscrits
              <Badge variant="outline" className="text-warning border-warning">
                {nouveauxClients} en attente
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clients.filter(c => !c.gestionnaireId).slice(0, 5).map(client => (
                <div key={client.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <Avatar className="w-9 h-9 border border-border">
                    <AvatarImage src={client.type !== 'entreprise' ? (client as any).avatar : undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {client.type !== 'entreprise' 
                        ? getInitials((client as any).nom, (client as any).prenom)
                        : 'E'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {client.type !== 'entreprise' 
                        ? `${(client as any).prenom} ${(client as any).nom}`
                        : 'Entreprise'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client.type === 'salarie' ? 'Salarié' : client.type === 'independant' ? 'Indépendant' : 'Entreprise'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Assigner
                  </Button>
                </div>
              ))}
              {nouveauxClients === 0 && (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Aucun client en attente
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
