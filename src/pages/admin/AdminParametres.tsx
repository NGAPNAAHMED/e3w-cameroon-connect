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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  XCircle,
  History,
  Building2,
  Briefcase,
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

interface HistoryEntry {
  date: string;
  time: string;
  action: 'suspend' | 'activate';
  motif?: string;
  user: string;
}

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
  clientsEligibles: ('salarie' | 'independant' | 'entreprise')[];
  motifSuspension?: string;
  history: HistoryEntry[];
  // Règles d'éligibilité spécifiques
  reglesEligibilite: {
    ageMin: number;
    ageMax: number;
    ancienneteEmploiMin: number;
    ancienneteBanqueMin: number;
    ancienneteActiviteMin: number;
    revenusMinSalarie: number;
    caMinIndependant: number;
    margeMinIndependant: number;
    tauxEndettementMax: number;
    scoreMinBEAC: string;
    epargnePrealableMin: number;
  };
  // Règles d'octroi spécifiques
  reglesOctroi: {
    quotiteCessibleMax: number;
    ratioCouvertureDette: number;
    cautionSolidaireRequise: boolean;
    nbCautionsMin: number;
    nantissementObligatoire: boolean;
    epargneGarantieRequise: boolean;
    creditProgressif: boolean;
    delaiGraceMax: number;
    visiteDomicileObligatoire: boolean;
    verificationMoralite: boolean;
  };
}

export default function AdminParametres() {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('credits');
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [selectedCreditForSuspend, setSelectedCreditForSuspend] = useState<CreditType | null>(null);
  const [suspendMotif, setSuspendMotif] = useState('');
  const [editingCredit, setEditingCredit] = useState<CreditType | null>(null);
  
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
    clientsEligibles: reglesOctroi.find(r => r.creditTypeId === c.id)?.clientsEligibles || ['salarie', 'independant', 'entreprise'],
    history: [],
    reglesEligibilite: {
      ageMin: 21,
      ageMax: 65,
      ancienneteEmploiMin: 6,
      ancienneteBanqueMin: 3,
      ancienneteActiviteMin: 12,
      revenusMinSalarie: 100000,
      caMinIndependant: 500000,
      margeMinIndependant: 10,
      tauxEndettementMax: 33,
      scoreMinBEAC: 'B',
      epargnePrealableMin: 10,
    },
    reglesOctroi: {
      quotiteCessibleMax: 40,
      ratioCouvertureDette: 2,
      cautionSolidaireRequise: false,
      nbCautionsMin: 1,
      nantissementObligatoire: false,
      epargneGarantieRequise: false,
      creditProgressif: true,
      delaiGraceMax: 3,
      visiteDomicileObligatoire: true,
      verificationMoralite: true,
    },
  })));

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

  // Form state for new/edit credit
  const [creditForm, setCreditForm] = useState<Partial<CreditType>>({
    label: '',
    taux: 10,
    plafondMin: 100000,
    plafondMax: 10000000,
    dureeMin: 3,
    dureeMax: 36,
    differeMax: 3,
    garantieObligatoire: false,
    clientsEligibles: ['salarie', 'independant', 'entreprise'],
    reglesEligibilite: {
      ageMin: 21,
      ageMax: 65,
      ancienneteEmploiMin: 6,
      ancienneteBanqueMin: 3,
      ancienneteActiviteMin: 12,
      revenusMinSalarie: 100000,
      caMinIndependant: 500000,
      margeMinIndependant: 10,
      tauxEndettementMax: 33,
      scoreMinBEAC: 'B',
      epargnePrealableMin: 10,
    },
    reglesOctroi: {
      quotiteCessibleMax: 40,
      ratioCouvertureDette: 2,
      cautionSolidaireRequise: false,
      nbCautionsMin: 1,
      nantissementObligatoire: false,
      epargneGarantieRequise: false,
      creditProgressif: true,
      delaiGraceMax: 3,
      visiteDomicileObligatoire: true,
      verificationMoralite: true,
    },
  });

  const handleOpenSuspendDialog = (credit: CreditType) => {
    setSelectedCreditForSuspend(credit);
    setSuspendMotif('');
    setShowSuspendDialog(true);
  };

  const handleToggleCredit = () => {
    if (!selectedCreditForSuspend) return;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    if (selectedCreditForSuspend.actif && !suspendMotif.trim()) {
      toast({
        title: "Motif requis",
        description: "Veuillez indiquer le motif de suspension",
        variant: "destructive",
      });
      return;
    }

    setCredits(prev => prev.map(c => {
      if (c.id === selectedCreditForSuspend.id) {
        const newHistory: HistoryEntry = {
          date: dateStr,
          time: timeStr,
          action: c.actif ? 'suspend' : 'activate',
          motif: c.actif ? suspendMotif : undefined,
          user: 'Admin Principal',
        };
        return { 
          ...c, 
          actif: !c.actif,
          motifSuspension: c.actif ? suspendMotif : undefined,
          history: [...c.history, newHistory],
        };
      }
      return c;
    }));

    addNotification({
      title: "Type de crédit modifié",
      message: `${selectedCreditForSuspend.label} a été ${selectedCreditForSuspend.actif ? 'suspendu' : 'activé'}`,
      type: selectedCreditForSuspend.actif ? "warning" : "success"
    });
    toast({
      title: "Paramètre modifié",
      description: `Le type de crédit a été ${selectedCreditForSuspend.actif ? 'suspendu' : 'activé'}`,
    });
    
    setShowSuspendDialog(false);
    setSelectedCreditForSuspend(null);
    setSuspendMotif('');
  };

  const handleOpenCreditDialog = (credit?: CreditType) => {
    if (credit) {
      setEditingCredit(credit);
      setCreditForm({
        ...credit,
      });
    } else {
      setEditingCredit(null);
      setCreditForm({
        label: '',
        taux: 10,
        plafondMin: 100000,
        plafondMax: 10000000,
        dureeMin: 3,
        dureeMax: 36,
        differeMax: 3,
        garantieObligatoire: false,
        clientsEligibles: ['salarie', 'independant', 'entreprise'],
        reglesEligibilite: {
          ageMin: 21,
          ageMax: 65,
          ancienneteEmploiMin: 6,
          ancienneteBanqueMin: 3,
          ancienneteActiviteMin: 12,
          revenusMinSalarie: 100000,
          caMinIndependant: 500000,
          margeMinIndependant: 10,
          tauxEndettementMax: 33,
          scoreMinBEAC: 'B',
          epargnePrealableMin: 10,
        },
        reglesOctroi: {
          quotiteCessibleMax: 40,
          ratioCouvertureDette: 2,
          cautionSolidaireRequise: false,
          nbCautionsMin: 1,
          nantissementObligatoire: false,
          epargneGarantieRequise: false,
          creditProgressif: true,
          delaiGraceMax: 3,
          visiteDomicileObligatoire: true,
          verificationMoralite: true,
        },
      });
    }
    setShowCreditDialog(true);
  };

  const handleSaveCreditType = () => {
    if (!creditForm.label?.trim()) {
      toast({
        title: "Erreur",
        description: "Le libellé est obligatoire",
        variant: "destructive",
      });
      return;
    }

    if (editingCredit) {
      // Update existing
      setCredits(prev => prev.map(c => {
        if (c.id === editingCredit.id) {
          return {
            ...c,
            ...creditForm,
          } as CreditType;
        }
        return c;
      }));
      toast({
        title: "Type modifié",
        description: `${creditForm.label} a été mis à jour`,
      });
    } else {
      // Create new
      const newCredit: CreditType = {
        id: `new_${Date.now()}`,
        label: creditForm.label || '',
        taux: creditForm.taux || 10,
        actif: true,
        plafondMin: creditForm.plafondMin || 100000,
        plafondMax: creditForm.plafondMax || 10000000,
        dureeMin: creditForm.dureeMin || 3,
        dureeMax: creditForm.dureeMax || 36,
        differeMax: creditForm.differeMax || 3,
        garantieObligatoire: creditForm.garantieObligatoire || false,
        nbOctrois: 0,
        montantTotal: 0,
        clientsEligibles: creditForm.clientsEligibles || ['salarie', 'independant', 'entreprise'],
        history: [],
        reglesEligibilite: creditForm.reglesEligibilite || {
          ageMin: 21,
          ageMax: 65,
          ancienneteEmploiMin: 6,
          ancienneteBanqueMin: 3,
          ancienneteActiviteMin: 12,
          revenusMinSalarie: 100000,
          caMinIndependant: 500000,
          margeMinIndependant: 10,
          tauxEndettementMax: 33,
          scoreMinBEAC: 'B',
          epargnePrealableMin: 10,
        },
        reglesOctroi: creditForm.reglesOctroi || {
          quotiteCessibleMax: 40,
          ratioCouvertureDette: 2,
          cautionSolidaireRequise: false,
          nbCautionsMin: 1,
          nantissementObligatoire: false,
          epargneGarantieRequise: false,
          creditProgressif: true,
          delaiGraceMax: 3,
          visiteDomicileObligatoire: true,
          verificationMoralite: true,
        },
      };
      setCredits(prev => [...prev, newCredit]);
      addNotification({
        title: "Nouveau type de crédit",
        message: `${creditForm.label} a été ajouté`,
        type: "success"
      });
      toast({
        title: "Type ajouté",
        description: `${creditForm.label} a été créé`,
      });
    }
    
    setShowCreditDialog(false);
    setEditingCredit(null);
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

  const handleClientToggle = (type: 'salarie' | 'independant' | 'entreprise') => {
    const current = creditForm.clientsEligibles || [];
    if (current.includes(type)) {
      setCreditForm(prev => ({
        ...prev,
        clientsEligibles: current.filter(t => t !== type),
      }));
    } else {
      setCreditForm(prev => ({
        ...prev,
        clientsEligibles: [...current, type],
      }));
    }
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
            Éligibilité Globale
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
          {/* Add new credit button */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <Button variant="gold" onClick={() => handleOpenCreditDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un nouveau type de crédit
              </Button>
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
                onToggle={() => handleOpenSuspendDialog(credit)}
                onEdit={() => handleOpenCreditDialog(credit)}
                onDelete={() => handleDeleteCredit(credit.id)}
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
                  onToggle={() => handleOpenSuspendDialog(credit)}
                  onEdit={() => handleOpenCreditDialog(credit)}
                  onDelete={() => handleDeleteCredit(credit.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Conditions d'Éligibilité Globales */}
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
                      <DialogContent className="max-w-lg">
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
                            <p className="text-lg font-bold number-format">{credit.nbOctrois > 0 ? formatXAF(Math.floor(credit.montantTotal / credit.nbOctrois)) : '-'}</p>
                            <p className="text-sm text-muted-foreground">Montant moyen</p>
                          </div>
                        </div>
                        
                        {/* Clients éligibles */}
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Clients éligibles:</p>
                          <div className="flex gap-2">
                            {credit.clientsEligibles.includes('salarie') && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> Salariés
                              </Badge>
                            )}
                            {credit.clientsEligibles.includes('independant') && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" /> Indépendants
                              </Badge>
                            )}
                            {credit.clientsEligibles.includes('entreprise') && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> Entreprises
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Historique */}
                        {credit.history.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              <History className="w-4 h-4" /> Historique des modifications
                            </p>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {credit.history.slice().reverse().map((h, i) => (
                                <div key={i} className="text-xs p-2 rounded bg-muted/50 flex items-center gap-2">
                                  {h.action === 'suspend' ? (
                                    <XCircle className="w-3 h-3 text-destructive" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3 text-success" />
                                  )}
                                  <span>{h.date} {h.time}</span>
                                  <span className="text-muted-foreground">-</span>
                                  <span>{h.action === 'suspend' ? 'Suspendu' : 'Activé'}</span>
                                  {h.motif && <span className="text-muted-foreground">({h.motif})</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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

      {/* Dialog Suspension */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCreditForSuspend?.actif ? (
                <>
                  <PauseCircle className="w-5 h-5 text-warning" />
                  Suspendre {selectedCreditForSuspend?.label}
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5 text-success" />
                  Activer {selectedCreditForSuspend?.label}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCreditForSuspend?.actif ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
                <p className="font-medium text-warning mb-1">Attention</p>
                <p className="text-muted-foreground">
                  La suspension de ce type de crédit empêchera les gestionnaires de proposer ce produit aux clients.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Motif de suspension *</Label>
                <Textarea
                  placeholder="Indiquez le motif de la suspension..."
                  value={suspendMotif}
                  onChange={(e) => setSuspendMotif(e.target.value)}
                  className="input-dark"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-sm">
              <p className="text-muted-foreground">
                Ce type de crédit sera à nouveau disponible pour les gestionnaires.
              </p>
              {selectedCreditForSuspend?.motifSuspension && (
                <p className="mt-2">
                  <span className="font-medium">Dernier motif de suspension:</span>{' '}
                  {selectedCreditForSuspend.motifSuspension}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant={selectedCreditForSuspend?.actif ? 'destructive' : 'gold'} 
              onClick={handleToggleCredit}
            >
              {selectedCreditForSuspend?.actif ? 'Suspendre' : 'Activer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Création/Modification Type Crédit */}
      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {editingCredit ? `Modifier ${editingCredit.label}` : 'Créer un nouveau type de crédit'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Libellé du crédit *</Label>
                <Input
                  value={creditForm.label || ''}
                  onChange={(e) => setCreditForm(p => ({...p, label: e.target.value}))}
                  placeholder="Ex: Crédit Consommation"
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label>Taux d'intérêt annuel (%)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={creditForm.taux || 10}
                  onChange={(e) => setCreditForm(p => ({...p, taux: parseFloat(e.target.value)}))}
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label>Garantie obligatoire</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    checked={creditForm.garantieObligatoire}
                    onCheckedChange={(checked) => setCreditForm(p => ({...p, garantieObligatoire: !!checked}))}
                  />
                  <span className="text-sm">Exiger une garantie</span>
                </div>
              </div>
            </div>

            {/* Montants et durées */}
            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Plafond min (FCFA)</Label>
                <Input
                  value={formatMontantInput(String(creditForm.plafondMin || 0))}
                  onChange={(e) => setCreditForm(p => ({...p, plafondMin: parseMontant(e.target.value)}))}
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label>Plafond max (FCFA)</Label>
                <Input
                  value={formatMontantInput(String(creditForm.plafondMax || 0))}
                  onChange={(e) => setCreditForm(p => ({...p, plafondMax: parseMontant(e.target.value)}))}
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label>Durée min (mois)</Label>
                <Input
                  type="number"
                  min="1"
                  value={creditForm.dureeMin || 3}
                  onChange={(e) => setCreditForm(p => ({...p, dureeMin: parseInt(e.target.value)}))}
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label>Durée max (mois)</Label>
                <Input
                  type="number"
                  min="1"
                  value={creditForm.dureeMax || 36}
                  onChange={(e) => setCreditForm(p => ({...p, dureeMax: parseInt(e.target.value)}))}
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label>Différé max (mois)</Label>
                <Input
                  type="number"
                  min="0"
                  value={creditForm.differeMax || 0}
                  onChange={(e) => setCreditForm(p => ({...p, differeMax: parseInt(e.target.value)}))}
                  className="input-dark"
                />
              </div>
            </div>

            {/* Clients éligibles */}
            <div className="space-y-3">
              <Label>Clients éligibles à ce type de crédit</Label>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={creditForm.clientsEligibles?.includes('salarie')}
                    onCheckedChange={() => handleClientToggle('salarie')}
                  />
                  <Users className="w-4 h-4 text-primary" />
                  <span>Salariés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={creditForm.clientsEligibles?.includes('independant')}
                    onCheckedChange={() => handleClientToggle('independant')}
                  />
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span>Indépendants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={creditForm.clientsEligibles?.includes('entreprise')}
                    onCheckedChange={() => handleClientToggle('entreprise')}
                  />
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>Entreprises</span>
                </div>
              </div>
            </div>

            {/* Règles d'éligibilité et d'octroi */}
            <div className="grid grid-cols-2 gap-6">
              {/* Règles d'éligibilité */}
              <Card className="border-2 border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Règles d'Éligibilité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Âge min</Label>
                      <Input
                        type="number"
                        value={creditForm.reglesEligibilite?.ageMin || 21}
                        onChange={(e) => setCreditForm(p => ({
                          ...p,
                          reglesEligibilite: {...p.reglesEligibilite!, ageMin: parseInt(e.target.value)}
                        }))}
                        className="input-dark h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Âge max</Label>
                      <Input
                        type="number"
                        value={creditForm.reglesEligibilite?.ageMax || 65}
                        onChange={(e) => setCreditForm(p => ({
                          ...p,
                          reglesEligibilite: {...p.reglesEligibilite!, ageMax: parseInt(e.target.value)}
                        }))}
                        className="input-dark h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Anc. emploi min (mois)</Label>
                      <Input
                        type="number"
                        value={creditForm.reglesEligibilite?.ancienneteEmploiMin || 6}
                        onChange={(e) => setCreditForm(p => ({
                          ...p,
                          reglesEligibilite: {...p.reglesEligibilite!, ancienneteEmploiMin: parseInt(e.target.value)}
                        }))}
                        className="input-dark h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Anc. banque min (mois)</Label>
                      <Input
                        type="number"
                        value={creditForm.reglesEligibilite?.ancienneteBanqueMin || 3}
                        onChange={(e) => setCreditForm(p => ({
                          ...p,
                          reglesEligibilite: {...p.reglesEligibilite!, ancienneteBanqueMin: parseInt(e.target.value)}
                        }))}
                        className="input-dark h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Anc. activité min (mois)</Label>
                      <Input
                        type="number"
                        value={creditForm.reglesEligibilite?.ancienneteActiviteMin || 12}
                        onChange={(e) => setCreditForm(p => ({
                          ...p,
                          reglesEligibilite: {...p.reglesEligibilite!, ancienneteActiviteMin: parseInt(e.target.value)}
                        }))}
                        className="input-dark h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Taux endettement max (%)</Label>
                      <Input
                        type="number"
                        value={creditForm.reglesEligibilite?.tauxEndettementMax || 33}
                        onChange={(e) => setCreditForm(p => ({
                          ...p,
                          reglesEligibilite: {...p.reglesEligibilite!, tauxEndettementMax: parseInt(e.target.value)}
                        }))}
                        className="input-dark h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Revenu min salarié (FCFA)</Label>
                      <Input
                        value={formatMontantInput(String(creditForm.reglesEligibilite?.revenusMinSalarie || 100000))}
                        onChange={(e) => setCreditForm(p => ({
                          ...p,
                          reglesEligibilite: {...p.reglesEligibilite!, revenusMinSalarie: parseMontant(e.target.value)}
                        }))}
                        className="input-dark h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">CA min indép. (FCFA)</Label>
                      <Input
                        value={formatMontantInput(String(creditForm.reglesEligibilite?.caMinIndependant || 500000))}
                        onChange={(e) => setCreditForm(p => ({
                          ...p,
                          reglesEligibilite: {...p.reglesEligibilite!, caMinIndependant: parseMontant(e.target.value)}
                        }))}
                        className="input-dark h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Score BEAC min</Label>
                      <Select 
                        value={creditForm.reglesEligibilite?.scoreMinBEAC || 'B'}
                        onValueChange={(v) => setCreditForm(p => ({
                          ...p,
                          reglesEligibilite: {...p.reglesEligibilite!, scoreMinBEAC: v}
                        }))}
                      >
                        <SelectTrigger className="input-dark h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A - Excellent</SelectItem>
                          <SelectItem value="B">B - Bon</SelectItem>
                          <SelectItem value="C">C - Acceptable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Épargne préalable (%)</Label>
                      <Input
                        type="number"
                        value={creditForm.reglesEligibilite?.epargnePrealableMin || 10}
                        onChange={(e) => setCreditForm(p => ({
                          ...p,
                          reglesEligibilite: {...p.reglesEligibilite!, epargnePrealableMin: parseInt(e.target.value)}
                        }))}
                        className="input-dark h-8"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Règles d'octroi */}
              <Card className="border-2 border-success/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-success" />
                    Règles d'Octroi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Quotité cessible max (%)</Label>
                      <Input
                        type="number"
                        value={creditForm.reglesOctroi?.quotiteCessibleMax || 40}
                        onChange={(e) => setCreditForm(p => ({
                          ...p,
                          reglesOctroi: {...p.reglesOctroi!, quotiteCessibleMax: parseInt(e.target.value)}
                        }))}
                        className="input-dark h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Ratio couverture dette</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={creditForm.reglesOctroi?.ratioCouvertureDette || 2}
                        onChange={(e) => setCreditForm(p => ({
                          ...p,
                          reglesOctroi: {...p.reglesOctroi!, ratioCouvertureDette: parseFloat(e.target.value)}
                        }))}
                        className="input-dark h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Nb cautions min</Label>
                      <Input
                        type="number"
                        min="0"
                        value={creditForm.reglesOctroi?.nbCautionsMin || 1}
                        onChange={(e) => setCreditForm(p => ({
                          ...p,
                          reglesOctroi: {...p.reglesOctroi!, nbCautionsMin: parseInt(e.target.value)}
                        }))}
                        className="input-dark h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Délai grâce max (mois)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={creditForm.reglesOctroi?.delaiGraceMax || 3}
                        onChange={(e) => setCreditForm(p => ({
                          ...p,
                          reglesOctroi: {...p.reglesOctroi!, delaiGraceMax: parseInt(e.target.value)}
                        }))}
                        className="input-dark h-8"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={creditForm.reglesOctroi?.cautionSolidaireRequise}
                        onCheckedChange={(checked) => setCreditForm(p => ({
                          ...p,
                          reglesOctroi: {...p.reglesOctroi!, cautionSolidaireRequise: !!checked}
                        }))}
                      />
                      <span className="text-sm">Caution solidaire requise</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={creditForm.reglesOctroi?.nantissementObligatoire}
                        onCheckedChange={(checked) => setCreditForm(p => ({
                          ...p,
                          reglesOctroi: {...p.reglesOctroi!, nantissementObligatoire: !!checked}
                        }))}
                      />
                      <span className="text-sm">Nantissement obligatoire</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={creditForm.reglesOctroi?.epargneGarantieRequise}
                        onCheckedChange={(checked) => setCreditForm(p => ({
                          ...p,
                          reglesOctroi: {...p.reglesOctroi!, epargneGarantieRequise: !!checked}
                        }))}
                      />
                      <span className="text-sm">Épargne de garantie requise</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={creditForm.reglesOctroi?.creditProgressif}
                        onCheckedChange={(checked) => setCreditForm(p => ({
                          ...p,
                          reglesOctroi: {...p.reglesOctroi!, creditProgressif: !!checked}
                        }))}
                      />
                      <span className="text-sm">Crédit progressif (pas-à-pas)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={creditForm.reglesOctroi?.visiteDomicileObligatoire}
                        onCheckedChange={(checked) => setCreditForm(p => ({
                          ...p,
                          reglesOctroi: {...p.reglesOctroi!, visiteDomicileObligatoire: !!checked}
                        }))}
                      />
                      <span className="text-sm">Visite à domicile obligatoire</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={creditForm.reglesOctroi?.verificationMoralite}
                        onCheckedChange={(checked) => setCreditForm(p => ({
                          ...p,
                          reglesOctroi: {...p.reglesOctroi!, verificationMoralite: !!checked}
                        }))}
                      />
                      <span className="text-sm">Vérification de moralité</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreditDialog(false)}>
              Annuler
            </Button>
            <Button variant="gold" onClick={handleSaveCreditType}>
              <Save className="w-4 h-4 mr-2" />
              {editingCredit ? 'Enregistrer les modifications' : 'Créer le type de crédit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Composant pour les cartes de type de crédit
function CreditTypeCard({ 
  credit, 
  onToggle, 
  onEdit,
  onDelete,
}: { 
  credit: CreditType;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const formatMontant = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  return (
    <Card className={`glass-card transition-all ${!credit.actif ? 'opacity-60 border-dashed' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Status & Name */}
          <div className="flex items-center gap-3 min-w-48">
            {credit.actif ? (
              <PlayCircle className="w-5 h-5 text-success" />
            ) : (
              <PauseCircle className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="font-semibold">{credit.label}</span>
          </div>

          {/* Taux */}
          <div className="w-20 text-center">
            <p className="text-xs text-muted-foreground">Taux</p>
            <p className="font-semibold">{credit.taux}%</p>
          </div>

          {/* Plafond */}
          <div className="w-48 text-center">
            <p className="text-xs text-muted-foreground">Plafond</p>
            <p className="font-medium text-sm">{formatMontant(credit.plafondMin)} - {formatMontant(credit.plafondMax)}</p>
          </div>

          {/* Clients */}
          <div className="flex items-center gap-1">
            {credit.clientsEligibles.includes('salarie') && (
              <Badge variant="outline" className="text-xs"><Users className="w-3 h-3 mr-1" />Sal</Badge>
            )}
            {credit.clientsEligibles.includes('independant') && (
              <Badge variant="outline" className="text-xs"><Briefcase className="w-3 h-3 mr-1" />Ind</Badge>
            )}
            {credit.clientsEligibles.includes('entreprise') && (
              <Badge variant="outline" className="text-xs"><Building2 className="w-3 h-3 mr-1" />Ent</Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline" className="text-xs">
              {credit.nbOctrois} octrois
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onEdit}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggle}
            >
              {credit.actif ? (
                <PauseCircle className="w-4 h-4 text-warning" />
              ) : (
                <PlayCircle className="w-4 h-4 text-success" />
              )}
            </Button>
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
        
        {/* Motif de suspension */}
        {!credit.actif && credit.motifSuspension && (
          <div className="mt-2 p-2 rounded bg-warning/10 text-xs flex items-start gap-2">
            <AlertTriangle className="w-3 h-3 text-warning mt-0.5" />
            <span className="text-muted-foreground">Motif: {credit.motifSuspension}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
