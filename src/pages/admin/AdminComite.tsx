import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
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
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import { clients, companies, staff, Client, ClientSalarie, ClientIndependant } from '@/data/mockData';
import { formatXAF, getInitials, formatDuree } from '@/lib/formatters';

const motifsRenvoi = [
  { id: 'garantie', label: 'Garantie insuffisante' },
  { id: 'piece', label: 'Pièce illisible ou manquante' },
  { id: 'revenus', label: 'Revenus faibles' },
  { id: 'dossier', label: 'Dossier incomplet' },
  { id: 'endettement', label: 'Taux d\'endettement élevé' },
  { id: 'beac', label: 'Risque BEAC défavorable' },
  { id: 'autre', label: 'Autre motif' },
];

// Mock dossiers en comité
const initialDossiers = [
  {
    id: 'd1',
    clientId: 'sal_1',
    gestionnaireId: 's2',
    montant: 5000000,
    type: 'Crédit Consommation',
    duree: 24,
    taux: 12,
    mensualite: 235000,
    dateDepot: '2024-01-15',
    garantie: 'Caution personnelle - Jean Atangana',
    statut: 'en_attente',
  },
  {
    id: 'd2',
    clientId: 'ind_1',
    gestionnaireId: 's3',
    montant: 15000000,
    type: 'Crédit Immobilier',
    duree: 60,
    taux: 7.5,
    mensualite: 298000,
    dateDepot: '2024-01-14',
    garantie: 'Titre foncier - TF/YDE/2020/1234',
    statut: 'en_attente',
  },
  {
    id: 'd3',
    clientId: 'sal_3',
    gestionnaireId: 's2',
    montant: 2000000,
    type: 'Crédit Scolaire',
    duree: 12,
    taux: 8.5,
    mensualite: 175000,
    dateDepot: '2024-01-13',
    garantie: 'Caution solidaire employeur',
    statut: 'en_attente',
  },
];

export default function AdminComite() {
  const { addNotification } = useNotifications();
  const [dossiers, setDossiers] = useState(initialDossiers);
  const [motifRenvoi, setMotifRenvoi] = useState('');
  const [detailsRenvoi, setDetailsRenvoi] = useState('');
  const [selectedDossier, setSelectedDossier] = useState<typeof initialDossiers[0] | null>(null);

  const getClientInfo = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return null;
    
    if (client.type !== 'entreprise') {
      const c = client as ClientSalarie | ClientIndependant;
      return {
        name: `${c.prenom} ${c.nom}`,
        avatar: c.avatar,
        type: client.type,
        telephone: c.telephone,
        email: c.email,
        details: client.type === 'salarie' 
          ? { employeur: companies.find(co => co.id === (client as ClientSalarie).employeurId)?.name, revenu: (client as ClientSalarie).revenuNet }
          : { activite: (client as ClientIndependant).activite, ca: (client as ClientIndependant).chiffreAffaires },
      };
    }
    
    const company = companies.find(co => co.id === (client as any).companyId);
    return {
      name: company?.name || 'Entreprise',
      avatar: company?.logo,
      type: 'entreprise',
      telephone: client.telephone,
      email: client.email,
      details: { secteur: company?.secteur, responsable: company?.responsable },
    };
  };

  const getManager = (managerId: string) => staff.find(s => s.id === managerId);

  const handleApprove = (dossierId: string) => {
    const dossier = dossiers.find(d => d.id === dossierId);
    const clientInfo = getClientInfo(dossier!.clientId);
    const manager = getManager(dossier!.gestionnaireId);
    
    setDossiers(prev => prev.filter(d => d.id !== dossierId));
    
    addNotification({
      title: "Dossier approuvé",
      message: `Le crédit de ${clientInfo?.name} (${formatXAF(dossier!.montant)}) a été validé`,
      type: "success"
    });
    
    // Notification to manager
    addNotification({
      title: "Validation comité",
      message: `Dossier ${clientInfo?.name} approuvé - Préparez le décaissement`,
      type: "success",
      link: "/dashboard/dossiers"
    });
    
    toast({
      title: "Dossier approuvé",
      description: "Le crédit a été validé par le comité",
    });
  };

  const handleReject = () => {
    if (!motifRenvoi || !selectedDossier) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un motif de renvoi",
        variant: "destructive",
      });
      return;
    }
    
    const clientInfo = getClientInfo(selectedDossier.clientId);
    const manager = getManager(selectedDossier.gestionnaireId);
    const motif = motifsRenvoi.find(m => m.id === motifRenvoi)?.label;
    
    setDossiers(prev => prev.filter(d => d.id !== selectedDossier.id));
    
    addNotification({
      title: "Dossier renvoyé",
      message: `Dossier ${clientInfo?.name} renvoyé à ${manager?.prenom} - Motif: ${motif}`,
      type: "warning",
      link: "/dashboard/gestionnaires"
    });
    
    toast({
      title: "Dossier renvoyé",
      description: `Le dossier a été renvoyé au gestionnaire`,
    });
    
    setSelectedDossier(null);
    setMotifRenvoi('');
    setDetailsRenvoi('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Dossiers à Analyser</h1>
          <p className="text-muted-foreground">Validez ou renvoyez les dossiers de crédit</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2 text-info border-info">
          {dossiers.length} dossiers en attente
        </Badge>
      </div>

      {/* Dossiers List */}
      <div className="grid gap-4">
        {dossiers.map(dossier => {
          const clientInfo = getClientInfo(dossier.clientId);
          const manager = getManager(dossier.gestionnaireId);

          return (
            <Card key={dossier.id} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14 border border-border">
                    <AvatarImage src={clientInfo?.avatar} />
                    <AvatarFallback className="bg-muted">
                      {clientInfo?.type !== 'entreprise' 
                        ? getInitials(clientInfo?.name?.split(' ')[1] || '', clientInfo?.name?.split(' ')[0] || '')
                        : 'E'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{clientInfo?.name}</h3>
                      <Badge variant="outline">{dossier.type}</Badge>
                      <Badge className="bg-warning/20 text-warning">En attente</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Montant</span>
                        <p className="font-semibold text-primary number-format">{formatXAF(dossier.montant)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Durée</span>
                        <p className="font-medium">{dossier.duree} mois</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mensualité</span>
                        <p className="font-medium number-format">{formatXAF(dossier.mensualite)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gestionnaire</span>
                        <p className="font-medium">{manager?.prenom} {manager?.nom}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date dépôt</span>
                        <p className="font-medium">{dossier.dateDepot}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* View Details */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Analyse du Dossier - {clientInfo?.name}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <Tabs defaultValue="client" className="mt-4">
                          <TabsList className="w-full">
                            <TabsTrigger value="client" className="flex-1">Client</TabsTrigger>
                            <TabsTrigger value="credit" className="flex-1">Crédit</TabsTrigger>
                            <TabsTrigger value="garanties" className="flex-1">Garanties</TabsTrigger>
                            <TabsTrigger value="risques" className="flex-1">Risques</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="client" className="space-y-4 mt-4">
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                              <Avatar className="w-16 h-16 border-2 border-primary/30">
                                <AvatarImage src={clientInfo?.avatar} />
                                <AvatarFallback className="bg-primary/20 text-primary">
                                  {clientInfo?.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-lg">{clientInfo?.name}</h3>
                                <Badge variant="outline" className="mt-1">
                                  {clientInfo?.type === 'salarie' ? 'Salarié' : clientInfo?.type === 'independant' ? 'Indépendant' : 'Entreprise'}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <Card className="bg-muted/30">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <span className="text-sm text-muted-foreground">Téléphone</span>
                                  </div>
                                  <p className="font-medium">{clientInfo?.telephone}</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-muted/30">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span className="text-sm text-muted-foreground">Email</span>
                                  </div>
                                  <p className="font-medium">{clientInfo?.email}</p>
                                </CardContent>
                              </Card>
                              {clientInfo?.type === 'salarie' && (
                                <>
                                  <Card className="bg-muted/30">
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="w-4 h-4 text-primary" />
                                        <span className="text-sm text-muted-foreground">Employeur</span>
                                      </div>
                                      <p className="font-medium">{clientInfo.details.employeur}</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="bg-muted/30">
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                        <span className="text-sm text-muted-foreground">Revenu Net</span>
                                      </div>
                                      <p className="font-semibold text-primary number-format">{formatXAF(clientInfo.details.revenu)}</p>
                                    </CardContent>
                                  </Card>
                                </>
                              )}
                              {clientInfo?.type === 'independant' && (
                                <>
                                  <Card className="bg-muted/30">
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Briefcase className="w-4 h-4 text-primary" />
                                        <span className="text-sm text-muted-foreground">Activité</span>
                                      </div>
                                      <p className="font-medium">{clientInfo.details.activite}</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="bg-muted/30">
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                        <span className="text-sm text-muted-foreground">Chiffre d'Affaires</span>
                                      </div>
                                      <p className="font-semibold text-primary number-format">{formatXAF(clientInfo.details.ca)}</p>
                                    </CardContent>
                                  </Card>
                                </>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="credit" className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <Card className="bg-primary/10 border-primary/30">
                                <CardContent className="p-4 text-center">
                                  <p className="text-2xl font-bold text-primary number-format">{formatXAF(dossier.montant)}</p>
                                  <p className="text-sm text-muted-foreground">Montant demandé</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-muted/30">
                                <CardContent className="p-4 text-center">
                                  <p className="text-2xl font-bold">{dossier.duree} mois</p>
                                  <p className="text-sm text-muted-foreground">Durée</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-muted/30">
                                <CardContent className="p-4 text-center">
                                  <p className="text-2xl font-bold">{dossier.taux}%</p>
                                  <p className="text-sm text-muted-foreground">Taux d'intérêt</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-muted/30">
                                <CardContent className="p-4 text-center">
                                  <p className="text-2xl font-bold number-format">{formatXAF(dossier.mensualite)}</p>
                                  <p className="text-sm text-muted-foreground">Mensualité</p>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <Card className="bg-muted/30">
                              <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground mb-1">Type de crédit</p>
                                <p className="font-semibold">{dossier.type}</p>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          
                          <TabsContent value="garanties" className="mt-4">
                            <Card className="bg-muted/30">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Shield className="w-5 h-5 text-primary" />
                                  <span className="font-semibold">Garantie proposée</span>
                                </div>
                                <p className="text-muted-foreground">{dossier.garantie}</p>
                              </CardContent>
                            </Card>
                            
                            <div className="mt-4 p-4 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                              <FileText className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm">Documents joints: Acte de caution, CNI...</p>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="risques" className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <Card className="bg-success/10 border-success/30">
                                <CardContent className="p-4 text-center">
                                  <p className="text-3xl font-bold text-success">A</p>
                                  <p className="text-sm text-muted-foreground">Score Interne</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-success/10 border-success/30">
                                <CardContent className="p-4 text-center">
                                  <p className="text-3xl font-bold text-success">A</p>
                                  <p className="text-sm text-muted-foreground">Score BEAC</p>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <Card className="bg-muted/30">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-muted-foreground">Taux d'endettement</span>
                                  <span className="font-semibold text-success">28%</span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full w-[28%] bg-success rounded-full" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Seuil maximum: 33%</p>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>

                    {/* Approve */}
                    <Button 
                      variant="gold" 
                      size="sm"
                      onClick={() => handleApprove(dossier.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approuver
                    </Button>

                    {/* Reject Dialog */}
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
                          <p className="text-sm text-muted-foreground">
                            Ce dossier sera renvoyé à <strong>{manager?.prenom} {manager?.nom}</strong> pour correction.
                          </p>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Motif du renvoi *</label>
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
                              placeholder="Précisez les éléments à corriger ou à fournir..."
                              className="input-dark min-h-24"
                            />
                          </div>

                          <div className="flex gap-2">
                            <DialogClose asChild>
                              <Button variant="outline" className="flex-1">
                                Annuler
                              </Button>
                            </DialogClose>
                            <Button 
                              variant="destructive" 
                              className="flex-1"
                              onClick={handleReject}
                              disabled={!motifRenvoi}
                            >
                              Confirmer le renvoi
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {dossiers.length === 0 && (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-success" />
              <p className="text-lg font-semibold">Tous les dossiers ont été traités</p>
              <p className="text-muted-foreground">Aucun dossier en attente de validation</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
