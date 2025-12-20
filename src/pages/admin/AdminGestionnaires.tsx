import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  Users,
  RefreshCcw,
  Phone,
  Mail,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  ArrowLeftRight,
} from 'lucide-react';
import { staff, clients as initialClients, companies, Client, ClientSalarie, ClientIndependant } from '@/data/mockData';
import { getInitials } from '@/lib/formatters';

export default function AdminGestionnaires() {
  const { addNotification } = useNotifications();
  const [selectedGestionnaire, setSelectedGestionnaire] = useState<string | null>(null);
  const [targetManager, setTargetManager] = useState('');
  const [clientsList, setClientsList] = useState(initialClients);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const gestionnaires = staff.filter(s => s.role === 'gestionnaire');

  const getClientsForManager = (managerId: string) => {
    return clientsList.filter(c => c.gestionnaireId === managerId);
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
    if (!selectedClient || !targetManager || !selectedGestionnaire) return;
    
    const sourceManager = gestionnaires.find(g => g.id === selectedGestionnaire);
    const destManager = gestionnaires.find(g => g.id === targetManager);
    const clientName = getClientName(selectedClient);
    
    // Update client's manager
    setClientsList(prev => prev.map(c => 
      c.id === selectedClient.id ? { ...c, gestionnaireId: targetManager } : c
    ));
    
    // Notifications
    addNotification({
      title: "Client transféré",
      message: `${clientName} transféré de ${sourceManager?.prenom} à ${destManager?.prenom}`,
      type: "warning",
      link: "/dashboard/gestionnaires"
    });
    
    // Notify source manager (loss)
    addNotification({
      title: "Client retiré",
      message: `${clientName} a été transféré à ${destManager?.prenom} ${destManager?.nom}`,
      type: "info"
    });
    
    // Notify dest manager (gain)
    addNotification({
      title: "Nouveau client",
      message: `${clientName} vous a été assigné par l'administrateur`,
      type: "success"
    });
    
    toast({
      title: "Client transféré",
      description: `${clientName} a été transféré à ${destManager?.prenom} ${destManager?.nom}`,
    });
    
    setTransferDialogOpen(false);
    setSelectedClient(null);
    setTargetManager('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display">Gestionnaires</h1>
        <p className="text-muted-foreground">Gérez l'équipe et transférez les clients entre gestionnaires</p>
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
              <Badge className="ml-2">{getClientsForManager(selectedGestionnaire).length} clients</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getClientsForManager(selectedGestionnaire).map(client => {
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

                    <Dialog open={transferDialogOpen && selectedClient?.id === client.id} onOpenChange={(open) => {
                      setTransferDialogOpen(open);
                      if (!open) {
                        setSelectedClient(null);
                        setTargetManager('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                            setTransferDialogOpen(true);
                          }}
                        >
                          <ArrowLeftRight className="w-4 h-4 mr-2" />
                          Transférer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <RefreshCcw className="w-5 h-5 text-primary" />
                            Transférer le client
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={avatar} />
                              <AvatarFallback>{clientName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{clientName}</p>
                              <p className="text-sm text-muted-foreground">
                                Actuellement chez {gestionnaires.find(g => g.id === selectedGestionnaire)?.prenom}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-center">
                            <ArrowRight className="w-6 h-6 text-primary" />
                          </div>
                          
                          <Select value={targetManager} onValueChange={setTargetManager}>
                            <SelectTrigger className="input-dark">
                              <SelectValue placeholder="Sélectionner le nouveau gestionnaire" />
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
                                      {g.prenom} {g.nom} ({getClientsForManager(g.id).length} clients)
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          <div className="flex gap-2">
                            <DialogClose asChild>
                              <Button variant="outline" className="flex-1">
                                Annuler
                              </Button>
                            </DialogClose>
                            <Button 
                              variant="gold" 
                              className="flex-1"
                              onClick={handleTransfer}
                              disabled={!targetManager}
                            >
                              Confirmer le transfert
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              })}
              
              {getClientsForManager(selectedGestionnaire).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p>Aucun client dans ce portefeuille</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
