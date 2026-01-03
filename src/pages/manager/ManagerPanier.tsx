import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useDossiers } from '@/hooks/useDossiers';
import { supabase } from '@/integrations/supabase/client';
import COIRadarChart from '@/components/coi/COIRadarChart';
import COIScoreCard from '@/components/coi/COIScoreCard';
import COIIndicators from '@/components/coi/COIIndicators';
import COIAnalysisNote from '@/components/coi/COIAnalysisNote';
import { 
  ShoppingCart, Send, Trash2, Eye, CheckCircle2, FileText, Search, Brain, 
  Loader2, AlertCircle, TrendingUp, Shield, Clock, Upload, Download,
  ChevronRight, Filter, RefreshCw, BarChart3, FileCheck, XCircle
} from 'lucide-react';
import { formatXAF, getInitials } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface AnalysisResult {
  score_global: number;
  classe_risque: string;
  scores: {
    identite: number;
    capacite_remboursement: number;
    garanties: number;
    historique_credit: number;
    stabilite_revenus: number;
  };
  indicateurs: {
    nom: string;
    valeur: string;
    statut: 'conforme' | 'attention' | 'non_conforme';
    poids: number;
  }[];
  recommandation: {
    decision: 'favorable' | 'defavorable' | 'reserve';
    conditions: string[];
    points_forts: string[];
    points_vigilance: string[];
    note_synthetique: string;
  };
  conformite_cobac: {
    ratio_endettement: { valeur: number; limite: number; conforme: boolean };
    quotite_cessible: { valeur: number; limite: number; conforme: boolean };
    garantie_couverture: { valeur: number; limite: number; conforme: boolean };
  };
}

export default function ManagerPanier() {
  const navigate = useNavigate();
  const { dossiers, loading, updateDossierStatus } = useDossiers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState<'idle' | 'analyzing' | 'complete' | 'error'>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('resume');
  const [remarks, setRemarks] = useState('');

  // Filtrer les dossiers du panier
  const panierDossiers = dossiers.filter(d => d.status === 'panier');
  const analysisDossiers = dossiers.filter(d => d.status === 'analyse');

  const filteredDossiers = panierDossiers.filter(d => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return d.client_id?.toLowerCase().includes(query);
  });

  const runAIAnalysis = async (dossier: any) => {
    setSelectedDossier(dossier);
    setShowAnalysisDialog(true);
    setAnalysisStage('analyzing');
    setAnalysisProgress(0);
    setAnalysisResult(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 5, 95));
    }, 200);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-dossier', {
        body: { dossierId: dossier.id, dossierData: dossier }
      });

      clearInterval(progressInterval);

      if (error) throw error;

      setAnalysisProgress(100);
      setAnalysisResult(data.analysis);
      setAnalysisStage('complete');

      // Save analysis to dossier
      await supabase.from('dossiers').update({
        analysis_data: data.analysis,
        ai_recommendation: data.analysis.recommandation,
        score_global: data.analysis.score_global,
        classe_risque: data.analysis.classe_risque,
        status: 'analyse'
      }).eq('id', dossier.id);

      toast({
        title: "Analyse terminée",
        description: `Score: ${data.analysis.score_global}/100 - ${data.analysis.classe_risque}`,
      });

    } catch (error) {
      clearInterval(progressInterval);
      console.error('Analysis error:', error);
      setAnalysisStage('error');
      toast({
        title: "Erreur d'analyse",
        description: "L'analyse IA a échoué. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const handleViewDetail = (dossier: any) => {
    setSelectedDossier(dossier);
    if (dossier.analysis_data) {
      setAnalysisResult(dossier.analysis_data as AnalysisResult);
    }
    setShowDetailDialog(true);
  };

  const handleTransmit = async (dossierId: string) => {
    try {
      await updateDossierStatus(dossierId, 'transmis');
      toast({
        title: "Dossier transmis",
        description: "Le dossier a été transmis au comité",
      });
    } catch (error) {
      console.error('Error transmitting dossier:', error);
    }
  };

  const handleTransmitAll = async () => {
    for (const dossier of analysisDossiers) {
      await updateDossierStatus(dossier.id, 'transmis');
    }
    toast({
      title: "Dossiers transmis",
      description: `${analysisDossiers.length} dossier(s) transmis au comité`,
    });
  };

  const handleRemove = async (dossierId: string) => {
    await updateDossierStatus(dossierId, 'en_cours');
    toast({
      title: "Dossier retiré",
      description: "Le dossier a été retiré du panier",
    });
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
          <h1 className="text-2xl font-bold font-display">Panier & Analyse COI</h1>
          <p className="text-muted-foreground">Credit Origination Intelligence - Analyse automatisée</p>
        </div>
        {analysisDossiers.length > 0 && (
          <Button variant="gold" onClick={handleTransmitAll}>
            <Send className="w-4 h-4 mr-2" />
            Transmettre tout ({analysisDossiers.length})
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">En attente</p>
                <p className="text-2xl font-bold">{panierDossiers.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Analysés</p>
                <p className="text-2xl font-bold">{analysisDossiers.length}</p>
              </div>
              <Brain className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Favorables</p>
                <p className="text-2xl font-bold text-success">
                  {analysisDossiers.filter((d: any) => d.ai_recommendation?.decision === 'favorable').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Avec réserves</p>
                <p className="text-2xl font-bold text-warning">
                  {analysisDossiers.filter((d: any) => d.ai_recommendation?.decision === 'reserve').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-warning" />
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

      <Tabs defaultValue="attente" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="attente" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="w-4 h-4 mr-2" />
            En attente ({panierDossiers.length})
          </TabsTrigger>
          <TabsTrigger value="analyses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Brain className="w-4 h-4 mr-2" />
            Analysés ({analysisDossiers.length})
          </TabsTrigger>
        </TabsList>

        {/* Dossiers en attente */}
        <TabsContent value="attente" className="space-y-4">
          {filteredDossiers.length > 0 ? (
            <div className="grid gap-4">
              {filteredDossiers.map(dossier => (
                <Card key={dossier.id} className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14 border border-border">
                        <AvatarFallback className="bg-muted">
                          {dossier.client_id?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">Dossier #{dossier.id.slice(0, 8)}</h3>
                          <Badge variant="outline">Client: {dossier.client_id?.slice(0, 8)}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-semibold text-primary number-format">
                            {formatXAF(dossier.montant)}
                          </span>
                          <span>{dossier.duree} mois</span>
                          <span>Créé le {new Date(dossier.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="gold" onClick={() => runAIAnalysis(dossier)}>
                          <Brain className="w-4 h-4 mr-2" />
                          Analyser COI
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleRemove(dossier.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Panier vide</h3>
                <p className="text-muted-foreground">
                  Aucun dossier en attente d'analyse
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dossiers analysés */}
        <TabsContent value="analyses" className="space-y-4">
          {analysisDossiers.length > 0 ? (
            <div className="grid gap-4">
              {analysisDossiers.map(dossier => {
                const rec = dossier.ai_recommendation as any;
                return (
                  <Card key={dossier.id} className="glass-card">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center", getDecisionBg(rec?.decision || ''))}>
                          {rec?.decision === 'favorable' && <CheckCircle2 className="w-7 h-7 text-success" />}
                          {rec?.decision === 'defavorable' && <XCircle className="w-7 h-7 text-destructive" />}
                          {rec?.decision === 'reserve' && <AlertCircle className="w-7 h-7 text-warning" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg">Dossier #{dossier.id.slice(0, 8)}</h3>
                            <Badge className={cn("capitalize", getDecisionBg(rec?.decision || ''), getDecisionColor(rec?.decision || ''))}>
                              {rec?.decision || 'Non analysé'}
                            </Badge>
                            <Badge variant="outline">{dossier.classe_risque || 'N/A'}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="font-semibold text-primary number-format">
                              {formatXAF(dossier.montant)}
                            </span>
                            <span>Score: <strong className="text-foreground">{dossier.score_global || 0}/100</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={() => handleViewDetail(dossier)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Détail
                          </Button>
                          <Button variant="gold" onClick={() => handleTransmit(dossier.id)}>
                            <Send className="w-4 h-4 mr-2" />
                            Transmettre
                          </Button>
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
                <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Aucun dossier analysé</h3>
                <p className="text-muted-foreground">
                  Lancez une analyse COI sur les dossiers en attente
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Analysis Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Analyse COI - Dossier #{selectedDossier?.id?.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>

          {analysisStage === 'analyzing' && (
            <div className="py-12 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                    <Brain className="w-12 h-12 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="text-lg font-medium">Analyse en cours...</p>
              </div>
              <Progress value={analysisProgress} className="h-2" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className={cn("flex items-center gap-2", analysisProgress > 20 && "text-foreground")}>
                  {analysisProgress > 20 ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                  Vérification de l'identité
                </div>
                <div className={cn("flex items-center gap-2", analysisProgress > 40 && "text-foreground")}>
                  {analysisProgress > 40 ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                  Analyse de la capacité de remboursement
                </div>
                <div className={cn("flex items-center gap-2", analysisProgress > 60 && "text-foreground")}>
                  {analysisProgress > 60 ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                  Évaluation des garanties
                </div>
                <div className={cn("flex items-center gap-2", analysisProgress > 80 && "text-foreground")}>
                  {analysisProgress > 80 ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                  Vérification conformité COBAC
                </div>
                <div className={cn("flex items-center gap-2", analysisProgress >= 100 && "text-foreground")}>
                  {analysisProgress >= 100 ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                  Génération de la recommandation
                </div>
              </div>
            </div>
          )}

          {analysisStage === 'complete' && analysisResult && (
            <div className="space-y-6">
              <Tabs value={activeAnalysisTab} onValueChange={setActiveAnalysisTab}>
                <TabsList className="bg-muted/50 w-full grid grid-cols-5">
                  <TabsTrigger value="resume">Résumé</TabsTrigger>
                  <TabsTrigger value="scores">Scores</TabsTrigger>
                  <TabsTrigger value="indicateurs">Indicateurs</TabsTrigger>
                  <TabsTrigger value="note">Note complète</TabsTrigger>
                  <TabsTrigger value="remarques">Remarques</TabsTrigger>
                </TabsList>

                <TabsContent value="resume" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <COIScoreCard 
                      score={analysisResult.score_global} 
                      classeRisque={analysisResult.classe_risque}
                      recommendation={analysisResult.recommandation?.decision}
                    />
                    <COIRadarChart scores={analysisResult.scores} />
                  </div>
                  
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-sm">Synthèse de la recommandation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{analysisResult.recommandation.note_synthetique}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="scores">
                  <div className="grid gap-4">
                    <COIRadarChart scores={analysisResult.scores} />
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(analysisResult.scores).map(([key, value]) => (
                        <Card key={key} className="glass-card">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="text-lg font-bold">{value}/100</span>
                            </div>
                            <Progress value={value} className="h-2 mt-2" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="indicateurs">
                  <COIIndicators 
                    indicateurs={analysisResult.indicateurs.map(ind => ({
                      ...ind,
                      seuil: '-'
                    }))} 
                    conformiteCobac={analysisResult.conformite_cobac}
                  />
                </TabsContent>

                <TabsContent value="note">
                  <COIAnalysisNote analysis={analysisResult} />
                </TabsContent>

                <TabsContent value="remarques" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Remarques du gestionnaire</label>
                    <Textarea 
                      placeholder="Ajoutez vos observations..."
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      className="input-dark min-h-[150px]"
                    />
                  </div>
                  <Button variant="gold" onClick={() => {
                    toast({ title: "Remarques enregistrées" });
                  }}>
                    Enregistrer les remarques
                  </Button>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAnalysisDialog(false)}>
                  Fermer
                </Button>
                <Button variant="gold" onClick={() => {
                  if (selectedDossier) handleTransmit(selectedDossier.id);
                  setShowAnalysisDialog(false);
                }}>
                  <Send className="w-4 h-4 mr-2" />
                  Transmettre au comité
                </Button>
              </DialogFooter>
            </div>
          )}

          {analysisStage === 'error' && (
            <div className="py-12 text-center">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-semibold mb-2">Erreur d'analyse</h3>
              <p className="text-muted-foreground mb-4">L'analyse a échoué. Veuillez réessayer.</p>
              <Button variant="gold" onClick={() => selectedDossier && runAIAnalysis(selectedDossier)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détail du dossier #{selectedDossier?.id?.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          
          {analysisResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <COIScoreCard 
                  score={analysisResult.score_global} 
                  classeRisque={analysisResult.classe_risque}
                  recommendation={analysisResult.recommandation?.decision}
                />
                <COIRadarChart scores={analysisResult.scores} />
              </div>
              <COIIndicators 
                indicateurs={analysisResult.indicateurs.map(ind => ({
                  ...ind,
                  seuil: '-'
                }))} 
                conformiteCobac={analysisResult.conformite_cobac}
              />
              <COIAnalysisNote analysis={analysisResult} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
