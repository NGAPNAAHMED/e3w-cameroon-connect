import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { 
  clients, companies, typesCredit, typesGarantie, generateCreditsInterne, generateCreditsBEAC, 
  ClientSalarie, ClientIndependant, ClientEntreprise, Client, verifierEligibilite, reglesOctroi 
} from '@/data/mockData';
import { formatXAF, formatDuree, formatPourcentage, calculerMensualite, calculerCoutTotal, getInitials, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

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
    cniDelivrance: '',
    cniExpiration: '',
    adresse: '',
    ville: '',
    telephone: (client as any).telephone || '',
    email: (client as any).email || '',
    situationMatrimoniale: '',
    personnesCharge: 0,
    typeLogement: '',
    niveauInstruction: '',
    activite: (client as any).activite || '',
    ancienneteActivite: '',
    caMensuel: '',
    marge: '',
    charges: '',
  });

  const handleSave = () => {
    toast({
      title: "Dossier créé",
      description: "La fiche KYC a été créée avec succès",
    });
    onComplete();
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Bloc 1: Identification */}
      <div className="space-y-4">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          <FileText className="w-4 h-4" />
          1. Identification
        </h3>
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
            <Label className="text-xs">Sexe</Label>
            <Select value={formData.sexe} onValueChange={v => setFormData({...formData, sexe: v})}>
              <SelectTrigger className="input-dark h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculin</SelectItem>
                <SelectItem value="F">Féminin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Nationalité</Label>
            <Input value={formData.nationalite} onChange={e => setFormData({...formData, nationalite: e.target.value})} className="input-dark h-9" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">N° CNI</Label>
            <Input value={formData.cni} onChange={e => setFormData({...formData, cni: e.target.value})} className="input-dark h-9" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Adresse</Label>
            <Input value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} className="input-dark h-9" />
          </div>
        </div>
      </div>

      {/* Bloc 2: Situation Sociale */}
      <div className="space-y-4">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          <Users className="w-4 h-4" />
          2. Situation Familiale
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Situation matrimoniale</Label>
            <Select value={formData.situationMatrimoniale} onValueChange={v => setFormData({...formData, situationMatrimoniale: v})}>
              <SelectTrigger className="input-dark h-9"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="celibataire">Célibataire</SelectItem>
                <SelectItem value="marie">Marié(e)</SelectItem>
                <SelectItem value="divorce">Divorcé(e)</SelectItem>
                <SelectItem value="veuf">Veuf(ve)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Personnes à charge</Label>
            <Input type="number" value={formData.personnesCharge} onChange={e => setFormData({...formData, personnesCharge: parseInt(e.target.value) || 0})} className="input-dark h-9" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Type de logement</Label>
            <Select value={formData.typeLogement} onValueChange={v => setFormData({...formData, typeLogement: v})}>
              <SelectTrigger className="input-dark h-9"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="proprietaire">Propriétaire</SelectItem>
                <SelectItem value="locataire">Locataire</SelectItem>
                <SelectItem value="familial">Logement familial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Niveau d'instruction</Label>
            <Select value={formData.niveauInstruction} onValueChange={v => setFormData({...formData, niveauInstruction: v})}>
              <SelectTrigger className="input-dark h-9"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="primaire">Primaire</SelectItem>
                <SelectItem value="secondaire">Secondaire</SelectItem>
                <SelectItem value="superieur">Supérieur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bloc 3: Situation Professionnelle */}
      <div className="space-y-4">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          3. Situation Professionnelle
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Activité principale</Label>
            <Input value={formData.activite} onChange={e => setFormData({...formData, activite: e.target.value})} className="input-dark h-9" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Ancienneté activité (mois)</Label>
            <Input type="number" value={formData.ancienneteActivite} onChange={e => setFormData({...formData, ancienneteActivite: e.target.value})} className="input-dark h-9" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">CA Mensuel (FCFA)</Label>
            <Input value={formData.caMensuel} onChange={e => setFormData({...formData, caMensuel: e.target.value})} className="input-dark h-9" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Marge (%)</Label>
            <Input value={formData.marge} onChange={e => setFormData({...formData, marge: e.target.value})} className="input-dark h-9" />
          </div>
        </div>
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
          <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Documents: Patente, Relevés bancaires</p>
        </div>
      </div>

      {/* Bloc 4: Informations Bancaires */}
      <div className="space-y-4">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          <Landmark className="w-4 h-4" />
          4. Informations Bancaires
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label className="text-xs">Autres comptes bancaires</Label>
            <Input placeholder="Ex: BICEC, UBA..." className="input-dark h-9" />
          </div>
        </div>
      </div>

      <Button variant="gold" className="w-full" onClick={handleSave}>
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Valider la fiche KYC
      </Button>
    </div>
  );
}

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
      
      // Simulate checking animation
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      // Generate credits data
      const ci = generateCreditsInterne(client.id);
      const cb = generateCreditsBEAC(client.id);
      setCreditsInterne(ci);
      setCreditsBEAC(cb);

      // After 2 seconds, show result
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
          { label: 'Revenu net', value: formatXAF(s.revenuNet) },
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
          { label: 'Chiffre d\'affaires', value: formatXAF(i.chiffreAffaires) },
          { label: 'Marge nette', value: formatPourcentage(i.margeNette) },
          { label: 'Ancienneté activité', value: formatDuree(i.ancienneteActivite || 0) },
        ],
        bancaire: [
          { label: 'Ancienneté banque', value: formatDuree(i.ancienneteBanque) },
        ],
      };
    }
    return null;
  };

  const details = getClientDetails();
  if (!details) return null;

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
        </div>
      </div>
    </DialogContent>
  );
}

export default function CockpitTraitement() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  
  const client = clients.find(c => c.id === clientId);
  const [showGaranties, setShowGaranties] = useState(false);
  const [showKycDialog, setShowKycDialog] = useState(false);
  const [kycCompleted, setKycCompleted] = useState(client?.kycComplete || false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
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

  // Get active credit types only
  const activeTypesCredit = typesCredit.filter(t => {
    const regle = reglesOctroi.find(r => r.creditTypeId === t.id);
    return regle?.actif !== false;
  });

  const selectedCredit = typesCredit.find(t => t.id === creditForm.typeCredit);
  const montant = parseInt(creditForm.montant.replace(/\s/g, '')) || 0;
  const dureeEnMois = creditForm.periodicite === 'semaines' 
    ? Math.ceil(parseInt(creditForm.duree) / 4) 
    : parseInt(creditForm.duree);
  const differeEnMois = creditForm.differePeriodicite === 'semaines'
    ? Math.ceil(parseInt(creditForm.differe) / 4)
    : parseInt(creditForm.differe);
  
  const mensualite = selectedCredit ? calculerMensualite(
    montant,
    selectedCredit.taux,
    dureeEnMois,
    differeEnMois
  ) : 0;
  const coutTotal = calculerCoutTotal(mensualite, dureeEnMois, differeEnMois);

  // Calculate risks - same data for both sections
  const totalCredits = creditsInterne.length;
  const totalMontant = creditsInterne.reduce((sum, c) => sum + c.montantInitial, 0);
  const totalEncours = creditsInterne.reduce((sum, c) => sum + c.encours, 0);
  const totalImpayes = creditsInterne.reduce((sum, c) => sum + c.impayes, 0);
  const scoreInterne = totalImpayes === 0 ? 'A' : totalImpayes < 500000 ? 'B' : 'C';

  // BEAC data
  const totalCreditsBEAC = creditsBEAC.length;
  const totalMontantBEAC = creditsBEAC.reduce((sum, c) => sum + c.montantInitial, 0);
  const totalEncoursBEAC = creditsBEAC.reduce((sum, c) => sum + c.soldeRestant, 0);
  const totalImpayesBEAC = creditsBEAC.reduce((sum, c) => sum + c.impayes, 0);
  const scoreBEAC = totalImpayesBEAC === 0 ? 'A' : totalImpayesBEAC < 1000000 ? 'B' : 'C';

  const handleMontantChange = (value: string) => {
    const numericValue = value.replace(/\s/g, '').replace(/\D/g, '');
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    setCreditForm(prev => ({ ...prev, montant: formatted }));
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

  const handleEnregistrer = () => {
    addNotification({
      title: "Dossier enregistré",
      message: `Le dossier a été ajouté au panier`,
      type: "success",
      link: "/dashboard/panier"
    });
    toast({
      title: "Dossier enregistré",
      description: "Le dossier a été ajouté au panier",
    });
    // Reset form
    setCreditForm({ typeCredit: '', montant: '', periodicite: 'mois', duree: '24', differePeriodicite: 'mois', differe: '0' });
    setGarantieForm({ type: '', nomCaution: '', cniCaution: '', revenuCaution: '', lienParente: '', telephone: '', employeur: '', localisation: '', titreFoncier: '', valeurBien: '', superficie: '', marque: '', modele: '', annee: '', chassis: '', immatriculation: '', montantEpargne: '', typeEpargne: '' });
    setShowGaranties(false);
  };

  const handleTelechargerPDF = () => {
    const doc = new jsPDF();
    const clientName = getClientName();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('E³W - Dossier de Crédit', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 28, { align: 'center' });
    
    // Section Client
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('1. INFORMATIONS CLIENT', 14, 45);
    
    const clientData = client.type === 'salarie' 
      ? [
          ['Nom', (client as ClientSalarie).nom],
          ['Prénom', (client as ClientSalarie).prenom],
          ['Type', 'Salarié'],
          ['Employeur', companies.find(c => c.id === (client as ClientSalarie).employeurId)?.name || 'N/A'],
          ['Revenu', formatXAF((client as ClientSalarie).revenuNet)],
          ['Ancienneté Banque', formatDuree((client as ClientSalarie).ancienneteBanque)],
        ]
      : client.type === 'independant'
      ? [
          ['Nom', (client as ClientIndependant).nom],
          ['Prénom', (client as ClientIndependant).prenom],
          ['Type', 'Indépendant'],
          ['Activité', (client as ClientIndependant).activite],
          ['CA Mensuel', formatXAF((client as ClientIndependant).chiffreAffaires)],
          ['Marge', formatPourcentage((client as ClientIndependant).margeNette)],
        ]
      : [
          ['Entreprise', companies.find(c => c.id === (client as ClientEntreprise).companyId)?.name || 'N/A'],
          ['Type', 'Entreprise'],
        ];
    
    autoTable(doc, {
      startY: 50,
      head: [['Champ', 'Valeur']],
      body: clientData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
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
        ['Montant demandé', formatXAF(montant)],
        ['Durée', `${creditForm.duree} ${creditForm.periodicite}`],
        ['Taux d\'intérêt', selectedCredit ? formatPourcentage(selectedCredit.taux) : 'N/A'],
        ['Différé', `${creditForm.differe} ${creditForm.differePeriodicite}`],
        ['Mensualité estimée', formatXAF(mensualite)],
        ['Coût total', formatXAF(coutTotal)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    // Section Garanties
    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('3. GARANTIES', 14, currentY);
    
    const garantieLabel = typesGarantie.find(g => g.id === garantieForm.type)?.label || 'N/A';
    const garantieData: string[][] = [['Type de garantie', garantieLabel]];
    
    if (garantieForm.type === 'personnelle' || garantieForm.type === 'solidaire') {
      garantieData.push(['Nom caution', garantieForm.nomCaution || 'N/A']);
      garantieData.push(['CNI caution', garantieForm.cniCaution || 'N/A']);
      garantieData.push(['Revenu caution', garantieForm.revenuCaution || 'N/A']);
    } else if (garantieForm.type === 'immo') {
      garantieData.push(['Localisation', garantieForm.localisation || 'N/A']);
      garantieData.push(['Titre foncier', garantieForm.titreFoncier || 'N/A']);
      garantieData.push(['Valeur estimée', garantieForm.valeurBien || 'N/A']);
    } else if (garantieForm.type === 'vehicule') {
      garantieData.push(['Véhicule', `${garantieForm.marque} ${garantieForm.modele}` || 'N/A']);
      garantieData.push(['N° Châssis', garantieForm.chassis || 'N/A']);
    }
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Paramètre', 'Valeur']],
      body: garantieData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    // Section Engagements
    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('4. ENGAGEMENTS EXISTANTS', 14, currentY);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Source', 'Nb Crédits', 'Encours', 'Impayés', 'Score']],
      body: [
        ['Banque Interne', String(totalCredits), formatXAF(totalEncours), formatXAF(totalImpayes), scoreInterne],
        ['Centrale BEAC', String(totalCreditsBEAC), formatXAF(totalEncoursBEAC), formatXAF(totalImpayesBEAC), scoreBEAC],
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`E³W - Epsilon Early Warning Engine | Page ${i}/${pageCount}`, 105, 290, { align: 'center' });
    }
    
    doc.save(`Dossier_Credit_${clientName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    
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

  // Check if client needs KYC
  const needsKyc = !kycCompleted && client.type === 'independant';

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold font-display">Cockpit de Traitement</h1>
        <Badge variant="outline" className="ml-2">
          {client.type === 'salarie' ? 'Salarié' : client.type === 'independant' ? 'Indépendant' : 'Entreprise'}
        </Badge>
        {kycCompleted && <CheckCircle2 className="w-5 h-5 text-info" />}
        <span className="text-sm text-muted-foreground ml-auto">{getClientName()}</span>
      </div>

      {/* KYC Warning */}
      {needsKyc && (
        <div className="mb-2 p-2 bg-warning/10 border border-warning/30 rounded-lg flex items-center gap-3 flex-shrink-0">
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
      <div className="flex-1 grid grid-rows-2 gap-2 min-h-0">
        {/* Row 1: Zone A (1/3) + Zones B & C (2/3) */}
        <div className="grid grid-cols-3 gap-2 min-h-0">
          {/* Zone A - Client Synthèse (1/3 width) */}
          <Card className="zone-panel overflow-hidden flex flex-col">
            <div className="zone-title">
              {client.type === 'salarie' ? <Users className="w-4 h-4" /> : 
               client.type === 'independant' ? <Briefcase className="w-4 h-4" /> : 
               <Building2 className="w-4 h-4" />}
              Synthèse Client
            </div>
            <div className="flex-1 overflow-hidden">
              <ZoneClientSynthese client={client} />
            </div>
            {/* Bouton Voir Plus */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir Plus
                </Button>
              </DialogTrigger>
              <KYCDetailsDialog client={client} />
            </Dialog>
          </Card>

          {/* Zones B & C (2/3 width) */}
          <div className="col-span-2 grid grid-rows-2 gap-2 min-h-0">
            {/* Zone B - Banque Interne */}
            <Card className="zone-panel overflow-hidden">
              <div className="zone-title">
                <Landmark className="w-4 h-4" />
                Engagements Internes (La Banque)
              </div>
              <ZoneRisques 
                type="interne"
                nbCredits={totalCredits}
                montantGlobal={totalMontant}
                encours={totalEncours}
                impayes={totalImpayes}
                score={scoreInterne}
                credits={creditsInterne}
              />
            </Card>

            {/* Zone C - Centrale des Risques */}
            <Card className="zone-panel overflow-hidden">
              <div className="zone-title">
                <AlertTriangle className="w-4 h-4" />
                Centrale des Risques (BEAC)
              </div>
              <ZoneRisques 
                type="beac"
                nbCredits={totalCreditsBEAC}
                montantGlobal={totalMontantBEAC}
                encours={totalEncoursBEAC}
                impayes={totalImpayesBEAC}
                score={scoreBEAC}
                creditsBEAC={creditsBEAC}
              />
            </Card>
          </div>
        </div>

        {/* Row 2: Zone D (Credit) / Zone E (Garanties) */}
        <div className="min-h-0 flex flex-col">
          {!showGaranties ? (
            /* Zone D - Crédit */
            <Card className="zone-panel flex-1 flex flex-col">
              <div className="zone-title">
                <CreditCard className="w-4 h-4" />
                Informations sur le Crédit
              </div>
              <div className="grid grid-cols-6 gap-3">
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
                  <Label className="text-xs">Montant (FCFA)</Label>
                  <Input value={creditForm.montant} onChange={(e) => handleMontantChange(e.target.value)} placeholder="0" className="input-dark h-8 number-format" />
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
                  <Input type="number" value={creditForm.duree} onChange={(e) => setCreditForm(p => ({...p, duree: e.target.value}))} className="input-dark h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Différé</Label>
                  <div className="flex gap-1">
                    <Select value={creditForm.differePeriodicite} onValueChange={(v) => setCreditForm(p => ({...p, differePeriodicite: v}))}>
                      <SelectTrigger className="input-dark h-8 w-16"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mois">M</SelectItem>
                        <SelectItem value="semaines">S</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" value={creditForm.differe} onChange={(e) => setCreditForm(p => ({...p, differe: e.target.value}))} className="input-dark h-8 flex-1" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Taux (%)</Label>
                  <Input value={selectedCredit ? formatPourcentage(selectedCredit.taux) : '-'} readOnly className="input-dark h-8 bg-muted/50" />
                </div>
              </div>
              
              {/* Résultat */}
              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border">
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Mensualité</p>
                  <p className="font-bold text-primary text-sm number-format">{mensualite ? formatXAF(mensualite) : '-'}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Coût Total</p>
                  <p className="font-bold text-sm number-format">{coutTotal ? formatXAF(coutTotal) : '-'}</p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="gold" size="sm" onClick={handleSuivant}>
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            /* Zone E - Garanties (Animation slide) */
            <Card className="zone-panel flex-1 flex flex-col animate-fade-in">
              <div className="zone-title">
                <Shield className="w-4 h-4" />
                Garanties & Documents
              </div>
              <div className="flex-1 grid grid-cols-3 gap-3 overflow-hidden">
                {/* Récap crédit (réduit) */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                  <p className="text-xs font-medium text-primary">Récapitulatif Crédit</p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span>{selectedCredit?.label}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Montant:</span><span className="number-format">{formatXAF(montant)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Durée:</span><span>{creditForm.duree} {creditForm.periodicite}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Mensualité:</span><span className="text-primary font-medium number-format">{formatXAF(mensualite)}</span></div>
                  </div>
                </div>

                {/* Type de garantie et champs */}
                <div className="space-y-2">
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
                  
                  {(garantieForm.type === 'personnelle' || garantieForm.type === 'solidaire') && (
                    <div className="space-y-2 animate-fade-in">
                      <Input placeholder="Nom complet de la caution" value={garantieForm.nomCaution} onChange={e => setGarantieForm(p => ({...p, nomCaution: e.target.value}))} className="input-dark h-8 text-xs" />
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="N° CNI" value={garantieForm.cniCaution} onChange={e => setGarantieForm(p => ({...p, cniCaution: e.target.value}))} className="input-dark h-8 text-xs" />
                        <Input placeholder="Téléphone" value={garantieForm.telephone} onChange={e => setGarantieForm(p => ({...p, telephone: e.target.value}))} className="input-dark h-8 text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Revenu mensuel" value={garantieForm.revenuCaution} onChange={e => setGarantieForm(p => ({...p, revenuCaution: e.target.value}))} className="input-dark h-8 text-xs" />
                        <Input placeholder="Employeur" value={garantieForm.employeur} onChange={e => setGarantieForm(p => ({...p, employeur: e.target.value}))} className="input-dark h-8 text-xs" />
                      </div>
                    </div>
                  )}
                  
                  {garantieForm.type === 'immo' && (
                    <div className="space-y-2 animate-fade-in">
                      <Input placeholder="Localisation du bien" value={garantieForm.localisation} onChange={e => setGarantieForm(p => ({...p, localisation: e.target.value}))} className="input-dark h-8 text-xs" />
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="N° Titre Foncier" value={garantieForm.titreFoncier} onChange={e => setGarantieForm(p => ({...p, titreFoncier: e.target.value}))} className="input-dark h-8 text-xs" />
                        <Input placeholder="Superficie (m²)" value={garantieForm.superficie} onChange={e => setGarantieForm(p => ({...p, superficie: e.target.value}))} className="input-dark h-8 text-xs" />
                      </div>
                      <Input placeholder="Valeur estimée (FCFA)" value={garantieForm.valeurBien} onChange={e => setGarantieForm(p => ({...p, valeurBien: e.target.value}))} className="input-dark h-8 text-xs" />
                    </div>
                  )}
                  
                  {garantieForm.type === 'vehicule' && (
                    <div className="space-y-2 animate-fade-in">
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Marque" value={garantieForm.marque} onChange={e => setGarantieForm(p => ({...p, marque: e.target.value}))} className="input-dark h-8 text-xs" />
                        <Input placeholder="Modèle" value={garantieForm.modele} onChange={e => setGarantieForm(p => ({...p, modele: e.target.value}))} className="input-dark h-8 text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Année" value={garantieForm.annee} onChange={e => setGarantieForm(p => ({...p, annee: e.target.value}))} className="input-dark h-8 text-xs" />
                        <Input placeholder="Immatriculation" value={garantieForm.immatriculation} onChange={e => setGarantieForm(p => ({...p, immatriculation: e.target.value}))} className="input-dark h-8 text-xs" />
                      </div>
                      <Input placeholder="N° Châssis" value={garantieForm.chassis} onChange={e => setGarantieForm(p => ({...p, chassis: e.target.value}))} className="input-dark h-8 text-xs" />
                    </div>
                  )}

                  {garantieForm.type === 'epargne' && (
                    <div className="space-y-2 animate-fade-in">
                      <Select value={garantieForm.typeEpargne} onValueChange={v => setGarantieForm(p => ({...p, typeEpargne: v}))}>
                        <SelectTrigger className="input-dark h-8 text-xs"><SelectValue placeholder="Type d'épargne" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dav">DAV - Dépôt à Vue</SelectItem>
                          <SelectItem value="dat">DAT - Dépôt à Terme</SelectItem>
                          <SelectItem value="pel">Plan Épargne Logement</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Montant bloqué (FCFA)" value={garantieForm.montantEpargne} onChange={e => setGarantieForm(p => ({...p, montantEpargne: e.target.value}))} className="input-dark h-8 text-xs" />
                    </div>
                  )}
                </div>
                
                {/* Upload documents */}
                <div className="space-y-2">
                  <p className="text-xs font-medium">Documents requis</p>
                  <div className="border-2 border-dashed border-border rounded-lg p-3 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Glissez vos documents</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
                      <FileCheck className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Acte de caution / Engagement</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
                      <FileCheck className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">CNI de la caution</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
                      <FileCheck className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Justificatif de revenus</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
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
        <Avatar className="w-14 h-14 border-2 border-primary/30 flex-shrink-0">
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
          <div><span className="text-muted-foreground">Revenu:</span> <span className="font-medium text-primary number-format">{formatXAF(salarie.revenuNet)}</span></div>
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
        <Avatar className="w-14 h-14 border-2 border-primary/30 flex-shrink-0">
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
          <div><span className="text-muted-foreground">CA:</span> <span className="font-medium text-primary number-format">{formatXAF(independant.chiffreAffaires)}</span></div>
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
        <img src={company.logo} className="w-14 h-14 object-contain rounded-lg bg-background p-1 flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
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

// Zone Risques Component (same structure for both Internal and BEAC)
function ZoneRisques({ 
  type, 
  nbCredits, 
  montantGlobal, 
  encours, 
  impayes, 
  score,
  credits,
  creditsBEAC 
}: { 
  type: 'interne' | 'beac';
  nbCredits: number;
  montantGlobal: number;
  encours: number;
  impayes: number;
  score: string;
  credits?: ReturnType<typeof generateCreditsInterne>;
  creditsBEAC?: ReturnType<typeof generateCreditsBEAC>;
}) {
  const banques = ['BICEC', 'SGBC', 'UBA', 'Afriland', 'Ecobank', 'SCB'];
  
  return (
    <div className="flex gap-3 items-center h-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-2 flex-1">
        <div className="p-1.5 rounded-lg bg-muted/50 text-center">
          <p className="text-base font-bold">{nbCredits}</p>
          <p className="text-[9px] text-muted-foreground">Nb Crédits</p>
        </div>
        <div className="p-1.5 rounded-lg bg-muted/50 text-center">
          <p className="text-xs font-bold number-format">{formatXAF(montantGlobal).replace(' FCFA', '')}</p>
          <p className="text-[9px] text-muted-foreground">Montant Global</p>
        </div>
        <div className="p-1.5 rounded-lg bg-muted/50 text-center">
          <p className="text-xs font-bold text-primary number-format">{formatXAF(encours).replace(' FCFA', '')}</p>
          <p className="text-[9px] text-muted-foreground">Encours</p>
        </div>
        <div className="p-1.5 rounded-lg bg-muted/50 text-center">
          <p className={cn("text-xs font-bold number-format", impayes > 0 ? 'text-destructive' : 'text-success')}>
            {formatXAF(impayes).replace(' FCFA', '')}
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
      </div>

      {/* Details Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Eye className="w-3 h-3 mr-1" />
            Détails
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{type === 'interne' ? 'Historique Crédits Internes' : 'Centrale des Risques BEAC'}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-96 overflow-auto">
            {type === 'beac' && (
              <div className="mb-4 flex gap-2 flex-wrap">
                {banques.map(b => (
                  <Badge key={b} variant="outline">{b}</Badge>
                ))}
              </div>
            )}
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  {type === 'beac' && <th className="p-2 text-left">Banque</th>}
                  <th className="p-2 text-left">{type === 'interne' ? 'Date' : 'Type'}</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-right">Montant Initial</th>
                  <th className="p-2 text-right">{type === 'interne' ? 'Encours' : 'Solde Restant'}</th>
                  <th className="p-2 text-right">Impayés</th>
                  <th className="p-2 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {type === 'interne' && credits?.map(c => (
                  <tr key={c.id}>
                    <td className="p-2">{formatDate(c.dateOctroi)}</td>
                    <td className="p-2">{c.type}</td>
                    <td className="p-2 text-right number-format">{formatXAF(c.montantInitial)}</td>
                    <td className="p-2 text-right number-format">{formatXAF(c.encours)}</td>
                    <td className="p-2 text-right number-format">{formatXAF(c.impayes)}</td>
                    <td className="p-2 text-center">
                      <Badge className={cn(
                        c.statut === 'sain' ? 'bg-success/20 text-success' :
                        c.statut === 'sensible' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'
                      )}>{c.statut}</Badge>
                    </td>
                  </tr>
                ))}
                {type === 'beac' && creditsBEAC?.map(c => (
                  <tr key={c.id}>
                    <td className="p-2">{c.banque}</td>
                    <td className="p-2">{c.typeEngagement}</td>
                    <td className="p-2 text-right number-format">{formatXAF(c.montantInitial)}</td>
                    <td className="p-2 text-right number-format">{formatXAF(c.soldeRestant)}</td>
                    <td className="p-2 text-right number-format">{formatXAF(c.impayes)}</td>
                    <td className="p-2 text-center">
                      <Badge className={cn(
                        c.statut === 'sain' ? 'bg-success/20 text-success' :
                        c.statut === 'douteux' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'
                      )}>{c.statut}</Badge>
                    </td>
                  </tr>
                ))}
                {((type === 'interne' && (!credits || credits.length === 0)) || 
                  (type === 'beac' && (!creditsBEAC || creditsBEAC.length === 0))) && (
                  <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">Aucun engagement</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
