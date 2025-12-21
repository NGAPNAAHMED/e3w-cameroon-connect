import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  Settings,
  CreditCard,
  Percent,
  Save,
  Plus,
  Trash2,
  TrendingUp,
  PauseCircle,
  PlayCircle,
  Shield,
  Users,
  AlertTriangle,
  Bell,
  FileText,
  Calculator,
  Eye,
  BarChart3,
  Calendar,
  Banknote,
  Clock,
  CheckCircle2,
  Edit,
} from 'lucide-react';
import { typesCredit, reglesOctroi, RegleOctroi } from '@/data/mockData';
import { formatXAF, formatPourcentage } from '@/lib/formatters';

// Helper pour formater les montants avec séparateurs
const formatMontantInput = (value: string): string => {
  const num = value.replace(/\s/g, '').replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const parseMontant = (value: string): number => {
  return parseInt(value.replace(/\s/g, '')) || 0;
};

interface CreditType {
  id: string;
  label: string;
  taux: number;
  actif: boolean;
  plafondMin: number;
  plafondMax: number;
  dureeMin: number;
  dureeMax: number;
  differeMax: number;
  garantieObligatoire: boolean;
  nbOctrois: number;
  montantTotal: number;
}

export default function AdminParametres() {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('credits');
  const [selectedCreditForRules, setSelectedCreditForRules] = useState<string | null>(null);
  
  const [credits, setCredits] = useState<CreditType[]>(typesCredit.map((c, i) => ({
    ...c,
    actif: true,
    plafondMin: reglesOctroi.find(r => r.creditTypeId === c.id)?.montantMin || 100000,
    plafondMax: reglesOctroi.find(r => r.creditTypeId === c.id)?.montantMax || 50000000,
    dureeMin: reglesOctroi.find(r => r.creditTypeId === c.id)?.dureeMin || 3,
    dureeMax: reglesOctroi.find(r => r.creditTypeId === c.id)?.dureeMax || 84,
    differeMax: reglesOctroi.find(r => r.creditTypeId === c.id)?.differeMax || 6,
    garantieObligatoire: reglesOctroi.find(r => r.creditTypeId === c.id)?.garantieObligatoire || false,
    nbOctrois: [145, 89, 34, 56, 23, 67, 45, 28][i] || Math.floor(Math.random() * 100 + 20),
    montantTotal: [725000000, 267000000, 510000000, 336000000, 115000000, 134000000, 225000000, 84000000][i] || Math.floor(Math.random() * 500000000 + 50000000),
  })));

  const [editingRegle, setEditingRegle] = useState<RegleOctroi | null>(null);
  const [newCreditName, setNewCreditName] = useState('');

  // Règles globales d'éligibilité
  const [reglesGlobales, setReglesGlobales] = useState({
    tauxEndettementMax: 33,
    ancienneteEmploiMin: 6,
    ancienneteBanqueMin: 3,
    ancienneteActiviteMin: 12,
    scoreMinBEAC: 'B',
    ageMin: 21,
    ageMax: 65,
    revenusMinSalarie: 100000,
    caMinIndependant: 500000,
    margeMinIndependant: 10,
    epargnePrealableMin: 10,
    validationDouble: true,
    notificationAuto: true,
  });

  // Paramètres notifications
  const [notifSettings, setNotifSettings] = useState({
    nouveauClient: true,
    dossierTransmis: true,
    dossierApprouve: true,
    dossierRejete: true,
    impayeDetecte: true,
    rappelRdv: true,
  });

  const handleToggleCredit = (id: string) => {
    setCredits(prev => prev.map(c => 
      c.id === id ? { ...c, actif: !c.actif } : c
    ));
    const credit = credits.find(c => c.id === id);
    addNotification({
      title: "Type de crédit modifié",
      message: `${credit?.label} a été ${credit?.actif ? 'désactivé' : 'activé'}`,
      type: "info"
    });
    toast({
      title: "Paramètre modifié",
      description: `Le type de crédit a été ${credit?.actif ? 'désactivé' : 'activé'}`,
    });
  };

  const handleUpdateTaux = (id: string, newTaux: number) => {
    setCredits(prev => prev.map(c => 
      c.id === id ? { ...c, taux: newTaux } : c
    ));
  };

  const handleUpdatePlafond = (id: string, field: 'plafondMin' | 'plafondMax', value: number) => {
    setCredits(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleAddCredit = () => {
    if (!newCreditName.trim()) return;
    
    const newCredit: CreditType = {
      id: `new_${Date.now()}`,
      label: newCreditName,
      taux: 10,
      actif: true,
      plafondMin: 100000,
      plafondMax: 10000000,
      dureeMin: 3,
      dureeMax: 36,
      differeMax: 3,
      garantieObligatoire: false,
      nbOctrois: 0,
      montantTotal: 0,
    };
    
    setCredits(prev => [...prev, newCredit]);
    setNewCreditName('');
    
    addNotification({
      title: "Nouveau type de crédit",
      message: `${newCreditName} a été ajouté`,
      type: "success"
    });
    toast({
      title: "Type ajouté",
      description: `${newCreditName} a été créé`,
    });
  };

  const handleDeleteCredit = (id: string) => {
    const credit = credits.find(c => c.id === id);
    setCredits(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Type supprimé",
      description: `${credit?.label} a été supprimé`,
      variant: "destructive",
    });
  };

  const handleSave = () => {
    addNotification({
      title: "Paramètres sauvegardés",
      message: "Toutes les modifications ont été enregistrées",
      type: "success"
    });
    toast({
      title: "Paramètres sauvegardés",
      description: "Les modifications ont été enregistrées avec succès",
    });
  };

  // Crédits actifs uniquement pour l'affichage
  const creditsActifs = credits.filter(c => c.actif);
  const creditsInactifs = credits.filter(c => !c.actif);
  const totalOctrois = credits.reduce((s, c) => s + c.nbOctrois, 0);
  const totalVolume = credits.reduce((s, c) => s + c.montantTotal, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Paramètres & Configuration</h1>
          <p className="text-muted-foreground">Gérez les règles de crédit et les paramètres système</p>
        </div>
        <Button variant="gold" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder tout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="credits" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="w-4 h-4 mr-2" />
            Types de Crédit
          </TabsTrigger>
          <TabsTrigger value="eligibilite" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="w-4 h-4 mr-2" />
            Éligibilité
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="w-4 h-4 mr-2" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        {/* Types de Crédit */}
        <TabsContent value="credits" className="space-y-4">
          {/* Add new credit */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Nom du nouveau type de crédit..."
                  value={newCreditName}
                  onChange={(e) => setNewCreditName(e.target.value)}
                  className="input-dark flex-1"
                />
                <Button variant="gold" onClick={handleAddCredit} disabled={!newCreditName.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Credits actifs */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-success" />
              Crédits Actifs ({creditsActifs.length})
            </h3>
            {creditsActifs.map(credit => (
              <CreditTypeCard 
                key={credit.id} 
                credit={credit}
                onToggle={() => handleToggleCredit(credit.id)}
                onUpdateTaux={(t) => handleUpdateTaux(credit.id, t)}
                onUpdatePlafond={(f, v) => handleUpdatePlafond(credit.id, f, v)}
                onDelete={() => handleDeleteCredit(credit.id)}
                onViewRules={() => setSelectedCreditForRules(credit.id)}
              />
            ))}
          </div>

          {/* Credits inactifs */}
          {creditsInactifs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <PauseCircle className="w-4 h-4 text-muted-foreground" />
                Crédits Suspendus ({creditsInactifs.length})
              </h3>
              {creditsInactifs.map(credit => (
                <CreditTypeCard 
                  key={credit.id} 
                  credit={credit}
                  onToggle={() => handleToggleCredit(credit.id)}
                  onUpdateTaux={(t) => handleUpdateTaux(credit.id, t)}
                  onUpdatePlafond={(f, v) => handleUpdatePlafond(credit.id, f, v)}
                  onDelete={() => handleDeleteCredit(credit.id)}
                  onViewRules={() => setSelectedCreditForRules(credit.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Conditions d'Éligibilité */}
        <TabsContent value="eligibilite" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conditions générales */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Conditions Générales d'Éligibilité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Taux d'endettement maximum (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[reglesGlobales.tauxEndettementMax]}
                      onValueChange={([v]) => setReglesGlobales(p => ({...p, tauxEndettementMax: v}))}
                      max={50}
                      min={20}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="w-16 justify-center">{reglesGlobales.tauxEndettementMax}%</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Âge minimum</Label>
                    <Input
                      type="number"
                      value={reglesGlobales.ageMin}
                      onChange={(e) => setReglesGlobales(p => ({...p, ageMin: parseInt(e.target.value)}))}
                      className="input-dark"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Âge maximum</Label>
                    <Input
                      type="number"
                      value={reglesGlobales.ageMax}
                      onChange={(e) => setReglesGlobales(p => ({...p, ageMax: parseInt(e.target.value)}))}
                      className="input-dark"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Score BEAC minimum</Label>
                  <Select value={reglesGlobales.scoreMinBEAC} onValueChange={(v) => setReglesGlobales(p => ({...p, scoreMinBEAC: v}))}>
                    <SelectTrigger className="input-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Excellent (Aucun impayé)</SelectItem>
                      <SelectItem value="B">B - Bon (Impayés {'<'} 500 000 FCFA)</SelectItem>
                      <SelectItem value="C">C - Acceptable (Impayés {'<'} 1 000 000 FCFA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Ancienneté requise */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Ancienneté Requise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Ancienneté emploi min (mois)</Label>
                    <Input
                      type="number"
                      value={reglesGlobales.ancienneteEmploiMin}
                      onChange={(e) => setReglesGlobales(p => ({...p, ancienneteEmploiMin: parseInt(e.target.value)}))}
                      className="input-dark"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Ancienneté banque min (mois)</Label>
                    <Input
                      type="number"
                      value={reglesGlobales.ancienneteBanqueMin}
                      onChange={(e) => setReglesGlobales(p => ({...p, ancienneteBanqueMin: parseInt(e.target.value)}))}
                      className="input-dark"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Ancienneté activité min - Indépendants (mois)</Label>
                  <Input
                    type="number"
                    value={reglesGlobales.ancienneteActiviteMin}
                    onChange={(e) => setReglesGlobales(p => ({...p, ancienneteActiviteMin: parseInt(e.target.value)}))}
                    className="input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Épargne préalable minimum (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[reglesGlobales.epargnePrealableMin]}
                      onValueChange={([v]) => setReglesGlobales(p => ({...p, epargnePrealableMin: v}))}
                      max={30}
                      min={0}
                      step={5}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="w-16 justify-center">{reglesGlobales.epargnePrealableMin}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenus minimums */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-primary" />
                  Revenus Minimums
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Revenu net min - Salariés (FCFA)</Label>
                  <Input
                    value={formatMontantInput(String(reglesGlobales.revenusMinSalarie))}
                    onChange={(e) => setReglesGlobales(p => ({...p, revenusMinSalarie: parseMontant(e.target.value)}))}
                    className="input-dark number-format"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">CA mensuel min - Indépendants (FCFA)</Label>
                  <Input
                    value={formatMontantInput(String(reglesGlobales.caMinIndependant))}
                    onChange={(e) => setReglesGlobales(p => ({...p, caMinIndependant: parseMontant(e.target.value)}))}
                    className="input-dark number-format"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Marge nette min - Indépendants (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[reglesGlobales.margeMinIndependant]}
                      onValueChange={([v]) => setReglesGlobales(p => ({...p, margeMinIndependant: v}))}
                      max={30}
                      min={5}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="w-16 justify-center">{reglesGlobales.margeMinIndependant}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Options avancées */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Options Avancées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Label className="text-sm">Double validation comité</Label>
                    <p className="text-xs text-muted-foreground">Requiert 2 validations pour les gros montants</p>
                  </div>
                  <Switch
                    checked={reglesGlobales.validationDouble}
                    onCheckedChange={(checked) => setReglesGlobales(p => ({...p, validationDouble: checked}))}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Label className="text-sm">Notifications automatiques</Label>
                    <p className="text-xs text-muted-foreground">Alertes aux gestionnaires et clients</p>
                  </div>
                  <Switch
                    checked={reglesGlobales.notificationAuto}
                    onCheckedChange={(checked) => setReglesGlobales(p => ({...p, notificationAuto: checked}))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Configuration des Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  nouveauClient: 'Nouveau client inscrit',
                  dossierTransmis: 'Dossier transmis au comité',
                  dossierApprouve: 'Dossier approuvé',
                  dossierRejete: 'Dossier rejeté/renvoyé',
                  impayeDetecte: 'Impayé détecté',
                  rappelRdv: 'Rappel de rendez-vous',
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">{label}</span>
                    <Switch
                      checked={notifSettings[key as keyof typeof notifSettings]}
                      onCheckedChange={(checked) => setNotifSettings(p => ({...p, [key]: checked}))}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistiques */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Performance par Type de Crédit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {credits.sort((a, b) => b.montantTotal - a.montantTotal).map((credit) => {
                  const maxMontant = Math.max(...credits.map(c => c.montantTotal));
                  const percentage = (credit.montantTotal / maxMontant) * 100;
                  
                  return (
                    <Dialog key={credit.id}>
                      <DialogTrigger asChild>
                        <div className="space-y-2 cursor-pointer hover:bg-muted/30 p-2 rounded-lg transition-colors">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium flex items-center gap-2">
                              {credit.actif ? (
                                <CheckCircle2 className="w-3 h-3 text-success" />
                              ) : (
                                <PauseCircle className="w-3 h-3 text-muted-foreground" />
                              )}
                              {credit.label}
                            </span>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline">{credit.nbOctrois} octroyés</Badge>
                              <span className="text-primary font-semibold number-format w-36 text-right">
                                {formatXAF(credit.montantTotal)}
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${credit.actif ? 'bg-gradient-to-r from-primary to-primary/60' : 'bg-muted-foreground/30'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Détails - {credit.label}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="p-4 rounded-lg bg-muted/50 text-center">
                            <p className="text-2xl font-bold text-primary">{credit.nbOctrois}</p>
                            <p className="text-sm text-muted-foreground">Crédits octroyés</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50 text-center">
                            <p className="text-lg font-bold text-primary number-format">{formatXAF(credit.montantTotal)}</p>
                            <p className="text-sm text-muted-foreground">Volume total</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50 text-center">
                            <p className="text-2xl font-bold">{formatPourcentage(credit.taux)}</p>
                            <p className="text-sm text-muted-foreground">Taux d'intérêt</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50 text-center">
                            <p className="text-lg font-bold number-format">{formatXAF(Math.floor(credit.montantTotal / credit.nbOctrois))}</p>
                            <p className="text-sm text-muted-foreground">Montant moyen</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Résumé Global
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold text-primary">{totalOctrois}</p>
                    <p className="text-sm text-muted-foreground">Total Crédits Octroyés</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-xl font-bold text-primary number-format">{formatXAF(totalVolume)}</p>
                    <p className="text-sm text-muted-foreground">Volume Total</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold text-success">98.5%</p>
                    <p className="text-sm text-muted-foreground">Taux de Recouvrement</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold text-warning">1.5%</p>
                    <p className="text-sm text-muted-foreground">Taux d'Impayés</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Composant pour les cartes de type de crédit
function CreditTypeCard({ 
  credit, 
  onToggle, 
  onUpdateTaux, 
  onUpdatePlafond, 
  onDelete,
  onViewRules 
}: { 
  credit: CreditType;
  onToggle: () => void;
  onUpdateTaux: (taux: number) => void;
  onUpdatePlafond: (field: 'plafondMin' | 'plafondMax', value: number) => void;
  onDelete: () => void;
  onViewRules: () => void;
}) {
  return (
    <Card className={`glass-card transition-all ${!credit.actif ? 'opacity-60 border-dashed' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Status & Name */}
          <div className="flex items-center gap-3 min-w-48">
            <Switch checked={credit.actif} onCheckedChange={onToggle} />
            {credit.actif ? (
              <PlayCircle className="w-5 h-5 text-success" />
            ) : (
              <PauseCircle className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="font-semibold">{credit.label}</span>
          </div>

          {/* Taux */}
          <div className="w-28">
            <Label className="text-xs text-muted-foreground">Taux (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.5"
                value={credit.taux}
                onChange={(e) => onUpdateTaux(parseFloat(e.target.value))}
                className="input-dark h-8"
                disabled={!credit.actif}
              />
              <Percent className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Plafond Min */}
          <div className="w-40">
            <Label className="text-xs text-muted-foreground">Plafond Min</Label>
            <Input
              value={formatMontantInput(String(credit.plafondMin))}
              onChange={(e) => onUpdatePlafond('plafondMin', parseMontant(e.target.value))}
              className="input-dark h-8 number-format"
              disabled={!credit.actif}
            />
          </div>

          {/* Plafond Max */}
          <div className="w-40">
            <Label className="text-xs text-muted-foreground">Plafond Max</Label>
            <Input
              value={formatMontantInput(String(credit.plafondMax))}
              onChange={(e) => onUpdatePlafond('plafondMax', parseMontant(e.target.value))}
              className="input-dark h-8 number-format"
              disabled={!credit.actif}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline" className="text-xs">
              {credit.nbOctrois} octrois
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
