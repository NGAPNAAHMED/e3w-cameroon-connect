import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { useDossiers } from '@/hooks/useDossiers';
import { supabase } from '@/integrations/supabase/client';
import COIRadarChart from '@/components/coi/COIRadarChart';
import COIScoreCard from '@/components/coi/COIScoreCard';
import COIIndicators from '@/components/coi/COIIndicators';
import COIAnalysisNote from '@/components/coi/COIAnalysisNote';
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
  Brain,
  Search,
  Target,
  BarChart3,
  Send,
  Loader2,
} from 'lucide-react';
import { clients, companies, staff, Client, ClientSalarie, ClientIndependant } from '@/data/mockData';
import { formatXAF, getInitials, formatDuree } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const motifsRenvoi = [
  { id: 'garantie', label: 'Garantie insuffisante' },
  { id: 'piece', label: 'Pièce illisible ou manquante' },
  { id: 'revenus', label: 'Revenus faibles' },
  { id: 'dossier', label: 'Dossier incomplet' },
  { id: 'endettement', label: 'Taux d\'endettement élevé' },
  { id: 'beac', label: 'Risque BEAC défavorable' },
  { id: 'autre', label: 'Autre motif' },
];

export default function AdminComite() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { dossiers, loading, updateDossierStatus, fetchHistory } = useDossiers();
  const [motifRenvoi, setMotifRenvoi] = useState('');
  const [detailsRenvoi, setDetailsRenvoi] = useState('');
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('transmis');

  // Filter dossiers by status
  const transmittedDossiers = dossiers.filter(d => d.status === 'transmis');
  const approvedDossiers = dossiers.filter(d => d.status === 'approuve');
  const rejectedDossiers = dossiers.filter(d => d.status === 'refuse');

  const filteredDossiers = transmittedDossiers.filter(d => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return d.client_id?.toLowerCase().includes(query) || 
           d.id.toLowerCase().includes(query);
  });

  const handleApprove = async (dossierId: string) => {
    try {
      await updateDossierStatus(dossierId, 'approuve');
      
      addNotification({
        title: "Dossier approuvé",
        message: `Le crédit a été validé par le comité`,
        type: "success"
      });
      
      toast({
        title: "Dossier approuvé",
        description: "Le crédit a été validé par le comité",
      });
    } catch (error) {
      console.error('Error approving dossier:', error);
    }
  };

  const handleReject = async () => {
    if (!motifRenvoi || !selectedDossier) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un motif de renvoi",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const motif = motifsRenvoi.find(m => m.id === motifRenvoi)?.label;
      
      await updateDossierStatus(selectedDossier.id, 'refuse', {
        motif,
        details: detailsRenvoi
      });
      
      addNotification({
        title: "Dossier renvoyé",
        message: `Dossier renvoyé au gestionnaire - Motif: ${motif}`,
        type: "warning",
      });
      
      toast({
        title: "Dossier renvoyé",
        description: "Le dossier a été renvoyé au gestionnaire",
      });
      
      setSelectedDossier(null);
      setMotifRenvoi('');
      setDetailsRenvoi('');
    } catch (error) {
      console.error('Error rejecting dossier:', error);
    }
  };

  const handleViewDetail = (dossier: any) => {
    setSelectedDossier(dossier);
    setShowDetailDialog(true);
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'favorable': return 'text-success';
      case 'defavorable': return 'text-destructive';
      default: return 'text-warning';
    }
  };

  const getDecisionBg = (decision: string) => {
    switch (decision) {
      case 'favorable': return 'bg-success/20';
      case 'defavorable': return 'bg-destructive/20';
      default: return 'bg-warning/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Comité de Crédit</h1>
          <p className="text-muted-foreground">Validation des dossiers de crédit</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2 text-warning border-warning">
            {transmittedDossiers.length} en attente
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2 text-success border-success">
            {approvedDossiers.length} approuvés
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">En attente</p>
                <p className="text-2xl font-bold text-warning">{transmittedDossiers.length}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Approuvés</p>
                <p className="text-2xl font-bold text-success">{approvedDossiers.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Rejetés</p>
                <p className="text-2xl font-bold text-destructive">{rejectedDossiers.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Taux approbation</p>
                <p className="text-2xl font-bold text-primary">
                  {approvedDossiers.length + rejectedDossiers.length > 0 
                    ? Math.round((approvedDossiers.length / (approvedDossiers.length + rejectedDossiers.length)) * 100)
                    : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un dossier..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10 input-dark"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="transmis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="w-4 h-4 mr-2" />
            À traiter ({transmittedDossiers.length})
          </TabsTrigger>
          <TabsTrigger value="approuves" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approuvés ({approvedDossiers.length})
          </TabsTrigger>
          <TabsTrigger value="rejetes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <XCircle className="w-4 h-4 mr-2" />
            Rejetés ({rejectedDossiers.length})
          </TabsTrigger>
        </TabsList>

        {/* Dossiers à traiter */}
        <TabsContent value="transmis" className="space-y-4">
          {filteredDossiers.length > 0 ? (
            <div className="grid gap-4">
              {filteredDossiers.map(dossier => {
                const rec = dossier.ai_recommendation as any;
                return (
                  <Card key={dossier.id} className="glass-card">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center", getDecisionBg(rec?.decision || ''))}>
                          {rec?.decision === 'favorable' && <CheckCircle2 className="w-7 h-7 text-success" />}
                          {rec?.decision === 'defavorable' && <XCircle className="w-7 h-7 text-destructive" />}
                          {rec?.decision === 'reserve' && <AlertTriangle className="w-7 h-7 text-warning" />}
                          {!rec?.decision && <Brain className="w-7 h-7 text-primary" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg">Dossier #{dossier.id.slice(0, 8)}</h3>
                            <Badge variant="outline">Client: {dossier.client_id?.slice(0, 8)}</Badge>
                            {rec?.decision && (
                              <Badge className={cn("capitalize", getDecisionBg(rec.decision), getDecisionColor(rec.decision))}>
                                IA: {rec.decision}
                              </Badge>
                            )}
                            <Badge variant="outline">{dossier.classe_risque || 'N/A'}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="font-semibold text-primary number-format">
                              {formatXAF(dossier.montant)}
                            </span>
                            <span>{dossier.duree} mois</span>
                            <span>Score: <strong className="text-foreground">{dossier.score_global || 0}/100</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={() => handleViewDetail(dossier)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Analyser
                          </Button>
                          <Button variant="gold" onClick={() => handleApprove(dossier.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approuver
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => setSelectedDossier(dossier)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rejeter
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="w-5 h-5 text-warning" />
                                  Rejeter le dossier
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <p className="text-sm text-muted-foreground">
                                  Ce dossier sera renvoyé au gestionnaire pour correction.
                                </p>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Motif du rejet *</label>
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

                                <div className="flex gap-2">
                                  <DialogClose asChild>
                                    <Button variant="outline" className="flex-1">Annuler</Button>
                                  </DialogClose>
                                  <Button 
                                    variant="destructive" 
                                    className="flex-1"
                                    onClick={handleReject}
                                    disabled={!motifRenvoi}
                                  >
                                    Confirmer le rejet
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
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-success" />
                <h3 className="text-lg font-semibold mb-2">Aucun dossier en attente</h3>
                <p className="text-muted-foreground">Tous les dossiers ont été traités</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dossiers approuvés */}
        <TabsContent value="approuves" className="space-y-4">
          {approvedDossiers.length > 0 ? (
            <div className="grid gap-4">
              {approvedDossiers.map(dossier => (
                <Card key={dossier.id} className="glass-card border-success/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-success/20">
                        <CheckCircle2 className="w-7 h-7 text-success" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">Dossier #{dossier.id.slice(0, 8)}</h3>
                          <Badge className="bg-success/20 text-success">Approuvé</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-semibold text-primary number-format">
                            {formatXAF(dossier.montant)}
                          </span>
                          <span>{dossier.duree} mois</span>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => handleViewDetail(dossier)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <FolderKanban className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Aucun dossier approuvé</h3>
                <p className="text-muted-foreground">Les dossiers approuvés apparaîtront ici</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dossiers rejetés */}
        <TabsContent value="rejetes" className="space-y-4">
          {rejectedDossiers.length > 0 ? (
            <div className="grid gap-4">
              {rejectedDossiers.map(dossier => (
                <Card key={dossier.id} className="glass-card border-destructive/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-destructive/20">
                        <XCircle className="w-7 h-7 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">Dossier #{dossier.id.slice(0, 8)}</h3>
                          <Badge className="bg-destructive/20 text-destructive">Rejeté</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-semibold text-primary number-format">
                            {formatXAF(dossier.montant)}
                          </span>
                          <span>{dossier.duree} mois</span>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => handleViewDetail(dossier)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <FolderKanban className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Aucun dossier rejeté</h3>
                <p className="text-muted-foreground">Les dossiers rejetés apparaîtront ici</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Analyse COI - Dossier #{selectedDossier?.id?.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDossier && selectedDossier.analysis_data && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <COIScoreCard 
                  score={selectedDossier.score_global || 0} 
                  classeRisque={selectedDossier.classe_risque || 'N/A'}
                  recommendation={(selectedDossier.ai_recommendation as any)?.decision}
                />
                <COIRadarChart scores={(selectedDossier.analysis_data as any)?.scores || {}} />
              </div>
              
              <COIIndicators 
                indicateurs={((selectedDossier.analysis_data as any)?.indicateurs || []).map((ind: any) => ({
                  ...ind,
                  seuil: '-'
                }))} 
                conformiteCobac={(selectedDossier.analysis_data as any)?.conformite_cobac}
              />
              
              <COIAnalysisNote analysis={selectedDossier.analysis_data} />
              
              {selectedDossier.gestionnaire_remarks && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Remarques du gestionnaire
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedDossier.gestionnaire_remarks}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {selectedDossier && !selectedDossier.analysis_data && (
            <div className="py-12 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune analyse IA disponible pour ce dossier</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Fermer
            </Button>
            {selectedDossier?.status === 'transmis' && (
              <>
                <Button variant="gold" onClick={() => {
                  handleApprove(selectedDossier.id);
                  setShowDetailDialog(false);
                }}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approuver
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
