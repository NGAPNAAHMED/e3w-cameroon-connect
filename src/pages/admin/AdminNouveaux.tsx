import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  Search,
  UserPlus,
  Users,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { clients, staff, companies, Client, ClientSalarie, ClientIndependant } from '@/data/mockData';
import { getInitials } from '@/lib/formatters';

export default function AdminNouveaux() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedManager, setSelectedManager] = useState('');

  const gestionnaires = staff.filter(s => s.role === 'gestionnaire');
  const nouveauxClients = clients.filter(c => !c.gestionnaireId);

  const filteredClients = nouveauxClients.filter(client => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (client.type !== 'entreprise') {
      const c = client as ClientSalarie | ClientIndependant;
      return c.nom.toLowerCase().includes(query) || c.prenom.toLowerCase().includes(query);
    }
    const company = companies.find(co => co.id === (client as any).companyId);
    return company?.name.toLowerCase().includes(query);
  });

  const handleAssign = () => {
    if (!selectedClient || !selectedManager) return;
    
    const manager = gestionnaires.find(g => g.id === selectedManager);
    toast({
      title: "Client assigné",
      description: `Le client a été assigné à ${manager?.prenom} ${manager?.nom}`,
    });
    setSelectedClient(null);
    setSelectedManager('');
  };

  const getClientName = (client: Client) => {
    if (client.type !== 'entreprise') {
      const c = client as ClientSalarie | ClientIndependant;
      return `${c.prenom} ${c.nom}`;
    }
    const company = companies.find(co => co.id === (client as any).companyId);
    return company?.name || 'Entreprise';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Nouveaux Inscrits</h1>
          <p className="text-muted-foreground">Clients en attente d'assignation à un gestionnaire</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2 text-warning border-warning">
          {nouveauxClients.length} en attente
        </Badge>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-dark"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="grid gap-4">
        {filteredClients.map(client => {
          const clientName = getClientName(client);
          const avatar = client.type !== 'entreprise' ? (client as any).avatar : undefined;
          
          return (
            <Card key={client.id} className="glass-card hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border border-border">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {client.type !== 'entreprise' 
                        ? getInitials((client as any).nom, (client as any).prenom)
                        : 'E'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{clientName}</p>
                      {client.kycComplete && (
                        <CheckCircle2 className="w-4 h-4 text-info" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{client.type === 'salarie' ? 'Salarié' : client.type === 'independant' ? 'Indépendant' : 'Entreprise'}</span>
                      <span>{client.telephone}</span>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="gold"
                        onClick={() => setSelectedClient(client)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assigner
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assigner à un gestionnaire</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <p className="text-sm text-muted-foreground">
                          Choisissez le gestionnaire pour <strong>{clientName}</strong>
                        </p>
                        
                        <Select value={selectedManager} onValueChange={setSelectedManager}>
                          <SelectTrigger className="input-dark">
                            <SelectValue placeholder="Sélectionner un gestionnaire" />
                          </SelectTrigger>
                          <SelectContent>
                            {gestionnaires.map(g => (
                              <SelectItem key={g.id} value={g.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={g.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {getInitials(g.nom, g.prenom)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {g.prenom} {g.nom} ({g.charge || 0} clients)
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button 
                          variant="gold" 
                          className="w-full"
                          onClick={handleAssign}
                          disabled={!selectedManager}
                        >
                          Confirmer l'assignation
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredClients.length === 0 && (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucun client en attente d'assignation</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
