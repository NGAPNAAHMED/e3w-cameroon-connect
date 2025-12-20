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
} from 'lucide-react';
import { clients, companies, typesCredit, typesGarantie, generateCreditsInterne, generateCreditsBEAC, ClientSalarie, ClientIndependant, ClientEntreprise, Client } from '@/data/mockData';
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
    // Professionnel
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

export default function CockpitTraitement() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  
  const client = clients.find(c => c.id === clientId);
  const [showGaranties, setShowGaranties] = useState(false);
  const [showKycDialog, setShowKycDialog] = useState(false);
  const [kycCompleted, setKycCompleted] = useState(client?.kycComplete || false);
  
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
    localisation: '',
    titreFoncier: '',
    valeurBien: '',
    marque: '',
    chassis: '',
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
    setGarantieForm({ type: '', nomCaution: '', cniCaution: '', revenuCaution: '', localisation: '', titreFoncier: '', valeurBien: '', marque: '', chassis: '' });
    setShowGaranties(false);
  };

  const handleTelechargerPDF = () => {
    toast({
      title: "PDF généré",
      description: "Le téléchargement va commencer",
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
    <div className="h-[calc(100vh-7rem)] flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 mb-3 flex-shrink-0">
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
        <div className="mb-3 p-3 bg-warning/10 border border-warning/30 rounded-lg flex items-center gap-3 flex-shrink-0">
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
      <div className="flex-1 grid grid-rows-2 gap-3 min-h-0">
        {/* Row 1: Zone A (1/3) + Zones B & C (2/3) */}
        <div className="grid grid-cols-3 gap-3 min-h-0">
          {/* Zone A - Client Synthèse (1/3 width) */}
          <Card className="zone-panel overflow-hidden">
            <div className="zone-title">
              {client.type === 'salarie' ? <Users className="w-4 h-4" /> : 
               client.type === 'independant' ? <Briefcase className="w-4 h-4" /> : 
               <Building2 className="w-4 h-4" />}
              Synthèse Client
            </div>
            <ZoneClientSynthese client={client} />
          </Card>

          {/* Zones B & C (2/3 width) */}
          <div className="col-span-2 grid grid-rows-2 gap-3 min-h-0">
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
        <div className="min-h-0">
          {!showGaranties ? (
            /* Zone D - Crédit */
            <Card className="zone-panel h-full">
              <div className="zone-title">
                <CreditCard className="w-4 h-4" />
                Informations sur le Crédit
              </div>
              <div className="flex-1 grid grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Type de Crédit</Label>
                  <Select value={creditForm.typeCredit} onValueChange={(v) => setCreditForm(p => ({...p, typeCredit: v}))}>
                    <SelectTrigger className="input-dark h-9"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {typesCredit.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Montant (FCFA)</Label>
                  <Input value={creditForm.montant} onChange={(e) => handleMontantChange(e.target.value)} placeholder="0" className="input-dark h-9 number-format" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Périodicité</Label>
                  <Select value={creditForm.periodicite} onValueChange={(v) => setCreditForm(p => ({...p, periodicite: v}))}>
                    <SelectTrigger className="input-dark h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mois">Mois</SelectItem>
                      <SelectItem value="semaines">Semaines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Durée ({creditForm.periodicite})</Label>
                  <Input type="number" value={creditForm.duree} onChange={(e) => setCreditForm(p => ({...p, duree: e.target.value}))} className="input-dark h-9" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Différé ({creditForm.differePeriodicite})</Label>
                  <div className="flex gap-1">
                    <Select value={creditForm.differePeriodicite} onValueChange={(v) => setCreditForm(p => ({...p, differePeriodicite: v}))}>
                      <SelectTrigger className="input-dark h-9 w-20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mois">Mois</SelectItem>
                        <SelectItem value="semaines">Sem</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" value={creditForm.differe} onChange={(e) => setCreditForm(p => ({...p, differe: e.target.value}))} className="input-dark h-9 flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Taux (%)</Label>
                  <Input value={selectedCredit ? formatPourcentage(selectedCredit.taux) : '-'} readOnly className="input-dark h-9 bg-muted/50" />
                </div>
              </div>
              
              {/* Résultat */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Mensualité</p>
                  <p className="font-bold text-primary number-format">{mensualite ? formatXAF(mensualite) : '-'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Coût Total</p>
                  <p className="font-bold number-format">{coutTotal ? formatXAF(coutTotal) : '-'}</p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={handleEnregistrer}>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </Button>
                  <Button variant="gold" onClick={handleSuivant}>
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            /* Zone E - Garanties (Animation slide) */
            <Card className="zone-panel h-full animate-fade-in">
              <div className="zone-title">
                <Shield className="w-4 h-4" />
                Garanties
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                {/* Type de garantie */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Type de Garantie</Label>
                    <Select value={garantieForm.type} onValueChange={(v) => setGarantieForm(p => ({...p, type: v}))}>
                      <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {typesGarantie.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {garantieForm.type === 'personnelle' && (
                    <div className="space-y-3 animate-fade-in">
                      <Input placeholder="Nom de la caution" value={garantieForm.nomCaution} onChange={e => setGarantieForm(p => ({...p, nomCaution: e.target.value}))} className="input-dark h-9" />
                      <Input placeholder="N° CNI Caution" value={garantieForm.cniCaution} onChange={e => setGarantieForm(p => ({...p, cniCaution: e.target.value}))} className="input-dark h-9" />
                      <Input placeholder="Revenu Caution (FCFA)" value={garantieForm.revenuCaution} onChange={e => setGarantieForm(p => ({...p, revenuCaution: e.target.value}))} className="input-dark h-9" />
                    </div>
                  )}
                  
                  {garantieForm.type === 'immo' && (
                    <div className="space-y-3 animate-fade-in">
                      <Input placeholder="Localisation du bien" value={garantieForm.localisation} onChange={e => setGarantieForm(p => ({...p, localisation: e.target.value}))} className="input-dark h-9" />
                      <Input placeholder="N° Titre Foncier" value={garantieForm.titreFoncier} onChange={e => setGarantieForm(p => ({...p, titreFoncier: e.target.value}))} className="input-dark h-9" />
                      <Input placeholder="Valeur du bien (FCFA)" value={garantieForm.valeurBien} onChange={e => setGarantieForm(p => ({...p, valeurBien: e.target.value}))} className="input-dark h-9" />
                    </div>
                  )}
                  
                  {garantieForm.type === 'vehicule' && (
                    <div className="space-y-3 animate-fade-in">
                      <Input placeholder="Marque & Modèle" value={garantieForm.marque} onChange={e => setGarantieForm(p => ({...p, marque: e.target.value}))} className="input-dark h-9" />
                      <Input placeholder="N° Châssis" value={garantieForm.chassis} onChange={e => setGarantieForm(p => ({...p, chassis: e.target.value}))} className="input-dark h-9" />
                    </div>
                  )}
                </div>
                
                {/* Upload documents */}
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">Documents requis</p>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Glissez vos documents ici</p>
                    <p className="text-xs text-muted-foreground mt-1">Acte de caution, Titre foncier, Carte grise...</p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="ghost" onClick={() => setShowGaranties(false)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <div className="flex-1" />
                <Button variant="outline" onClick={handleTelechargerPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </Button>
                <Button variant="gold" onClick={handleEnregistrer}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Enregistrer au Panier
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
      <div className="flex gap-3 flex-1 min-h-0">
        <Avatar className="w-16 h-16 border-2 border-primary/30 flex-shrink-0">
          <AvatarImage src={salarie.avatar} />
          <AvatarFallback className="bg-primary/20 text-primary">{getInitials(salarie.nom, salarie.prenom)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs overflow-hidden">
          <div><span className="text-muted-foreground">Nom:</span> <span className="font-medium">{salarie.nom}</span></div>
          <div><span className="text-muted-foreground">Prénom:</span> <span className="font-medium">{salarie.prenom}</span></div>
          <div><span className="text-muted-foreground">Âge:</span> <span className="font-medium">{salarie.age} ans</span></div>
          <div><span className="text-muted-foreground">Sexe:</span> <span className="font-medium">{salarie.sexe === 'M' ? 'M' : 'F'}</span></div>
          <div className="flex items-center gap-1"><span className="text-muted-foreground">Employeur:</span> {employeur?.logo && <img src={employeur.logo} className="w-3 h-3" />}<span className="font-medium">{employeur?.sigle}</span></div>
          <div><span className="text-muted-foreground">Fonction:</span> <span className="font-medium">{salarie.fonction}</span></div>
          <div><span className="text-muted-foreground">Revenu:</span> <span className="font-medium text-primary">{formatXAF(salarie.revenuNet)}</span></div>
          <div><span className="text-muted-foreground">Anc. Banque:</span> <span className="font-medium">{formatDuree(salarie.ancienneteBanque)}</span></div>
          <div><span className="text-muted-foreground">Anc. Emploi:</span> <span className="font-medium">{formatDuree(salarie.ancienneteEmploi)}</span></div>
          <div><span className="text-muted-foreground">Pers. charge:</span> <span className="font-medium">{salarie.personnesCharge}</span></div>
          <div className="col-span-2"><span className="text-muted-foreground">Tél:</span> <span className="font-medium">{salarie.telephone}</span></div>
        </div>
      </div>
    );
  }

  if (client.type === 'independant') {
    const independant = client as ClientIndependant;
    return (
      <div className="flex gap-3 flex-1 min-h-0">
        <Avatar className="w-16 h-16 border-2 border-primary/30 flex-shrink-0">
          <AvatarImage src={independant.avatar} />
          <AvatarFallback className="bg-primary/20 text-primary">{getInitials(independant.nom, independant.prenom)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs overflow-hidden">
          <div><span className="text-muted-foreground">Nom:</span> <span className="font-medium">{independant.nom}</span></div>
          <div><span className="text-muted-foreground">Prénom:</span> <span className="font-medium">{independant.prenom}</span></div>
          <div><span className="text-muted-foreground">Âge:</span> <span className="font-medium">{independant.age} ans</span></div>
          <div><span className="text-muted-foreground">Secteur:</span> <span className="font-medium">{independant.secteur}</span></div>
          <div><span className="text-muted-foreground">Activité:</span> <span className="font-medium">{independant.activite}</span></div>
          <div><span className="text-muted-foreground">Anc. Banque:</span> <span className="font-medium">{formatDuree(independant.ancienneteBanque)}</span></div>
          <div><span className="text-muted-foreground">CA:</span> <span className="font-medium text-primary">{formatXAF(independant.chiffreAffaires)}</span></div>
          <div><span className="text-muted-foreground">Marge:</span> <span className="font-medium">{formatPourcentage(independant.margeNette)}</span></div>
          <div className="col-span-2"><span className="text-muted-foreground">Tél:</span> <span className="font-medium">{independant.telephone}</span></div>
        </div>
      </div>
    );
  }

  // Entreprise
  const entreprise = client as ClientEntreprise;
  const company = companies.find(c => c.id === entreprise.companyId);
  return (
    <div className="flex gap-3 flex-1 min-h-0">
      {company?.logo ? (
        <img src={company.logo} className="w-16 h-16 object-contain rounded-lg bg-background p-1 flex-shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs overflow-hidden">
        <div className="col-span-2"><span className="text-muted-foreground">Dénomination:</span> <span className="font-medium">{company?.name}</span></div>
        <div><span className="text-muted-foreground">Sigle:</span> <span className="font-medium">{company?.sigle}</span></div>
        <div><span className="text-muted-foreground">RCCM:</span> <span className="font-medium text-xs">{company?.rccm}</span></div>
        <div><span className="text-muted-foreground">Secteur:</span> <span className="font-medium">{company?.secteur}</span></div>
        <div><span className="text-muted-foreground">Responsable:</span> <span className="font-medium">{company?.responsable}</span></div>
        <div><span className="text-muted-foreground">Siège:</span> <span className="font-medium">{company?.siege}</span></div>
        <div><span className="text-muted-foreground">Employés:</span> <span className="font-medium">{company?.nbEmployes}</span></div>
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
    <div className="flex gap-4 flex-1 items-center">
      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-2 flex-1">
        <div className="p-2 rounded-lg bg-muted/50 text-center">
          <p className="text-lg font-bold">{nbCredits}</p>
          <p className="text-[10px] text-muted-foreground">Nb Crédits</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50 text-center">
          <p className="text-sm font-bold number-format">{formatXAF(montantGlobal).replace(' FCFA', '')}</p>
          <p className="text-[10px] text-muted-foreground">Montant Global</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50 text-center">
          <p className="text-sm font-bold text-primary number-format">{formatXAF(encours).replace(' FCFA', '')}</p>
          <p className="text-[10px] text-muted-foreground">Encours</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50 text-center">
          <p className={cn("text-sm font-bold number-format", impayes > 0 ? 'text-destructive' : 'text-success')}>
            {formatXAF(impayes).replace(' FCFA', '')}
          </p>
          <p className="text-[10px] text-muted-foreground">Impayés</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50 text-center">
          <p className={cn(
            "text-xl font-bold",
            score === 'A' ? 'text-success' : score === 'B' ? 'text-warning' : 'text-destructive'
          )}>{score}</p>
          <p className="text-[10px] text-muted-foreground">Score</p>
        </div>
      </div>

      {/* Details Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
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
