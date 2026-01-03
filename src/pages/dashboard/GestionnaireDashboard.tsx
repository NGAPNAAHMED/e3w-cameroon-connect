import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDossiers } from '@/hooks/useDossiers';
import { toast } from '@/hooks/use-toast';
import {
  Search,
  Users,
  Building2,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Clock,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Phone,
  Plus,
  Brain,
  Send,
  Loader2,
} from 'lucide-react';
import { clients, companies, Client, ClientSalarie, ClientIndependant, ClientEntreprise } from '@/data/mockData';
import { formatXAF, getInitials } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export default function GestionnaireDashboard() {
  const navigate = useNavigate();
  const { dossiers, loading, addToPanier } = useDossiers();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tous');

  // Filter clients assigned to current gestionnaire (Ahmed - s2)
  const myClients = clients.filter(c => c.gestionnaireId === 's2');
  
  const filteredClients = myClients.filter(client => {
    // Tab filter
    if (activeTab !== 'tous' && client.type !== activeTab) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (client.type === 'salarie' || client.type === 'independant') {
        return (
          client.nom.toLowerCase().includes(query) ||
          client.prenom.toLowerCase().includes(query) ||
          client.telephone.includes(query)
        );
      } else {
        const company = companies.find(c => c.id === client.companyId);
        return (
          company?.name.toLowerCase().includes(query) ||
          company?.sigle.toLowerCase().includes(query)
        );
      }
    }
    return true;
  });

  // Stats from real dossiers
  const panierCount = dossiers.filter(d => d.status === 'panier').length;
  const analyseCount = dossiers.filter(d => d.status === 'analyse').length;
  const transmisCount = dossiers.filter(d => d.status === 'transmis').length;

  const stats = {
    total: myClients.length,
    enCours: myClients.filter(c => c.statut === 'en_cours').length,
    panier: panierCount,
    kycComplet: myClients.filter(c => c.kycComplete).length,
  };

  const handleClientClick = (client: Client) => {
    navigate(`/dashboard/cockpit/${client.id}`);
  };

  const renderClientRow = (client: Client) => {
    if (client.type === 'salarie') {
      const salarie = client as ClientSalarie;
      const employeur = companies.find(c => c.id === salarie.employeurId);
      return (
        <tr 
          key={client.id} 
          className="table-row-hover cursor-pointer"
          onClick={() => handleClientClick(client)}
        >
          <td className="p-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-border">
                <AvatarImage src={salarie.avatar} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {getInitials(salarie.nom, salarie.prenom)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{salarie.prenom} {salarie.nom}</p>
                <p className="text-xs text-muted-foreground">{salarie.fonction}</p>
              </div>
            </div>
          </td>
          <td className="p-3">
            <div className="flex items-center gap-2">
              {employeur?.logo ? (
                <img src={employeur.logo} alt={employeur.sigle} className="w-6 h-6 object-contain" />
              ) : (
                <Building2 className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-sm">{employeur?.sigle || 'N/A'}</span>
            </div>
          </td>
          <td className="p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              {salarie.telephone}
            </div>
          </td>
          <td className="p-3">
            <span className="text-sm font-medium number-format">{formatXAF(salarie.revenuNet)}</span>
          </td>
          <td className="p-3">
            <StatusBadge statut={client.statut} />
          </td>
          <td className="p-3">
            {client.kycComplete ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <Clock className="w-5 h-5 text-muted-foreground" />
            )}
          </td>
          <td className="p-3">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </td>
        </tr>
      );
    } else if (client.type === 'independant') {
      const independant = client as ClientIndependant;
      return (
        <tr 
          key={client.id} 
          className="table-row-hover cursor-pointer"
          onClick={() => handleClientClick(client)}
        >
          <td className="p-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-border">
                <AvatarImage src={independant.avatar} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {getInitials(independant.nom, independant.prenom)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{independant.prenom} {independant.nom}</p>
                <p className="text-xs text-muted-foreground">{independant.activite}</p>
              </div>
            </div>
          </td>
          <td className="p-3">
            <Badge variant="outline" className="text-xs">
              {independant.secteur}
            </Badge>
          </td>
          <td className="p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              {independant.telephone}
            </div>
          </td>
          <td className="p-3">
            <span className="text-sm font-medium number-format">{formatXAF(independant.chiffreAffaires)}</span>
          </td>
          <td className="p-3">
            <StatusBadge statut={client.statut} />
          </td>
          <td className="p-3">
            {client.kycComplete ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <Clock className="w-5 h-5 text-muted-foreground" />
            )}
          </td>
          <td className="p-3">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </td>
        </tr>
      );
    } else {
      const entreprise = client as ClientEntreprise;
      const company = companies.find(c => c.id === entreprise.companyId);
      return (
        <tr 
          key={client.id} 
          className="table-row-hover cursor-pointer"
          onClick={() => handleClientClick(client)}
        >
          <td className="p-3">
            <div className="flex items-center gap-3">
              {company?.logo ? (
                <img src={company.logo} alt={company.sigle} className="w-10 h-10 object-contain rounded-lg bg-background p-1" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-medium text-foreground">{company?.name}</p>
                <p className="text-xs text-muted-foreground">{company?.sigle}</p>
              </div>
            </div>
          </td>
          <td className="p-3">
            <span className="text-sm">{company?.responsable}</span>
          </td>
          <td className="p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              {entreprise.telephone}
            </div>
          </td>
          <td className="p-3">
            <Badge variant="outline" className="text-xs">{company?.secteur}</Badge>
          </td>
          <td className="p-3">
            <StatusBadge statut={client.statut} />
          </td>
          <td className="p-3">
            {client.kycComplete ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <Clock className="w-5 h-5 text-muted-foreground" />
            )}
          </td>
          <td className="p-3">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </td>
        </tr>
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Clients</p>
                <p className="text-2xl font-bold text-foreground font-display">{stats.total}</p>
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
                <p className="text-xs text-muted-foreground uppercase tracking-wider">En Cours</p>
                <p className="text-2xl font-bold text-info font-display">{stats.enCours}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Link to="/dashboard/panier" className="block">
          <Card className="glass-card hover:border-warning/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Panier</p>
                  <p className="text-2xl font-bold text-warning font-display">{stats.panier}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Analysés</p>
                <p className="text-2xl font-bold text-purple-500 font-display">{analyseCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Transmis</p>
                <p className="text-2xl font-bold text-success font-display">{transmisCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link to="/dashboard/panier">
          <Button variant="gold">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Voir le panier ({stats.panier})
          </Button>
        </Link>
        <Link to="/dashboard/agenda">
          <Button variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            Mon agenda
          </Button>
        </Link>
      </div>

      {/* Portfolio Table */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="font-display">Mon Portefeuille</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 input-dark"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50 mb-4">
              <TabsTrigger value="tous" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Tous
              </TabsTrigger>
              <TabsTrigger value="salarie" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-4 h-4 mr-2" />
                Salariés
              </TabsTrigger>
              <TabsTrigger value="independant" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Briefcase className="w-4 h-4 mr-2" />
                Indépendants
              </TabsTrigger>
              <TabsTrigger value="entreprise" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Building2 className="w-4 h-4 mr-2" />
                Entreprises
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr className="text-left">
                      <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                      <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {activeTab === 'salarie' ? 'Employeur' : activeTab === 'entreprise' ? 'Responsable' : 'Secteur'}
                      </th>
                      <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Téléphone</th>
                      <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {activeTab === 'salarie' ? 'Revenu' : activeTab === 'independant' ? 'CA' : 'Secteur'}
                      </th>
                      <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                      <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">KYC</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredClients.map(renderClientRow)}
                  </tbody>
                </table>
                {filteredClients.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun client trouvé</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ statut }: { statut: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    nouveau: { label: 'Nouveau', className: 'status-info' },
    en_cours: { label: 'En cours', className: 'status-warning' },
    panier: { label: 'Panier', className: 'bg-purple-500/20 text-purple-400' },
    comite: { label: 'Comité', className: 'bg-orange-500/20 text-orange-400' },
    approuve: { label: 'Approuvé', className: 'status-success' },
    rejete: { label: 'Rejeté', className: 'status-danger' },
  };

  const config = statusConfig[statut] || { label: statut, className: 'bg-muted text-muted-foreground' };

  return (
    <span className={cn("status-badge", config.className)}>
      {config.label}
    </span>
  );
}
