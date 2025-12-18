import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  Users,
  RefreshCcw,
  Phone,
  Mail,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { staff, clients, companies, Client, ClientSalarie, ClientIndependant } from '@/data/mockData';
import { getInitials } from '@/lib/formatters';

export default function AdminGestionnaires() {
  const [selectedGestionnaire, setSelectedGestionnaire] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [targetManager, setTargetManager] = useState('');

  const gestionnaires = staff.filter(s => s.role === 'gestionnaire');

  const getClientsForManager = (managerId: string) => {
    return clients.filter(c => c.gestionnaireId === managerId);
  };

  const getClientName = (client: Client) => {
    if (client.type !== 'entreprise') {
      const c = client as ClientSalarie | ClientIndependant;
      return `${c.prenom} ${c.nom}`;
    }
    const company = companies.find(co => co.id === (client as any).companyId);
    return company?.name || 'Entreprise';
  };

  const handleTransfer = () => {
    if (!selectedClient || !targetManager) return;
    
    const manager = gestionnaires.find(g => g.id === targetManager);
    toast({
      title: "Client transféré",
      description: `Le client a été transféré à ${manager?.prenom} ${manager?.nom}`,
    });
    setSelectedClient(null);
    setTargetManager('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display">Gestionnaires</h1>
        <p className="text-muted-foreground">Gérez l'équipe et les portefeuilles clients</p>
      </div>

      {/* Gestionnaires Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {gestionnaires.map(g => {
          const managerClients = getClientsForManager(g.id);
          const maxClients = 50;
          const percentage = (managerClients.length / maxClients) * 100;
          const isSelected = selectedGestionnaire === g.id;

          return (
            <Card 
              key={g.id} 
              className={`glass-card cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedGestionnaire(isSelected ? null : g.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-14 h-14 border-2 border-primary/30">
                    <AvatarImage src={g.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {getInitials(g.nom, g.prenom)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{g.prenom} {g.nom}</h3>
                    <Badge variant="outline">Gestionnaire</Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {g.telephone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {g.email}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Charge de travail</span>
                    <span className="font-medium">{managerClients.length} / {maxClients}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>

                {isSelected && (
                  <Button variant="outline" className="w-full mt-4">
                    Voir portefeuille
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Manager's Portfolio */}
      {selectedGestionnaire && (
        <Card className="glass-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Portefeuille de {gestionnaires.find(g => g.id === selectedGestionnaire)?.prenom}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getClientsForManager(selectedGestionnaire).slice(0, 10).map(client => {
                const clientName = getClientName(client);
                const avatar = client.type !== 'entreprise' ? (client as any).avatar : undefined;

                return (
                  <div key={client.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <Avatar className="w-10 h-10 border border-border">
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="text-xs">
                        {client.type !== 'entreprise' 
                          ? getInitials((client as any).nom, (client as any).prenom)
                          : 'E'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{clientName}</p>
                        {client.kycComplete && (
                          <CheckCircle2 className="w-4 h-4 text-info" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {client.type === 'salarie' ? 'Salarié' : client.type === 'independant' ? 'Indépendant' : 'Entreprise'}
                      </p>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                          }}
                        >
                          <RefreshCcw className="w-4 h-4 mr-2" />
                          Transférer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Transférer le client</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <p className="text-sm text-muted-foreground">
                            Transférer <strong>{clientName}</strong> vers un autre gestionnaire
                          </p>
                          
                          <Select value={targetManager} onValueChange={setTargetManager}>
                            <SelectTrigger className="input-dark">
                              <SelectValue placeholder="Sélectionner un gestionnaire" />
                            </SelectTrigger>
                            <SelectContent>
                              {gestionnaires
                                .filter(g => g.id !== selectedGestionnaire)
                                .map(g => (
                                  <SelectItem key={g.id} value={g.id}>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarImage src={g.avatar} />
                                        <AvatarFallback className="text-xs">
                                          {getInitials(g.nom, g.prenom)}
                                        </AvatarFallback>
                                      </Avatar>
                                      {g.prenom} {g.nom}
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          <Button 
                            variant="gold" 
                            className="w-full"
                            onClick={handleTransfer}
                            disabled={!targetManager}
                          >
                            Confirmer le transfert
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
