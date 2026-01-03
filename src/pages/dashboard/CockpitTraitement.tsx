import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDossiers } from '@/hooks/useDossiers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ArrowLeft,
  Building2,
  Users,
  Briefcase,
  Eye,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Save,
  ChevronRight,
  Download,
  ShoppingCart,
  CreditCard,
  Shield,
  Upload,
  Landmark,
  AlertCircle,
  Loader2,
  XCircle,
  Home,
  Car,
  UserCheck,
  UsersRound,
  Banknote,
  FileCheck,
  Plus,
  Calendar,
  Calculator,
  Trash2,
} from 'lucide-react';
import { 
  clients, companies, typesCredit, typesGarantie, generateCreditsInterne, generateCreditsBEAC, 
  ClientSalarie, ClientIndependant, ClientEntreprise, Client, verifierEligibilite, reglesOctroi 
} from '@/data/mockData';
import { formatXAF, formatDuree, formatPourcentage, calculerMensualite, calculerCoutTotal, getInitials, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

// Helper pour formater les montants
const formatMontantDisplay = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Helper pour obtenir le nom du mois en français
const getMonthName = (date: Date): string => {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return months[date.getMonth()];
};

// Eligibility Check Dialog with Animation
function EligibilityCheckDialog({ 
  isOpen, 
  onClose, 
  client, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  client: Client;
  onSuccess: () => void;
}) {
  const [stage, setStage] = useState<'checking' | 'success' | 'failed'>('checking');
  const [progress, setProgress] = useState(0);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [creditsInterne, setCreditsInterne] = useState<any[]>([]);
  const [creditsBEAC, setCreditsBEAC] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStage('checking');
      setProgress(0);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      const ci = generateCreditsInterne(client.id);
      const cb = generateCreditsBEAC(client.id);
      setCreditsInterne(ci);
      setCreditsBEAC(cb);

      setTimeout(() => {
        const result = verifierEligibilite(client, 'conso', 1000000, ci, cb);
        setEligibilityResult(result);
        setStage(result.eligible ? 'success' : 'failed');
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [isOpen, client]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {stage === 'checking' && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            {stage === 'success' && <CheckCircle2 className="w-5 h-5 text-success" />}
            {stage === 'failed' && <XCircle className="w-5 h-5 text-destructive" />}
            Vérification de l'éligibilité
          </DialogTitle>
        </DialogHeader>

        {stage === 'checking' && (
          <div className="py-8 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              </div>
              <p className="text-lg font-medium text-center">Vérification de l'éligibilité</p>
              <p className="text-sm text-muted-foreground text-center">Veuillez patienter...</p>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className={cn("flex items-center gap-2", progress > 20 && "text-foreground")}>
                {progress > 20 ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                Vérification du profil client
              </div>
              <div className={cn("flex items-center gap-2", progress > 40 && "text-foreground")}>
                {progress > 40 ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                Analyse des engagements internes
              </div>
              <div className={cn("flex items-center gap-2", progress > 60 && "text-foreground")}>
                {progress > 60 ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                Consultation Centrale des Risques BEAC
              </div>
              <div className={cn("flex items-center gap-2", progress > 80 && "text-foreground")}>
                {progress > 80 ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                Calcul du score d'éligibilité
              </div>
            </div>
          </div>
        )}

        {stage === 'success' && (
          <div className="py-6 space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-success">Client Éligible</p>
                <p className="text-sm text-muted-foreground">Score: {eligibilityResult?.score}/100</p>
              </div>
            </div>
            <Button variant="gold" className="w-full" onClick={onSuccess}>
              Continuer vers le Cockpit
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {stage === 'failed' && eligibilityResult && (
          <div className="py-6 space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-destructive">Client Non Éligible</p>
                <p className="text-sm text-muted-foreground">Score: {eligibilityResult.score}/100</p>
              </div>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <p className="text-sm font-medium">Raisons du refus :</p>
              {eligibilityResult.raisons.map((raison: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 text-sm">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span>{raison}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Fermer
              </Button>
              <Button variant="gold" className="flex-1" onClick={onSuccess}>
                Continuer malgré tout
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// KYC Form Component for clients without KYC
function KYCFormDialog({ client, onComplete }: { client: Client; onComplete: () => void }) {
  const [formData, setFormData] = useState({
    nom: (client as any).nom || '',
    prenom: (client as any).prenom || '',
    dateNaissance: '',
    lieuNaissance: '',
    sexe: (client as any).sexe || 'M',
    nationalite: 'Camerounaise',
    cni: '',
    adresse: '',
    telephone: (client as any).telephone || '',
    email: (client as any).email || '',
    situationMatrimoniale: '',
    personnesCharge: 0,
  });

  const handleSave = () => {
    toast({
      title: "Dossier créé",
      description: "La fiche KYC a été créée avec succès",
    });
    onComplete();
  };

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Nom</Label>
          <Input value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="input-dark h-9" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Prénom</Label>
          <Input value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="input-dark h-9" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Date de naissance</Label>
          <Input type="date" value={formData.dateNaissance} onChange={e => setFormData({...formData, dateNaissance: e.target.value})} className="input-dark h-9" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Lieu de naissance</Label>
          <Input value={formData.lieuNaissance} onChange={e => setFormData({...formData, lieuNaissance: e.target.value})} className="input-dark h-9" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">N° CNI</Label>
          <Input value={formData.cni} onChange={e => setFormData({...formData, cni: e.target.value})} className="input-dark h-9" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Téléphone</Label>
          <Input value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="input-dark h-9" />
        </div>
      </div>
      <Button variant="gold" className="w-full" onClick={handleSave}>
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Valider la fiche KYC
      </Button>
    </div>
  );
}

// Full KYC Details Dialog
function KYCDetailsDialog({ client }: { client: Client }) {
  const getClientDetails = () => {
    if (client.type === 'salarie') {
      const s = client as ClientSalarie;
      const emp = companies.find(c => c.id === s.employeurId);
      return {
        identification: [
          { label: 'Nom', value: s.nom },
          { label: 'Prénom', value: s.prenom },
          { label: 'Date de naissance', value: s.dateNaissance || 'N/A' },
          { label: 'Lieu de naissance', value: s.lieuNaissance || 'N/A' },
          { label: 'Sexe', value: s.sexe === 'M' ? 'Masculin' : 'Féminin' },
          { label: 'Nationalité', value: s.nationalite || 'Camerounaise' },
          { label: 'N° CNI', value: s.cni || 'N/A' },
          { label: 'Adresse', value: s.adresse || 'N/A' },
          { label: 'Téléphone', value: s.telephone },
          { label: 'Email', value: s.email },
        ],
        social: [
          { label: 'Situation matrimoniale', value: s.situationMatrimoniale || 'N/A' },
          { label: 'Personnes à charge', value: s.personnesCharge },
        ],
        professionnel: [
          { label: 'Employeur', value: emp?.name || 'N/A' },
          { label: 'Fonction', value: s.fonction },
          { label: 'Revenu net mensuel', value: formatXAF(s.revenuNet) },
          { label: 'Ancienneté emploi', value: formatDuree(s.ancienneteEmploi) },
        ],
        bancaire: [
          { label: 'Ancienneté banque', value: formatDuree(s.ancienneteBanque) },
        ],
      };
    } else if (client.type === 'independant') {
      const i = client as ClientIndependant;
      return {
        identification: [
          { label: 'Nom', value: i.nom },
          { label: 'Prénom', value: i.prenom },
          { label: 'Date de naissance', value: i.dateNaissance || 'N/A' },
          { label: 'Lieu de naissance', value: i.lieuNaissance || 'N/A' },
          { label: 'Sexe', value: i.sexe === 'M' ? 'Masculin' : 'Féminin' },
          { label: 'Nationalité', value: i.nationalite || 'Camerounaise' },
          { label: 'N° CNI', value: i.cni || 'N/A' },
          { label: 'Adresse', value: i.adresse || 'N/A' },
          { label: 'Téléphone', value: i.telephone },
          { label: 'Email', value: i.email },
        ],
        social: [
          { label: 'Situation matrimoniale', value: i.situationMatrimoniale || 'N/A' },
          { label: 'Personnes à charge', value: i.personnesCharge || 0 },
        ],
        professionnel: [
          { label: 'Activité', value: i.activite },
          { label: 'Secteur', value: i.secteur },
          { label: 'Chiffre d\'affaires mensuel', value: formatXAF(i.chiffreAffaires) },
          { label: 'Marge nette', value: formatPourcentage(i.margeNette) },
          { label: 'Ancienneté activité', value: formatDuree(i.ancienneteActivite || 0) },
        ],
        bancaire: [
          { label: 'Ancienneté banque', value: formatDuree(i.ancienneteBanque) },
        ],
      };
    } else {
      const e = client as ClientEntreprise;
      const comp = companies.find(c => c.id === e.companyId);
      return {
        identification: [
          { label: 'Dénomination', value: comp?.name || 'N/A' },
          { label: 'Sigle', value: comp?.sigle || 'N/A' },
          { label: 'RCCM', value: comp?.rccm || 'N/A' },
          { label: 'Siège', value: comp?.siege || 'N/A' },
          { label: 'Secteur', value: comp?.secteur || 'N/A' },
        ],
        social: [
          { label: 'Responsable', value: comp?.responsable || 'N/A' },
          { label: 'Nombre d\'employés', value: comp?.nbEmployes || 0 },
        ],
        professionnel: [
          { label: 'Date création', value: comp?.dateCreation || 'N/A' },
        ],
        bancaire: [],
      };
    }
  };

  const details = getClientDetails();

  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Dossier Client Complet</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-6 mt-4">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-semibold mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Identification</h4>
            <div className="space-y-2 text-sm">
              {details.identification.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Situation Sociale</h4>
            <div className="space-y-2 text-sm">
              {details.social.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-semibold mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Situation Professionnelle</h4>
            <div className="space-y-2 text-sm">
              {details.professionnel.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          {details.bancaire.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2"><Landmark className="w-4 h-4" /> Informations Bancaires</h4>
              <div className="space-y-2 text-sm">
                {details.bancaire.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-muted-foreground">{item.label}:</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

// Amortization Plan Dialog with months instead of numbers
function AmortizationPlanDialog({ 
  montant, 
  taux, 
  duree, 
  differe,
  mensualite 
}: { 
  montant: number; 
  taux: number; 
  duree: number; 
  differe: number;
  mensualite: number;
}) {
  const generatePlan = () => {
    const plan = [];
    let solde = montant;
    const tauxMensuel = taux / 100 / 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + 1); // Commence le mois prochain
    
    // Période de différé (intérêts seulement)
    for (let i = 0; i < differe; i++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + i);
      const interets = Math.round(solde * tauxMensuel);
      plan.push({
        echeance: i + 1,
        mois: `${getMonthName(currentDate)} ${currentDate.getFullYear()}`,
        capital: 0,
        interets,
        mensualite: interets,
        solde,
        type: 'Différé'
      });
    }
    
    // Période de remboursement normal
    for (let i = 0; i < duree; i++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + differe + i);
      const interets = Math.round(solde * tauxMensuel);
      const capital = mensualite - interets;
      solde = Math.max(0, solde - capital);
      plan.push({
        echeance: differe + i + 1,
        mois: `${getMonthName(currentDate)} ${currentDate.getFullYear()}`,
        capital: Math.round(capital),
        interets,
        mensualite,
        solde: Math.round(solde),
        type: 'Normal'
      });
    }
    
    return plan;
  };

  const plan = generatePlan();
  const totalInterets = plan.reduce((sum, p) => sum + p.interets, 0);
  const totalCapital = plan.reduce((sum, p) => sum + p.capital, 0);

  return (
    <DialogContent className="max-w-4xl max-h-[85vh]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Plan d'Amortissement
        </DialogTitle>
      </DialogHeader>
      
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-primary/10 text-center">
          <p className="text-sm text-muted-foreground">Capital emprunté</p>
          <p className="font-bold text-primary">{formatMontantDisplay(montant)}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Total intérêts</p>
          <p className="font-bold">{formatMontantDisplay(totalInterets)}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Coût total</p>
          <p className="font-bold">{formatMontantDisplay(montant + totalInterets)}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Mensualité</p>
          <p className="font-bold text-primary">{formatMontantDisplay(mensualite)}</p>
        </div>
      </div>

      <div className="max-h-[50vh] overflow-auto border rounded-lg">
        <Table>
          <TableHeader className="sticky top-0 bg-primary text-primary-foreground">
            <TableRow>
              <TableHead className="text-primary-foreground">N°</TableHead>
              <TableHead className="text-primary-foreground">Période</TableHead>
              <TableHead className="text-primary-foreground text-right">Capital</TableHead>
              <TableHead className="text-primary-foreground text-right">Intérêts</TableHead>
              <TableHead className="text-primary-foreground text-right">Mensualité</TableHead>
              <TableHead className="text-primary-foreground text-right">Solde restant</TableHead>
              <TableHead className="text-primary-foreground text-center">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plan.map((row, idx) => (
              <TableRow key={row.echeance} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                <TableCell className="font-medium">{row.echeance}</TableCell>
                <TableCell>{row.mois}</TableCell>
                <TableCell className="text-right">{formatMontantDisplay(row.capital)}</TableCell>
                <TableCell className="text-right">{formatMontantDisplay(row.interets)}</TableCell>
                <TableCell className="text-right font-medium">{formatMontantDisplay(row.mensualite)}</TableCell>
                <TableCell className="text-right">{formatMontantDisplay(row.solde)}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={row.type === 'Différé' ? 'secondary' : 'outline'} className="text-xs">
                    {row.type}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  );
}

// Garantie saved type
interface GarantieSaved {
  id: string;
  type: string;
  typeLabel: string;
  valeurEstimee: number;
  details: Record<string, string>;
}

export default function CockpitTraitement() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { createDossier, loading: dossierLoading } = useDossiers();
  const client = clients.find(c => c.id === clientId);
  const [showGaranties, setShowGaranties] = useState(false);
  const [showKycDialog, setShowKycDialog] = useState(false);
  const [kycCompleted, setKycCompleted] = useState(client?.kycComplete || false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAmortissement, setShowAmortissement] = useState(false);
  
  // Saved guarantees
  const [garantiesSaved, setGarantiesSaved] = useState<GarantieSaved[]>([]);
  
  // Credit form state
  const [creditForm, setCreditForm] = useState({
    typeCredit: '',
    montant: '',
    periodicite: 'mois',
    duree: '24',
    differePeriodicite: 'mois',
    differe: '0',
  });

  // Garantie form state
  const [garantieForm, setGarantieForm] = useState({
    type: '',
    nomCaution: '',
    cniCaution: '',
    revenuCaution: '',
    lienParente: '',
    telephone: '',
    employeur: '',
    localisation: '',
    titreFoncier: '',
    valeurBien: '',
    superficie: '',
    marque: '',
    modele: '',
    annee: '',
    chassis: '',
    immatriculation: '',
    montantEpargne: '',
    typeEpargne: '',
    valeurEstimee: '',
  });

  const [creditsInterne, setCreditsInterne] = useState<ReturnType<typeof generateCreditsInterne>>([]);
  const [creditsBEAC, setCreditsBEAC] = useState<ReturnType<typeof generateCreditsBEAC>>([]);

  useEffect(() => {
    if (clientId) {
      setCreditsInterne(generateCreditsInterne(clientId));
      setCreditsBEAC(generateCreditsBEAC(clientId));
    }
  }, [clientId]);

  if (!client) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Client non trouvé</p>
      </div>
    );
  }

  // Get active credit types based on client type
  const activeTypesCredit = typesCredit.filter(t => {
    const regle = reglesOctroi.find(r => r.creditTypeId === t.id);
    if (!regle || !regle.actif) return false;
    return regle.clientsEligibles.includes(client.type);
  });

  const selectedCredit = typesCredit.find(t => t.id === creditForm.typeCredit);
  const montant = parseInt(creditForm.montant.replace(/\s/g, '')) || 0;
  const dureeNum = Math.max(1, parseInt(creditForm.duree) || 1);
  const differeNum = Math.max(0, parseInt(creditForm.differe) || 0);
  const dureeEnMois = creditForm.periodicite === 'semaines' ? Math.ceil(dureeNum / 4) : dureeNum;
  const differeEnMois = creditForm.differePeriodicite === 'semaines' ? Math.ceil(differeNum / 4) : differeNum;
  
  const mensualite = selectedCredit ? calculerMensualite(montant, selectedCredit.taux, dureeEnMois, differeEnMois) : 0;
  const coutTotal = calculerCoutTotal(mensualite, dureeEnMois, differeEnMois);

  // Calculate risks
  const totalCredits = creditsInterne.length;
  const totalMontant = creditsInterne.reduce((sum, c) => sum + c.montantInitial, 0);
  const totalEncours = creditsInterne.reduce((sum, c) => sum + c.encours, 0);
  const totalImpayes = creditsInterne.reduce((sum, c) => sum + c.impayes, 0);
  const scoreInterne = totalImpayes === 0 ? 'A' : totalImpayes < 500000 ? 'B' : 'C';
  const statutInterne = totalImpayes === 0 ? 'Sain' : totalImpayes < 500000 ? 'Sensible' : 'Douteux';

  const totalCreditsBEAC = creditsBEAC.length;
  const totalMontantBEAC = creditsBEAC.reduce((sum, c) => sum + c.montantInitial, 0);
  const totalEncoursBEAC = creditsBEAC.reduce((sum, c) => sum + c.soldeRestant, 0);
  const totalImpayesBEAC = creditsBEAC.reduce((sum, c) => sum + c.impayes, 0);
  const scoreBEAC = totalImpayesBEAC === 0 ? 'A' : totalImpayesBEAC < 1000000 ? 'B' : 'C';
  const statutBEAC = totalImpayesBEAC === 0 ? 'Sain' : totalImpayesBEAC < 1000000 ? 'Douteux' : 'Compromis';

  const handleMontantChange = (value: string) => {
    const numericValue = value.replace(/\s/g, '').replace(/\D/g, '');
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    setCreditForm(prev => ({ ...prev, montant: formatted }));
  };

  const handleDureeChange = (value: string) => {
    const num = Math.max(1, parseInt(value) || 1);
    setCreditForm(prev => ({ ...prev, duree: String(num) }));
  };

  const handleDiffereChange = (value: string) => {
    const num = Math.max(0, parseInt(value) || 0);
    setCreditForm(prev => ({ ...prev, differe: String(num) }));
  };

  const handleSuivant = () => {
    if (!creditForm.typeCredit || !montant) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir les informations du crédit",
        variant: "destructive",
      });
      return;
    }
    setShowGaranties(true);
  };

  const handleAddGarantie = () => {
    if (!garantieForm.type || !garantieForm.valeurEstimee) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type et la valeur estimée",
        variant: "destructive",
      });
      return;
    }

    const typeGarantie = typesGarantie.find(t => t.id === garantieForm.type);
    const newGarantie: GarantieSaved = {
      id: `g_${Date.now()}`,
      type: garantieForm.type,
      typeLabel: typeGarantie?.label || '',
      valeurEstimee: parseInt(garantieForm.valeurEstimee.replace(/\s/g, '')) || 0,
      details: { ...garantieForm },
    };

    setGarantiesSaved(prev => [...prev, newGarantie]);
    
    // Reset form
    setGarantieForm({
      type: '',
      nomCaution: '',
      cniCaution: '',
      revenuCaution: '',
      lienParente: '',
      telephone: '',
      employeur: '',
      localisation: '',
      titreFoncier: '',
      valeurBien: '',
      superficie: '',
      marque: '',
      modele: '',
      annee: '',
      chassis: '',
      immatriculation: '',
      montantEpargne: '',
      typeEpargne: '',
      valeurEstimee: '',
    });

    toast({
      title: "Garantie ajoutée",
      description: `${typeGarantie?.label} enregistrée. Vous pouvez ajouter une autre garantie.`,
    });
  };

  const handleRemoveGarantie = (id: string) => {
    setGarantiesSaved(prev => prev.filter(g => g.id !== id));
    toast({
      title: "Garantie supprimée",
      description: "La garantie a été retirée de la liste",
    });
  };

  const handleEnregistrer = async () => {
    try {
      // Create dossier in database
      await createDossier({
        client_id: clientId || 'unknown',
        montant: montant,
        duree: dureeEnMois,
        differe: differeEnMois,
        credit_type_id: creditForm.typeCredit || null,
        status: 'panier',
        garanties: garantiesSaved as any,
        kyc_data: client ? {
          type: client.type,
          nom: (client as any).nom || (client as any).companyId,
          prenom: (client as any).prenom,
        } : {} as any
      });

      addNotification({
        title: "Dossier enregistré",
        message: `Le dossier a été ajouté au panier`,
        type: "success",
        link: "/dashboard/panier"
      });
      toast({
        title: "Dossier enregistré",
        description: "Le dossier a été ajouté au panier et sera analysé par l'IA",
      });
      navigate('/dashboard/panier');
    } catch (error) {
      console.error('Error creating dossier:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le dossier",
        variant: "destructive"
      });
    }
  };

  const handleTelechargerPDF = () => {
    const doc = new jsPDF();
    const clientName = getClientName();
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('E³W - Dossier de Crédit', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le ${dateStr} à ${timeStr}`, 105, 28, { align: 'center' });
    
    // Section Client
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('1. INFORMATIONS CLIENT', 14, 45);
    
    const clientData = client.type === 'salarie' 
      ? [
          ['Nom complet', `${(client as ClientSalarie).prenom} ${(client as ClientSalarie).nom}`],
          ['Type', 'Salarié'],
          ['Employeur', companies.find(c => c.id === (client as ClientSalarie).employeurId)?.name || 'N/A'],
          ['Fonction', (client as ClientSalarie).fonction],
          ['Revenu net mensuel', formatMontantDisplay((client as ClientSalarie).revenuNet)],
          ['Ancienneté Emploi', formatDuree((client as ClientSalarie).ancienneteEmploi)],
          ['Ancienneté Banque', formatDuree((client as ClientSalarie).ancienneteBanque)],
          ['Personnes à charge', String((client as ClientSalarie).personnesCharge)],
        ]
      : client.type === 'independant'
      ? [
          ['Nom complet', `${(client as ClientIndependant).prenom} ${(client as ClientIndependant).nom}`],
          ['Type', 'Indépendant'],
          ['Activité', (client as ClientIndependant).activite],
          ['Secteur', (client as ClientIndependant).secteur],
          ['CA Mensuel', formatMontantDisplay((client as ClientIndependant).chiffreAffaires)],
          ['Marge nette', formatPourcentage((client as ClientIndependant).margeNette)],
          ['Ancienneté Banque', formatDuree((client as ClientIndependant).ancienneteBanque)],
        ]
      : [
          ['Entreprise', companies.find(c => c.id === (client as ClientEntreprise).companyId)?.name || 'N/A'],
          ['Type', 'Entreprise'],
          ['RCCM', companies.find(c => c.id === (client as ClientEntreprise).companyId)?.rccm || 'N/A'],
        ];
    
    autoTable(doc, {
      startY: 50,
      head: [['Champ', 'Valeur']],
      body: clientData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: { 1: { halign: 'right' } },
    });
    
    // Section Crédit
    let currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('2. INFORMATIONS CRÉDIT', 14, currentY);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Paramètre', 'Valeur']],
      body: [
        ['Type de crédit', selectedCredit?.label || 'N/A'],
        ['Montant demandé', formatMontantDisplay(montant)],
        ['Durée', `${creditForm.duree} ${creditForm.periodicite}`],
        ['Taux d\'intérêt', selectedCredit ? formatPourcentage(selectedCredit.taux) : 'N/A'],
        ['Différé', `${creditForm.differe} ${creditForm.differePeriodicite}`],
        ['Mensualité estimée', formatMontantDisplay(mensualite)],
        ['Coût total', formatMontantDisplay(coutTotal)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: { 1: { halign: 'right' } },
    });
    
    // Section Garanties
    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('3. GARANTIES', 14, currentY);
    
    const garantiesData = garantiesSaved.length > 0
      ? garantiesSaved.map(g => [g.typeLabel, formatMontantDisplay(g.valeurEstimee)])
      : [['Aucune garantie enregistrée', '-']];
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Type de garantie', 'Valeur estimée']],
      body: garantiesData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: { 1: { halign: 'right' } },
    });
    
    // Section Engagements
    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('4. ENGAGEMENTS EXISTANTS', 14, currentY);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Source', 'Nb Crédits', 'Encours', 'Impayés', 'Score', 'Statut']],
      body: [
        ['Banque Interne', String(totalCredits), formatMontantDisplay(totalEncours), formatMontantDisplay(totalImpayes), scoreInterne, statutInterne],
        ['Centrale BEAC', String(totalCreditsBEAC), formatMontantDisplay(totalEncoursBEAC), formatMontantDisplay(totalImpayesBEAC), scoreBEAC, statutBEAC],
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`E³W - Epsilon Early Warning Engine | ${dateStr} ${timeStr} | Page ${i}/${pageCount}`, 105, 290, { align: 'center' });
    }
    
    doc.save(`Dossier_Credit_${clientName.replace(/\s/g, '_')}_${now.toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF généré",
      description: "Le dossier a été téléchargé",
    });
  };

  const getClientName = () => {
    if (client.type !== 'entreprise') {
      return `${(client as any).prenom} ${(client as any).nom}`;
    }
    const company = companies.find(c => c.id === (client as ClientEntreprise).companyId);
    return company?.name || 'Entreprise';
  };

  const needsKyc = !kycCompleted && client.type === 'independant';

  const totalGarantiesValue = garantiesSaved.reduce((sum, g) => sum + g.valeurEstimee, 0);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col animate-fade-in overflow-hidden p-1">
      {/* Header */}
      <div className="flex items-center gap-4 mb-1 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold font-display">Cockpit de Traitement</h1>
        <Badge variant="outline" className="ml-2">
          {client.type === 'salarie' ? 'Salarié' : client.type === 'independant' ? 'Indépendant' : 'Entreprise'}
        </Badge>
        {kycCompleted && <CheckCircle2 className="w-5 h-5 text-success" />}
        <span className="text-sm text-muted-foreground ml-auto">{getClientName()}</span>
      </div>

      {/* KYC Warning */}
      {needsKyc && (
        <div className="mb-1 p-2 bg-warning/10 border border-warning/30 rounded-lg flex items-center gap-3 flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-warning" />
          <span className="text-sm">Ce client n'a pas encore de fiche KYC complète.</span>
          <Dialog open={showKycDialog} onOpenChange={setShowKycDialog}>
            <DialogTrigger asChild>
              <Button variant="warning" size="sm" className="ml-auto">
                <FileText className="w-4 h-4 mr-2" />
                Créer Dossier Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer le Dossier Client</DialogTitle>
              </DialogHeader>
              <KYCFormDialog 
                client={client} 
                onComplete={() => {
                  setKycCompleted(true);
                  setShowKycDialog(false);
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Main Grid - NO SCROLL */}
      <div className="flex-1 grid grid-rows-2 gap-1 min-h-0">
        {/* Row 1: Zone A (1/3) + Zones B & C (2/3) */}
        <div className="grid grid-cols-3 gap-1 min-h-0">
          {/* Zone A - Client Synthèse */}
          <Card className="border-4 border-primary/50 overflow-hidden flex flex-col bg-card shadow-lg">
            <div className="bg-primary/20 px-3 py-1.5 flex items-center gap-2 font-bold text-sm border-b-2 border-primary/30">
              {client.type === 'salarie' ? <Users className="w-4 h-4 text-primary" /> : 
               client.type === 'independant' ? <Briefcase className="w-4 h-4 text-primary" /> : 
               <Building2 className="w-4 h-4 text-primary" />}
              <span>Zone A - Synthèse Client</span>
            </div>
            <div className="flex-1 p-2 overflow-hidden">
              <ZoneClientSynthese client={client} />
            </div>
            <div className="p-2 border-t-2 border-primary/30">
              <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Voir Plus
                  </Button>
                </DialogTrigger>
                <KYCDetailsDialog client={client} />
              </Dialog>
            </div>
          </Card>

          {/* Zones B & C */}
          <div className="col-span-2 grid grid-rows-2 gap-1 min-h-0">
            {/* Zone B - Banque Interne */}
            <Card className="border-4 border-info/50 overflow-hidden flex flex-col bg-card shadow-lg">
              <div className="bg-info/20 px-3 py-1.5 flex items-center gap-2 font-bold text-sm border-b-2 border-info/30">
                <Landmark className="w-4 h-4 text-info" />
                <span>Zone B - Données Bancaires Internes</span>
              </div>
              <div className="flex-1 p-2">
                <ZoneRisques 
                  type="interne"
                  nbCredits={totalCredits}
                  montantGlobal={totalMontant}
                  encours={totalEncours}
                  impayes={totalImpayes}
                  score={scoreInterne}
                  statut={statutInterne}
                  credits={creditsInterne}
                  client={client}
                />
              </div>
            </Card>

            {/* Zone C - Centrale des Risques */}
            <Card className="border-4 border-warning/50 overflow-hidden flex flex-col bg-card shadow-lg">
              <div className="bg-warning/20 px-3 py-1.5 flex items-center gap-2 font-bold text-sm border-b-2 border-warning/30">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span>Zone C - Centrale des Risques (BEAC)</span>
              </div>
              <div className="flex-1 p-2">
                <ZoneRisques 
                  type="beac"
                  nbCredits={totalCreditsBEAC}
                  montantGlobal={totalMontantBEAC}
                  encours={totalEncoursBEAC}
                  impayes={totalImpayesBEAC}
                  score={scoreBEAC}
                  statut={statutBEAC}
                  creditsBEAC={creditsBEAC}
                  client={client}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Row 2: Zone D (Credit) / Zone E (Garanties) */}
        <div className="min-h-0">
          {!showGaranties ? (
            /* Zone D - Crédit */
            <Card className="border-4 border-success/50 h-full flex flex-col bg-card shadow-lg">
              <div className="bg-success/20 px-3 py-1.5 flex items-center gap-2 font-bold text-sm border-b-2 border-success/30">
                <CreditCard className="w-4 h-4 text-success" />
                <span>Zone D - Informations sur le Crédit</span>
              </div>
              <div className="flex-1 p-2 overflow-hidden">
                <div className="grid grid-cols-6 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Type de Crédit</Label>
                    <Select value={creditForm.typeCredit} onValueChange={(v) => setCreditForm(p => ({...p, typeCredit: v}))}>
                      <SelectTrigger className="input-dark h-8"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {activeTypesCredit.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Montant</Label>
                    <Input value={creditForm.montant} onChange={(e) => handleMontantChange(e.target.value)} placeholder="0" className="input-dark h-8" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Périodicité</Label>
                    <Select value={creditForm.periodicite} onValueChange={(v) => setCreditForm(p => ({...p, periodicite: v}))}>
                      <SelectTrigger className="input-dark h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mois">Mois</SelectItem>
                        <SelectItem value="semaines">Semaines</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Durée ({creditForm.periodicite})</Label>
                    <Input type="number" min="1" value={creditForm.duree} onChange={(e) => handleDureeChange(e.target.value)} className="input-dark h-8" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Différé</Label>
                    <div className="flex gap-1">
                      <Select value={creditForm.differePeriodicite} onValueChange={(v) => setCreditForm(p => ({...p, differePeriodicite: v}))}>
                        <SelectTrigger className="input-dark h-8 w-14"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mois">M</SelectItem>
                          <SelectItem value="semaines">S</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="number" min="0" value={creditForm.differe} onChange={(e) => handleDiffereChange(e.target.value)} className="input-dark h-8 flex-1" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Taux (%)</Label>
                    <Input value={selectedCredit ? formatPourcentage(selectedCredit.taux) : '-'} readOnly className="input-dark h-8 bg-muted/50" />
                  </div>
                </div>
                
                {/* Résultat */}
                <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-border">
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Mensualité</p>
                    <p className="font-bold text-primary text-sm">{mensualite ? formatMontantDisplay(mensualite) : '-'}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Coût Total</p>
                    <p className="font-bold text-sm">{coutTotal ? formatMontantDisplay(coutTotal) : '-'}</p>
                  </div>
                  <div>
                    <Dialog open={showAmortissement} onOpenChange={setShowAmortissement}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full h-full" disabled={!mensualite}>
                          <Calculator className="w-4 h-4 mr-1" />
                          Plan Amortissement
                        </Button>
                      </DialogTrigger>
                      {mensualite > 0 && (
                        <AmortizationPlanDialog 
                          montant={montant}
                          taux={selectedCredit?.taux || 0}
                          duree={dureeEnMois}
                          differe={differeEnMois}
                          mensualite={mensualite}
                        />
                      )}
                    </Dialog>
                  </div>
                  <div className="flex items-center justify-end">
                    <Button variant="gold" size="sm" onClick={handleSuivant}>
                      Suivant
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            /* Zone E - Garanties */
            <Card className="border-4 border-purple-500/50 h-full flex flex-col animate-fade-in bg-card shadow-lg">
              <div className="bg-purple-500/20 px-3 py-1.5 flex items-center gap-2 font-bold text-sm border-b-2 border-purple-500/30">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>Zone E - Garanties & Documents</span>
                {garantiesSaved.length > 0 && (
                  <Badge className="ml-auto bg-purple-500/20 text-purple-700">{garantiesSaved.length} garantie(s) - {formatMontantDisplay(totalGarantiesValue)} FCFA</Badge>
                )}
              </div>
              <div className="flex-1 p-2 grid grid-cols-4 gap-2 overflow-hidden">
                {/* Récap crédit + Liste garanties */}
                <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 space-y-1 overflow-y-auto">
                  <p className="text-xs font-medium text-primary">Récapitulatif Crédit</p>
                  <div className="text-[11px] space-y-0.5">
                    <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span>{selectedCredit?.label}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Montant:</span><span>{formatMontantDisplay(montant)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Durée:</span><span>{creditForm.duree} {creditForm.periodicite}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Mensualité:</span><span className="text-primary font-medium">{formatMontantDisplay(mensualite)}</span></div>
                  </div>
                  
                  {/* Liste des garanties enregistrées */}
                  {garantiesSaved.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs font-medium mb-1">Garanties enregistrées:</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {garantiesSaved.map(g => (
                          <div key={g.id} className="flex items-center justify-between text-[10px] p-1 bg-muted/50 rounded group">
                            <span className="truncate flex-1">{g.typeLabel}</span>
                            <span className="font-medium mr-1">{formatMontantDisplay(g.valeurEstimee)}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveGarantie(g.id)}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Type de garantie et champs */}
                <div className="col-span-2 space-y-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Type de Garantie</Label>
                      <Select value={garantieForm.type} onValueChange={(v) => setGarantieForm(p => ({...p, type: v}))}>
                        <SelectTrigger className="input-dark h-8"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                          {typesGarantie.map(t => (
                            <SelectItem key={t.id} value={t.id}>
                              <span className="flex items-center gap-2">
                                {t.id === 'personnelle' && <UserCheck className="w-3 h-3" />}
                                {t.id === 'solidaire' && <UsersRound className="w-3 h-3" />}
                                {t.id === 'immo' && <Home className="w-3 h-3" />}
                                {t.id === 'vehicule' && <Car className="w-3 h-3" />}
                                {t.id === 'epargne' && <Banknote className="w-3 h-3" />}
                                {t.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Valeur estimée (FCFA)</Label>
                      <Input 
                        placeholder="0" 
                        value={garantieForm.valeurEstimee} 
                        onChange={e => {
                          const num = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                          const formatted = num.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
                          setGarantieForm(p => ({...p, valeurEstimee: formatted}));
                        }} 
                        className="input-dark h-8 text-xs" 
                      />
                    </div>
                  </div>
                  
                  {(garantieForm.type === 'personnelle' || garantieForm.type === 'solidaire') && (
                    <div className="space-y-1 animate-fade-in">
                      <Input placeholder="Nom complet de la caution" value={garantieForm.nomCaution} onChange={e => setGarantieForm(p => ({...p, nomCaution: e.target.value}))} className="input-dark h-7 text-xs" />
                      <div className="grid grid-cols-2 gap-1">
                        <Input placeholder="N° CNI" value={garantieForm.cniCaution} onChange={e => setGarantieForm(p => ({...p, cniCaution: e.target.value}))} className="input-dark h-7 text-xs" />
                        <Input placeholder="Téléphone" value={garantieForm.telephone} onChange={e => setGarantieForm(p => ({...p, telephone: e.target.value}))} className="input-dark h-7 text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <Input placeholder="Revenu mensuel" value={garantieForm.revenuCaution} onChange={e => setGarantieForm(p => ({...p, revenuCaution: e.target.value}))} className="input-dark h-7 text-xs" />
                        <Input placeholder="Employeur" value={garantieForm.employeur} onChange={e => setGarantieForm(p => ({...p, employeur: e.target.value}))} className="input-dark h-7 text-xs" />
                      </div>
                    </div>
                  )}
                  
                  {garantieForm.type === 'immo' && (
                    <div className="space-y-1 animate-fade-in">
                      <Input placeholder="Localisation du bien" value={garantieForm.localisation} onChange={e => setGarantieForm(p => ({...p, localisation: e.target.value}))} className="input-dark h-7 text-xs" />
                      <div className="grid grid-cols-2 gap-1">
                        <Input placeholder="N° Titre Foncier" value={garantieForm.titreFoncier} onChange={e => setGarantieForm(p => ({...p, titreFoncier: e.target.value}))} className="input-dark h-7 text-xs" />
                        <Input placeholder="Superficie (m²)" value={garantieForm.superficie} onChange={e => setGarantieForm(p => ({...p, superficie: e.target.value}))} className="input-dark h-7 text-xs" />
                      </div>
                    </div>
                  )}
                  
                  {garantieForm.type === 'vehicule' && (
                    <div className="space-y-1 animate-fade-in">
                      <div className="grid grid-cols-2 gap-1">
                        <Input placeholder="Marque" value={garantieForm.marque} onChange={e => setGarantieForm(p => ({...p, marque: e.target.value}))} className="input-dark h-7 text-xs" />
                        <Input placeholder="Modèle" value={garantieForm.modele} onChange={e => setGarantieForm(p => ({...p, modele: e.target.value}))} className="input-dark h-7 text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <Input placeholder="Année" value={garantieForm.annee} onChange={e => setGarantieForm(p => ({...p, annee: e.target.value}))} className="input-dark h-7 text-xs" />
                        <Input placeholder="Immatriculation" value={garantieForm.immatriculation} onChange={e => setGarantieForm(p => ({...p, immatriculation: e.target.value}))} className="input-dark h-7 text-xs" />
                      </div>
                      <Input placeholder="N° Châssis" value={garantieForm.chassis} onChange={e => setGarantieForm(p => ({...p, chassis: e.target.value}))} className="input-dark h-7 text-xs" />
                    </div>
                  )}

                  {garantieForm.type === 'epargne' && (
                    <div className="space-y-1 animate-fade-in">
                      <Select value={garantieForm.typeEpargne} onValueChange={v => setGarantieForm(p => ({...p, typeEpargne: v}))}>
                        <SelectTrigger className="input-dark h-7 text-xs"><SelectValue placeholder="Type d'épargne" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dav">DAV - Dépôt à Vue</SelectItem>
                          <SelectItem value="dat">DAT - Dépôt à Terme</SelectItem>
                          <SelectItem value="pel">Plan Épargne Logement</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Montant bloqué" value={garantieForm.montantEpargne} onChange={e => setGarantieForm(p => ({...p, montantEpargne: e.target.value}))} className="input-dark h-7 text-xs" />
                    </div>
                  )}

                  {garantieForm.type && (
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleAddGarantie}>
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter cette garantie
                    </Button>
                  )}
                </div>
                
                {/* Upload documents */}
                <div className="space-y-1">
                  <p className="text-xs font-medium">Documents requis</p>
                  <div className="border-2 border-dashed border-border rounded-lg p-2 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground">Glissez vos documents</p>
                  </div>
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex items-center gap-1 p-1 rounded bg-muted/50">
                      <FileCheck className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Acte de caution</span>
                    </div>
                    <div className="flex items-center gap-1 p-1 rounded bg-muted/50">
                      <FileCheck className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">CNI caution</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 p-2 border-t-2 border-purple-500/30">
                <Button variant="ghost" size="sm" onClick={() => setShowGaranties(false)}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={handleTelechargerPDF}>
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
                <Button variant="gold" size="sm" onClick={handleEnregistrer}>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Enregistrer
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Zone Client Synthèse Component
function ZoneClientSynthese({ client }: { client: Client }) {
  if (client.type === 'salarie') {
    const salarie = client as ClientSalarie;
    const employeur = companies.find(c => c.id === salarie.employeurId);
    
    return (
      <div className="flex gap-2 h-full">
        <Avatar className="w-12 h-12 border-2 border-primary/30 flex-shrink-0">
          <AvatarImage src={salarie.avatar} />
          <AvatarFallback className="bg-primary/20 text-primary text-sm">{getInitials(salarie.nom, salarie.prenom)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] overflow-hidden">
          <div><span className="text-muted-foreground">Nom:</span> <span className="font-medium">{salarie.nom}</span></div>
          <div><span className="text-muted-foreground">Prénom:</span> <span className="font-medium">{salarie.prenom}</span></div>
          <div><span className="text-muted-foreground">Âge:</span> <span className="font-medium">{salarie.age} ans</span></div>
          <div><span className="text-muted-foreground">Sexe:</span> <span className="font-medium">{salarie.sexe === 'M' ? 'M' : 'F'}</span></div>
          <div className="flex items-center gap-1"><span className="text-muted-foreground">Employeur:</span> <span className="font-medium">{employeur?.sigle}</span></div>
          <div><span className="text-muted-foreground">Fonction:</span> <span className="font-medium">{salarie.fonction}</span></div>
          <div><span className="text-muted-foreground">Revenu:</span> <span className="font-medium">{formatMontantDisplay(salarie.revenuNet)}</span></div>
          <div><span className="text-muted-foreground">Anc. Banque:</span> <span className="font-medium">{formatDuree(salarie.ancienneteBanque)}</span></div>
          <div><span className="text-muted-foreground">Anc. Emploi:</span> <span className="font-medium">{formatDuree(salarie.ancienneteEmploi)}</span></div>
          <div><span className="text-muted-foreground">Pers. charge:</span> <span className="font-medium">{salarie.personnesCharge}</span></div>
        </div>
      </div>
    );
  }

  if (client.type === 'independant') {
    const independant = client as ClientIndependant;
    return (
      <div className="flex gap-2 h-full">
        <Avatar className="w-12 h-12 border-2 border-primary/30 flex-shrink-0">
          <AvatarImage src={independant.avatar} />
          <AvatarFallback className="bg-primary/20 text-primary text-sm">{getInitials(independant.nom, independant.prenom)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] overflow-hidden">
          <div><span className="text-muted-foreground">Nom:</span> <span className="font-medium">{independant.nom}</span></div>
          <div><span className="text-muted-foreground">Prénom:</span> <span className="font-medium">{independant.prenom}</span></div>
          <div><span className="text-muted-foreground">Âge:</span> <span className="font-medium">{independant.age} ans</span></div>
          <div><span className="text-muted-foreground">Secteur:</span> <span className="font-medium">{independant.secteur}</span></div>
          <div><span className="text-muted-foreground">Activité:</span> <span className="font-medium">{independant.activite}</span></div>
          <div><span className="text-muted-foreground">Anc. Banque:</span> <span className="font-medium">{formatDuree(independant.ancienneteBanque)}</span></div>
          <div><span className="text-muted-foreground">CA:</span> <span className="font-medium">{formatMontantDisplay(independant.chiffreAffaires)}</span></div>
          <div><span className="text-muted-foreground">Marge:</span> <span className="font-medium">{formatPourcentage(independant.margeNette)}</span></div>
        </div>
      </div>
    );
  }

  // Entreprise
  const entreprise = client as ClientEntreprise;
  const company = companies.find(c => c.id === entreprise.companyId);
  return (
    <div className="flex gap-2 h-full">
      {company?.logo ? (
        <img src={company.logo} className="w-12 h-12 object-contain rounded-lg bg-background p-1 flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] overflow-hidden">
        <div className="col-span-2"><span className="text-muted-foreground">Dénomination:</span> <span className="font-medium">{company?.name}</span></div>
        <div><span className="text-muted-foreground">Sigle:</span> <span className="font-medium">{company?.sigle}</span></div>
        <div><span className="text-muted-foreground">RCCM:</span> <span className="font-medium text-xs">{company?.rccm}</span></div>
        <div><span className="text-muted-foreground">Secteur:</span> <span className="font-medium">{company?.secteur}</span></div>
        <div><span className="text-muted-foreground">Responsable:</span> <span className="font-medium">{company?.responsable}</span></div>
      </div>
    </div>
  );
}

// Zone Risques Component
function ZoneRisques({ 
  type, 
  nbCredits, 
  montantGlobal, 
  encours, 
  impayes, 
  score,
  statut,
  credits,
  creditsBEAC,
  client
}: { 
  type: 'interne' | 'beac';
  nbCredits: number;
  montantGlobal: number;
  encours: number;
  impayes: number;
  score: string;
  statut: string;
  credits?: ReturnType<typeof generateCreditsInterne>;
  creditsBEAC?: ReturnType<typeof generateCreditsBEAC>;
  client: Client;
}) {
  const getClientName = () => {
    if (client.type !== 'entreprise') {
      return `${(client as any).prenom} ${(client as any).nom}`;
    }
    const company = companies.find(c => c.id === (client as ClientEntreprise).companyId);
    return company?.name || 'Entreprise';
  };

  return (
    <div className="flex gap-2 items-center h-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-6 gap-1.5 flex-1">
        <div className="p-1.5 rounded-lg bg-muted/50 text-center">
          <p className="text-base font-bold">{nbCredits}</p>
          <p className="text-[9px] text-muted-foreground">Nb Crédits</p>
        </div>
        <div className="p-1.5 rounded-lg bg-muted/50 text-center">
          <p className="text-xs font-bold">{formatMontantDisplay(montantGlobal)}</p>
          <p className="text-[9px] text-muted-foreground">Montant Global</p>
        </div>
        <div className="p-1.5 rounded-lg bg-muted/50 text-center">
          <p className="text-xs font-bold text-primary">{formatMontantDisplay(encours)}</p>
          <p className="text-[9px] text-muted-foreground">Encours</p>
        </div>
        <div className="p-1.5 rounded-lg bg-muted/50 text-center">
          <p className={cn("text-xs font-bold", impayes > 0 ? 'text-destructive' : 'text-success')}>
            {formatMontantDisplay(impayes)}
          </p>
          <p className="text-[9px] text-muted-foreground">Impayés</p>
        </div>
        <div className="p-1.5 rounded-lg bg-muted/50 text-center">
          <p className={cn(
            "text-lg font-bold",
            score === 'A' ? 'text-success' : score === 'B' ? 'text-warning' : 'text-destructive'
          )}>{score}</p>
          <p className="text-[9px] text-muted-foreground">Score</p>
        </div>
        <div className="p-1.5 rounded-lg bg-muted/50 text-center">
          <Badge variant={impayes === 0 ? 'default' : 'destructive'} className="text-[9px] px-1">
            {statut}
          </Badge>
          <p className="text-[9px] text-muted-foreground">Statut</p>
        </div>
      </div>

      {/* Details Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Eye className="w-3 h-3 mr-1" />
            Voir Plus
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{type === 'interne' ? 'Données Bancaires Internes' : 'Centrale des Risques BEAC'}</DialogTitle>
          </DialogHeader>
          
          {/* Synthèse Client */}
          <div className="p-3 rounded-lg bg-muted/30 mb-4">
            <h4 className="font-semibold text-sm mb-2">Synthèse Client</h4>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div><span className="text-muted-foreground">Client:</span> <span className="font-medium">{getClientName()}</span></div>
              <div><span className="text-muted-foreground">Total Crédits:</span> <span className="font-medium">{nbCredits}</span></div>
              <div><span className="text-muted-foreground">Encours Total:</span> <span className="font-medium">{formatMontantDisplay(encours)}</span></div>
              <div><span className="text-muted-foreground">Score:</span> <span className={cn("font-bold", score === 'A' ? 'text-success' : score === 'B' ? 'text-warning' : 'text-destructive')}>{score} - {statut}</span></div>
            </div>
          </div>

          <div className="max-h-[50vh] overflow-auto border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-primary text-primary-foreground">
                <TableRow>
                  {type === 'beac' && <TableHead className="text-primary-foreground text-left">Banque</TableHead>}
                  <TableHead className="text-primary-foreground text-left">{type === 'interne' ? 'Date' : 'Type'}</TableHead>
                  <TableHead className="text-primary-foreground text-left">Type</TableHead>
                  <TableHead className="text-primary-foreground text-right">Montant Initial</TableHead>
                  <TableHead className="text-primary-foreground text-right">{type === 'interne' ? 'Encours' : 'Solde Restant'}</TableHead>
                  <TableHead className="text-primary-foreground text-right">Impayés</TableHead>
                  <TableHead className="text-primary-foreground text-center">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {type === 'interne' && credits?.map((c, idx) => (
                  <TableRow key={c.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                    <TableCell className="text-left">{formatDate(c.dateOctroi)}</TableCell>
                    <TableCell className="text-left">{c.type}</TableCell>
                    <TableCell className="text-right">{formatMontantDisplay(c.montantInitial)}</TableCell>
                    <TableCell className="text-right">{formatMontantDisplay(c.encours)}</TableCell>
                    <TableCell className="text-right">{formatMontantDisplay(c.impayes)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        c.statut === 'sain' ? 'bg-success/20 text-success' :
                        c.statut === 'sensible' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'
                      )}>{c.statut}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {type === 'beac' && creditsBEAC?.map((c, idx) => (
                  <TableRow key={c.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                    <TableCell className="text-left">{c.banque}</TableCell>
                    <TableCell className="text-left">{c.typeEngagement}</TableCell>
                    <TableCell className="text-left">{c.typeEngagement}</TableCell>
                    <TableCell className="text-right">{formatMontantDisplay(c.montantInitial)}</TableCell>
                    <TableCell className="text-right">{formatMontantDisplay(c.soldeRestant)}</TableCell>
                    <TableCell className="text-right">{formatMontantDisplay(c.impayes)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        c.statut === 'sain' ? 'bg-success/20 text-success' :
                        c.statut === 'douteux' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'
                      )}>{c.statut}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {((type === 'interne' && (!credits || credits.length === 0)) || 
                  (type === 'beac' && (!creditsBEAC || creditsBEAC.length === 0))) && (
                  <TableRow><TableCell colSpan={7} className="p-4 text-center text-muted-foreground">Aucun engagement</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
