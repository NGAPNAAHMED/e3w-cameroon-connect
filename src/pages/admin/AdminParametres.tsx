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
  Lock,
  Bell,
  FileText,
  Calculator,
  Building2,
  Edit,
  Check,
  X,
} from 'lucide-react';
import { typesCredit } from '@/data/mockData';
import { formatXAF, formatPourcentage } from '@/lib/formatters';

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
}

export default function AdminParametres() {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('credits');
  
  const [credits, setCredits] = useState<CreditType[]>(typesCredit.map(c => ({
    ...c,
    actif: true,
    plafondMin: 100000,
    plafondMax: 50000000,
    dureeMin: 3,
    dureeMax: 84,
    differeMax: 6,
    garantieObligatoire: c.id === 'immo',
  })));

  const [editingCredit, setEditingCredit] = useState<string | null>(null);
  const [newCreditName, setNewCreditName] = useState('');

  // Règles globales
  const [regles, setRegles] = useState({
    tauxEndettementMax: 33,
    ancienneteEmploiMin: 6,
    ancienneteBanqueMin: 3,
    scoreMinBEAC: 'B',
    ageMin: 21,
    ageMax: 65,
    revenusMinSalarie: 100000,
    caMinIndependant: 500000,
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

  // Stats
  const stats = [
    { type: 'Crédit Consommation', count: 145, montant: 725000000, taux: 12 },
    { type: 'Crédit Scolaire', count: 89, montant: 267000000, taux: 8.5 },
    { type: 'Crédit Immobilier', count: 34, montant: 510000000, taux: 7.5 },
    { type: 'Crédit Auto', count: 56, montant: 336000000, taux: 10.5 },
    { type: 'Crédit Équipement', count: 23, montant: 115000000, taux: 9 },
    { type: 'Crédit Trésorerie', count: 67, montant: 134000000, taux: 14 },
  ];

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
          <TabsTrigger value="regles" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="w-4 h-4 mr-2" />
            Règles Globales
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

          {/* Credits List */}
          <div className="grid gap-4">
            {credits.map(credit => (
              <Card key={credit.id} className={`glass-card transition-all ${!credit.actif ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Status & Name */}
                    <div className="flex items-center gap-3 w-48">
                      <Switch
                        checked={credit.actif}
                        onCheckedChange={() => handleToggleCredit(credit.id)}
                      />
                      {credit.actif ? (
                        <PlayCircle className="w-5 h-5 text-success" />
                      ) : (
                        <PauseCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span className="font-semibold">{credit.label}</span>
                    </div>

                    {/* Taux */}
                    <div className="w-32">
                      <Label className="text-xs text-muted-foreground">Taux (%)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.5"
                          value={credit.taux}
                          onChange={(e) => handleUpdateTaux(credit.id, parseFloat(e.target.value))}
                          className="input-dark h-8"
                          disabled={!credit.actif}
                        />
                        <Percent className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Plafond Min */}
                    <div className="w-36">
                      <Label className="text-xs text-muted-foreground">Plafond Min (FCFA)</Label>
                      <Input
                        type="number"
                        value={credit.plafondMin}
                        onChange={(e) => handleUpdatePlafond(credit.id, 'plafondMin', parseInt(e.target.value))}
                        className="input-dark h-8"
                        disabled={!credit.actif}
                      />
                    </div>

                    {/* Plafond Max */}
                    <div className="w-36">
                      <Label className="text-xs text-muted-foreground">Plafond Max (FCFA)</Label>
                      <Input
                        type="number"
                        value={credit.plafondMax}
                        onChange={(e) => handleUpdatePlafond(credit.id, 'plafondMax', parseInt(e.target.value))}
                        className="input-dark h-8"
                        disabled={!credit.actif}
                      />
                    </div>

                    {/* Durée */}
                    <div className="w-24">
                      <Label className="text-xs text-muted-foreground">Durée max</Label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={credit.dureeMax}
                          className="input-dark h-8 w-16"
                          disabled={!credit.actif}
                        />
                        <span className="text-xs text-muted-foreground">mois</span>
                      </div>
                    </div>

                    {/* Garantie */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={credit.garantieObligatoire}
                        disabled={!credit.actif}
                        onCheckedChange={(checked) => {
                          setCredits(prev => prev.map(c => 
                            c.id === credit.id ? { ...c, garantieObligatoire: checked } : c
                          ));
                        }}
                      />
                      <Label className="text-xs">Garantie obligatoire</Label>
                    </div>

                    {/* Actions */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive ml-auto"
                      onClick={() => handleDeleteCredit(credit.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Règles Globales */}
        <TabsContent value="regles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conditions d'éligibilité */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Conditions d'Éligibilité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Taux d'endettement maximum (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[regles.tauxEndettementMax]}
                      onValueChange={([v]) => setRegles(p => ({...p, tauxEndettementMax: v}))}
                      max={50}
                      min={20}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="w-16 justify-center">{regles.tauxEndettementMax}%</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Ancienneté emploi min (mois)</Label>
                    <Input
                      type="number"
                      value={regles.ancienneteEmploiMin}
                      onChange={(e) => setRegles(p => ({...p, ancienneteEmploiMin: parseInt(e.target.value)}))}
                      className="input-dark"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Ancienneté banque min (mois)</Label>
                    <Input
                      type="number"
                      value={regles.ancienneteBanqueMin}
                      onChange={(e) => setRegles(p => ({...p, ancienneteBanqueMin: parseInt(e.target.value)}))}
                      className="input-dark"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Score BEAC minimum</Label>
                  <Select value={regles.scoreMinBEAC} onValueChange={(v) => setRegles(p => ({...p, scoreMinBEAC: v}))}>
                    <SelectTrigger className="input-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Excellent</SelectItem>
                      <SelectItem value="B">B - Bon</SelectItem>
                      <SelectItem value="C">C - Acceptable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Âge minimum</Label>
                    <Input
                      type="number"
                      value={regles.ageMin}
                      onChange={(e) => setRegles(p => ({...p, ageMin: parseInt(e.target.value)}))}
                      className="input-dark"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Âge maximum</Label>
                    <Input
                      type="number"
                      value={regles.ageMax}
                      onChange={(e) => setRegles(p => ({...p, ageMax: parseInt(e.target.value)}))}
                      className="input-dark"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenus minimums */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Revenus Minimums
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Revenu net min - Salariés (FCFA)</Label>
                  <Input
                    type="number"
                    value={regles.revenusMinSalarie}
                    onChange={(e) => setRegles(p => ({...p, revenusMinSalarie: parseInt(e.target.value)}))}
                    className="input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">CA mensuel min - Indépendants (FCFA)</Label>
                  <Input
                    type="number"
                    value={regles.caMinIndependant}
                    onChange={(e) => setRegles(p => ({...p, caMinIndependant: parseInt(e.target.value)}))}
                    className="input-dark"
                  />
                </div>

                <div className="pt-4 border-t border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Double validation comité</Label>
                      <p className="text-xs text-muted-foreground">Requiert 2 validations pour les gros montants</p>
                    </div>
                    <Switch
                      checked={regles.validationDouble}
                      onCheckedChange={(checked) => setRegles(p => ({...p, validationDouble: checked}))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Notifications automatiques</Label>
                      <p className="text-xs text-muted-foreground">Alertes aux gestionnaires</p>
                    </div>
                    <Switch
                      checked={regles.notificationAuto}
                      onCheckedChange={(checked) => setRegles(p => ({...p, notificationAuto: checked}))}
                    />
                  </div>
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
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Performance par Type de Crédit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.map((stat, index) => {
                  const maxMontant = Math.max(...stats.map(s => s.montant));
                  const percentage = (stat.montant / maxMontant) * 100;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{stat.type}</span>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{stat.count} octroyés</Badge>
                          <span className="text-primary font-semibold number-format w-32 text-right">
                            {formatXAF(stat.montant)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
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
                    <p className="text-3xl font-bold text-primary">{stats.reduce((s, c) => s + c.count, 0)}</p>
                    <p className="text-sm text-muted-foreground">Total Crédits Octroyés</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-xl font-bold text-primary number-format">{formatXAF(stats.reduce((s, c) => s + c.montant, 0))}</p>
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
