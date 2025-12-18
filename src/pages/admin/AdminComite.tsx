import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  FolderKanban,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  AlertTriangle,
  FileText,
  CreditCard,
  Shield,
} from 'lucide-react';
import { clients, companies, staff, Client, ClientSalarie, ClientIndependant } from '@/data/mockData';
import { formatXAF, getInitials } from '@/lib/formatters';

const motifsRenvoi = [
  { id: 'garantie', label: 'Garantie insuffisante' },
  { id: 'piece', label: 'Pièce illisible ou manquante' },
  { id: 'revenus', label: 'Revenus faibles' },
  { id: 'dossier', label: 'Dossier incomplet' },
  { id: 'autre', label: 'Autre motif' },
];

// Mock dossiers en comité
const dossiersComite = [
  {
    id: 'd1',
    clientId: 'sal_1',
    gestionnaireId: 's2',
    montant: 5000000,
    type: 'Crédit Consommation',
    dateDepot: '2024-01-15',
    statut: 'en_attente',
  },
  {
    id: 'd2',
    clientId: 'ind_1',
    gestionnaireId: 's3',
    montant: 15000000,
    type: 'Crédit Immobilier',
    dateDepot: '2024-01-14',
    statut: 'en_attente',
  },
  {
    id: 'd3',
    clientId: 'sal_3',
    gestionnaireId: 's2',
    montant: 2000000,
    type: 'Crédit Scolaire',
    dateDepot: '2024-01-13',
    statut: 'en_attente',
  },
];

export default function AdminComite() {
  const [selectedDossier, setSelectedDossier] = useState<typeof dossiersComite[0] | null>(null);
  const [motifRenvoi, setMotifRenvoi] = useState('');
  const [detailsRenvoi, setDetailsRenvoi] = useState('');

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return 'Client inconnu';
    if (client.type !== 'entreprise') {
      const c = client as ClientSalarie | ClientIndependant;
      return `${c.prenom} ${c.nom}`;
    }
    const company = companies.find(co => co.id === (client as any).companyId);
    return company?.name || 'Entreprise';
  };

  const getManager = (managerId: string) => {
    return staff.find(s => s.id === managerId);
  };

  const getClient = (clientId: string) => {
    return clients.find(c => c.id === clientId);
  };

  const handleApprove = (dossierId: string) => {
    toast({
      title: "Dossier approuvé",
      description: "Le crédit a été validé par le comité",
    });
  };

  const handleReject = () => {
    if (!motifRenvoi) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un motif de renvoi",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Dossier renvoyé",
      description: "Le dossier a été renvoyé au gestionnaire",
    });
    setSelectedDossier(null);
    setMotifRenvoi('');
    setDetailsRenvoi('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Comité de Crédit</h1>
          <p className="text-muted-foreground">Validez ou renvoyez les dossiers soumis</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2 text-info border-info">
          {dossiersComite.length} dossiers
        </Badge>
      </div>

      {/* Dossiers List */}
      <div className="grid gap-4">
        {dossiersComite.map(dossier => {
          const client = getClient(dossier.clientId);
          const manager = getManager(dossier.gestionnaireId);
          const clientName = getClientName(dossier.clientId);
          const avatar = client?.type !== 'entreprise' ? (client as any)?.avatar : undefined;

          return (
            <Card key={dossier.id} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14 border border-border">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="bg-muted">
                      {client?.type !== 'entreprise' 
                        ? getInitials((client as any)?.nom || '', (client as any)?.prenom || '')
                        : 'E'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{clientName}</h3>
                      <Badge variant="outline">{dossier.type}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Montant</span>
                        <p className="font-semibold text-primary number-format">{formatXAF(dossier.montant)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gestionnaire</span>
                        <p className="font-medium">{manager?.prenom} {manager?.nom}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date dépôt</span>
                        <p className="font-medium">{dossier.dateDepot}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Statut</span>
                        <Badge className="bg-warning/20 text-warning">En attente</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Détails du dossier</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-muted/50">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium">Client</span>
                                </div>
                                <p className="font-semibold">{clientName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {client?.type === 'salarie' ? 'Salarié' : client?.type === 'independant' ? 'Indépendant' : 'Entreprise'}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted/50">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <CreditCard className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium">Crédit</span>
                                </div>
                                <p className="font-semibold number-format">{formatXAF(dossier.montant)}</p>
                                <p className="text-sm text-muted-foreground">{dossier.type}</p>
                              </CardContent>
                            </Card>
                          </div>
                          <Card className="bg-muted/50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">Garanties</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Garantie personnelle - Caution solidaire
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="gold" 
                      size="sm"
                      onClick={() => handleApprove(dossier.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approuver
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setSelectedDossier(dossier)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Renvoyer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-warning" />
                            Renvoyer le dossier
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Motif du renvoi</label>
                            <Select value={motifRenvoi} onValueChange={setMotifRenvoi}>
                              <SelectTrigger className="input-dark">
                                <SelectValue placeholder="Sélectionner un motif" />
                              </SelectTrigger>
                              <SelectContent>
                                {motifsRenvoi.map(m => (
                                  <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Détails / Instructions</label>
                            <Textarea
                              value={detailsRenvoi}
                              onChange={(e) => setDetailsRenvoi(e.target.value)}
                              placeholder="Précisez les éléments à corriger..."
                              className="input-dark min-h-24"
                            />
                          </div>

                          <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={handleReject}
                          >
                            Confirmer le renvoi
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {dossiersComite.length === 0 && (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucun dossier en attente de validation</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
