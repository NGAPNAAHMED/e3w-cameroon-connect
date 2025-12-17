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
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
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
} from 'lucide-react';
import { clients, companies, typesCredit, typesGarantie, generateCreditsInterne, generateCreditsBEAC, ClientSalarie, ClientIndependant, ClientEntreprise } from '@/data/mockData';
import { formatXAF, formatDuree, formatPourcentage, calculerMensualite, calculerCoutTotal, getInitials, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export default function CockpitTraitement() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  
  const client = clients.find(c => c.id === clientId);
  const [showGaranties, setShowGaranties] = useState(false);
  
  // Credit form state
  const [creditForm, setCreditForm] = useState({
    typeCredit: '',
    montant: '',
    duree: '24',
    differe: '0',
  });

  // Garantie form state
  const [garantieForm, setGarantieForm] = useState({
    type: '',
    // Personnelle
    nomCaution: '',
    cniCaution: '',
    revenuCaution: '',
    // Immobilier
    localisation: '',
    titreFoncier: '',
    valeurBien: '',
    // Véhicule
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
  const mensualite = selectedCredit ? calculerMensualite(
    montant,
    selectedCredit.taux,
    parseInt(creditForm.duree),
    parseInt(creditForm.differe)
  ) : 0;
  const coutTotal = calculerCoutTotal(mensualite, parseInt(creditForm.duree), parseInt(creditForm.differe));

  // Calculate internal risks
  const totalEncours = creditsInterne.reduce((sum, c) => sum + c.encours, 0);
  const totalMontant = creditsInterne.reduce((sum, c) => sum + c.montantInitial, 0);

  // Calculate BEAC risks
  const totalBEAC = creditsBEAC.reduce((sum, c) => sum + c.soldeRestant, 0);
  const totalImpayes = creditsBEAC.reduce((sum, c) => sum + c.impayes, 0);
  const scoreBEAC = creditsBEAC.length > 0 ? (totalImpayes === 0 ? 'A' : totalImpayes < 1000000 ? 'B' : 'C') : 'N/A';

  const handleMontantChange = (value: string) => {
    // Format with spaces
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
    toast({
      title: "Dossier enregistré",
      description: "Le dossier a été ajouté au panier",
    });
  };

  const handleTransmettre = () => {
    toast({
      title: "Dossier transmis",
      description: "Le dossier a été transmis au comité",
    });
    navigate('/dashboard/panier');
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold font-display">Cockpit de Traitement</h1>
        <Badge variant="outline" className="ml-auto">
          {client.type === 'salarie' ? 'Salarié' : client.type === 'independant' ? 'Indépendant' : 'Entreprise'}
        </Badge>
      </div>

      {/* Main Grid - No Scroll Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Zone A - Client Info (Top Left) */}
        <div className="col-span-12 lg:col-span-5 row-span-1">
          <ZoneClientInfo client={client} />
        </div>

        {/* Zone C - Risks (Top Right) */}
        <div className="col-span-12 lg:col-span-7 row-span-1">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Internal Risks */}
            <ZoneRisquesInternes 
              credits={creditsInterne}
              totalEncours={totalEncours}
              totalMontant={totalMontant}
            />
            {/* BEAC Risks */}
            <ZoneRisquesBEAC 
              credits={creditsBEAC}
              totalBEAC={totalBEAC}
              totalImpayes={totalImpayes}
              score={scoreBEAC}
            />
          </div>
        </div>

        {/* Zone B - Credit Form (Bottom Left) + Zone E - Garanties (Slide in) */}
        <div className={cn(
          "col-span-12 row-span-1 transition-all duration-300",
          showGaranties ? "lg:col-span-5" : "lg:col-span-5"
        )}>
          <ZoneCredit 
            form={creditForm}
            setForm={setCreditForm}
            handleMontantChange={handleMontantChange}
            selectedCredit={selectedCredit}
            mensualite={mensualite}
            coutTotal={coutTotal}
          />
        </div>

        {/* Zone E - Garanties (appears after SUIVANT) */}
        {showGaranties && (
          <div className="col-span-12 lg:col-span-7 row-span-1 animate-slide-in-right">
            <ZoneGaranties 
              form={garantieForm}
              setForm={setGarantieForm}
            />
          </div>
        )}

        {/* Zone D - Actions (Bottom) */}
        <div className={cn(
          "col-span-12 flex items-center gap-3",
          !showGaranties && "lg:col-span-7"
        )}>
          {!showGaranties ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Progression: 1/2</span>
              </div>
              <div className="flex-1" />
              <Button variant="outline" onClick={handleEnregistrer}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
              <Button variant="gold" onClick={handleSuivant}>
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setShowGaranties(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="flex-1" />
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
              <Button variant="outline" onClick={handleEnregistrer}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Ajouter au Panier
              </Button>
              <Button variant="gold" onClick={handleTransmettre}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Transmettre au Comité
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Zone A - Client Info Component
function ZoneClientInfo({ client }: { client: typeof clients[0] }) {
  if (client.type === 'salarie') {
    const salarie = client as ClientSalarie;
    const employeur = companies.find(c => c.id === salarie.employeurId);
    
    return (
      <Card className="zone-panel">
        <div className="zone-title">
          <Users className="w-4 h-4" />
          Informations Client - Salarié
        </div>
        <div className="flex gap-4">
          <Avatar className="w-20 h-20 border-2 border-primary/30">
            <AvatarImage src={salarie.avatar} />
            <AvatarFallback className="bg-primary/20 text-primary text-xl">
              {getInitials(salarie.nom, salarie.prenom)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 grid grid-cols-3 gap-x-4 gap-y-2">
            <div>
              <p className="data-label">Nom</p>
              <p className="data-value">{salarie.nom}</p>
            </div>
            <div>
              <p className="data-label">Prénom</p>
              <p className="data-value">{salarie.prenom}</p>
            </div>
            <div>
              <p className="data-label">Âge</p>
              <p className="data-value">{salarie.age} ans</p>
            </div>
            <div>
              <p className="data-label">Employeur</p>
              <div className="flex items-center gap-1">
                {employeur?.logo && <img src={employeur.logo} alt="" className="w-4 h-4 object-contain" />}
                <p className="data-value">{employeur?.sigle}</p>
              </div>
            </div>
            <div>
              <p className="data-label">Fonction</p>
              <p className="data-value">{salarie.fonction}</p>
            </div>
            <div>
              <p className="data-label">Sexe</p>
              <p className="data-value">{salarie.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
            </div>
            <div>
              <p className="data-label">Revenu Net</p>
              <p className="data-value text-primary font-semibold number-format">{formatXAF(salarie.revenuNet)}</p>
            </div>
            <div>
              <p className="data-label">Ancienneté Banque</p>
              <p className="data-value">{formatDuree(salarie.ancienneteBanque)}</p>
            </div>
            <div>
              <p className="data-label">Pers. à charge</p>
              <p className="data-value">{salarie.personnesCharge}</p>
            </div>
            <div>
              <p className="data-label">Anc. Employeur</p>
              <p className="data-value">{formatDuree(salarie.ancienneteEmploi)}</p>
            </div>
            <div className="col-span-2">
              <p className="data-label">Téléphone</p>
              <p className="data-value">{salarie.telephone}</p>
            </div>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              <Eye className="w-4 h-4 mr-2" />
              Voir Plus (Fiche KYC)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Fiche KYC Complète</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">IDENTITÉ</h4>
                <div><span className="text-muted-foreground text-sm">CNI:</span> <span className="font-medium">{salarie.cni || 'N/A'}</span></div>
                <div><span className="text-muted-foreground text-sm">Nationalité:</span> <span className="font-medium">{salarie.nationalite}</span></div>
                <div><span className="text-muted-foreground text-sm">Lieu de naissance:</span> <span className="font-medium">{salarie.lieuNaissance || 'N/A'}</span></div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">ÉTAT CIVIL</h4>
                <div><span className="text-muted-foreground text-sm">Situation:</span> <span className="font-medium">{salarie.situationMatrimoniale}</span></div>
                <div><span className="text-muted-foreground text-sm">Personnes à charge:</span> <span className="font-medium">{salarie.personnesCharge}</span></div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">EMPLOI</h4>
                <div><span className="text-muted-foreground text-sm">Employeur:</span> <span className="font-medium">{employeur?.name}</span></div>
                <div><span className="text-muted-foreground text-sm">Fonction:</span> <span className="font-medium">{salarie.fonction}</span></div>
                <div><span className="text-muted-foreground text-sm">Ancienneté:</span> <span className="font-medium">{formatDuree(salarie.ancienneteEmploi)}</span></div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">ADRESSE</h4>
                <div><span className="text-muted-foreground text-sm">Domicile:</span> <span className="font-medium">{salarie.adresse}</span></div>
                <div><span className="text-muted-foreground text-sm">Email:</span> <span className="font-medium">{salarie.email}</span></div>
                <div><span className="text-muted-foreground text-sm">Téléphone:</span> <span className="font-medium">{salarie.telephone}</span></div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  if (client.type === 'independant') {
    const independant = client as ClientIndependant;
    return (
      <Card className="zone-panel">
        <div className="zone-title">
          <Briefcase className="w-4 h-4" />
          Informations Client - Indépendant
        </div>
        <div className="flex gap-4">
          <Avatar className="w-20 h-20 border-2 border-primary/30">
            <AvatarImage src={independant.avatar} />
            <AvatarFallback className="bg-primary/20 text-primary text-xl">
              {getInitials(independant.nom, independant.prenom)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 grid grid-cols-3 gap-x-4 gap-y-2">
            <div>
              <p className="data-label">Nom</p>
              <p className="data-value">{independant.nom}</p>
            </div>
            <div>
              <p className="data-label">Prénom</p>
              <p className="data-value">{independant.prenom}</p>
            </div>
            <div>
              <p className="data-label">Âge</p>
              <p className="data-value">{independant.age} ans</p>
            </div>
            <div>
              <p className="data-label">Activité</p>
              <p className="data-value">{independant.activite}</p>
            </div>
            <div>
              <p className="data-label">Secteur</p>
              <p className="data-value">{independant.secteur}</p>
            </div>
            <div>
              <p className="data-label">Anc. Banque</p>
              <p className="data-value">{formatDuree(independant.ancienneteBanque)}</p>
            </div>
            <div>
              <p className="data-label">Chiffre d'Affaires</p>
              <p className="data-value text-primary font-semibold number-format">{formatXAF(independant.chiffreAffaires)}</p>
            </div>
            <div>
              <p className="data-label">Marge Nette</p>
              <p className="data-value">{formatPourcentage(independant.margeNette)}</p>
            </div>
            <div>
              <p className="data-label">Téléphone</p>
              <p className="data-value">{independant.telephone}</p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full">
          <Eye className="w-4 h-4 mr-2" />
          Voir Plus (Fiche KYC)
        </Button>
      </Card>
    );
  }

  // Entreprise
  const entreprise = client as ClientEntreprise;
  const company = companies.find(c => c.id === entreprise.companyId);
  
  return (
    <Card className="zone-panel">
      <div className="zone-title">
        <Building2 className="w-4 h-4" />
        Informations Client - Entreprise
      </div>
      <div className="flex gap-4">
        {company?.logo ? (
          <img src={company.logo} alt={company.sigle} className="w-20 h-20 object-contain rounded-lg bg-background p-2" />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 grid grid-cols-3 gap-x-4 gap-y-2">
          <div className="col-span-2">
            <p className="data-label">Dénomination</p>
            <p className="data-value">{company?.name}</p>
          </div>
          <div>
            <p className="data-label">Sigle</p>
            <p className="data-value">{company?.sigle}</p>
          </div>
          <div>
            <p className="data-label">RCCM</p>
            <p className="data-value text-xs">{company?.rccm}</p>
          </div>
          <div>
            <p className="data-label">Secteur</p>
            <p className="data-value">{company?.secteur}</p>
          </div>
          <div>
            <p className="data-label">Responsable</p>
            <p className="data-value">{company?.responsable}</p>
          </div>
          <div>
            <p className="data-label">Siège Social</p>
            <p className="data-value">{company?.siege}</p>
          </div>
          <div>
            <p className="data-label">Date Création</p>
            <p className="data-value">{company?.dateCreation ? formatDate(company.dateCreation) : 'N/A'}</p>
          </div>
          <div>
            <p className="data-label">Employés</p>
            <p className="data-value">{company?.nbEmployes}</p>
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" className="mt-3 w-full">
        <Eye className="w-4 h-4 mr-2" />
        Voir Plus (Fiche KYC)
      </Button>
    </Card>
  );
}

// Zone B - Credit Form Component
function ZoneCredit({ 
  form, 
  setForm, 
  handleMontantChange, 
  selectedCredit, 
  mensualite, 
  coutTotal 
}: {
  form: any;
  setForm: any;
  handleMontantChange: (v: string) => void;
  selectedCredit: typeof typesCredit[0] | undefined;
  mensualite: number;
  coutTotal: number;
}) {
  return (
    <Card className="zone-panel">
      <div className="zone-title">
        <CreditCard className="w-4 h-4" />
        Paramètres du Crédit
      </div>
      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="space-y-2">
          <Label className="text-xs">Type de Crédit</Label>
          <Select value={form.typeCredit} onValueChange={(v) => setForm((p: any) => ({ ...p, typeCredit: v }))}>
            <SelectTrigger className="input-dark">
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              {typesCredit.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Montant Demandé (XAF)</Label>
          <Input
            value={form.montant}
            onChange={(e) => handleMontantChange(e.target.value)}
            placeholder="0"
            className="input-dark number-format"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Durée (mois)</Label>
          <Select value={form.duree} onValueChange={(v) => setForm((p: any) => ({ ...p, duree: v }))}>
            <SelectTrigger className="input-dark">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[6, 12, 18, 24, 36, 48, 60, 72, 84].map(d => (
                <SelectItem key={d} value={d.toString()}>{d} mois</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Différé (mois)</Label>
          <Select value={form.differe} onValueChange={(v) => setForm((p: any) => ({ ...p, differe: v }))}>
            <SelectTrigger className="input-dark">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 6].map(d => (
                <SelectItem key={d} value={d.toString()}>{d} mois</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Taux (%)</Label>
          <Input
            value={selectedCredit ? formatPourcentage(selectedCredit.taux) : '-'}
            readOnly
            className="input-dark bg-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Mensualité</Label>
          <Input
            value={mensualite ? formatXAF(mensualite) : '-'}
            readOnly
            className="input-dark bg-muted/50 text-primary font-semibold"
          />
        </div>
        <div className="col-span-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Coût Total du Crédit</span>
            <span className="text-lg font-bold text-primary number-format">{coutTotal ? formatXAF(coutTotal) : '-'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Zone C - Internal Risks Component
function ZoneRisquesInternes({ credits, totalEncours, totalMontant }: {
  credits: ReturnType<typeof generateCreditsInterne>;
  totalEncours: number;
  totalMontant: number;
}) {
  return (
    <Card className="zone-panel">
      <div className="zone-title">
        <TrendingUp className="w-4 h-4" />
        Engagements Internes
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <p className="text-xl font-bold text-foreground">{credits.length}</p>
          <p className="text-[10px] text-muted-foreground">Nbre Crédits</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <p className="text-sm font-bold text-foreground number-format">{formatXAF(totalMontant).replace(' XAF', '')}</p>
          <p className="text-[10px] text-muted-foreground">Montant Global</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <p className="text-sm font-bold text-primary number-format">{formatXAF(totalEncours).replace(' XAF', '')}</p>
          <p className="text-[10px] text-muted-foreground">Encours</p>
        </div>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            Voir Détails
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historique Crédits Internes</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-right">Montant</th>
                  <th className="p-2 text-right">Mensualité</th>
                  <th className="p-2 text-right">Encours</th>
                  <th className="p-2 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {credits.map(c => (
                  <tr key={c.id}>
                    <td className="p-2">{formatDate(c.dateOctroi)}</td>
                    <td className="p-2">{c.type}</td>
                    <td className="p-2 text-right number-format">{formatXAF(c.montantInitial)}</td>
                    <td className="p-2 text-right number-format">{formatXAF(c.mensualite)}</td>
                    <td className="p-2 text-right number-format">{formatXAF(c.encours)}</td>
                    <td className="p-2 text-center">
                      <Badge className={cn(
                        c.statut === 'sain' ? 'bg-success/20 text-success' :
                        c.statut === 'sensible' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'
                      )}>
                        {c.statut}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {credits.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      Aucun crédit en cours
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Zone C - BEAC Risks Component
function ZoneRisquesBEAC({ credits, totalBEAC, totalImpayes, score }: {
  credits: ReturnType<typeof generateCreditsBEAC>;
  totalBEAC: number;
  totalImpayes: number;
  score: string;
}) {
  return (
    <Card className="zone-panel">
      <div className="zone-title">
        <AlertTriangle className="w-4 h-4" />
        Centrale des Risques BEAC
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <p className={cn(
            "text-xl font-bold",
            score === 'A' ? 'text-success' : score === 'B' ? 'text-warning' : 'text-destructive'
          )}>{score}</p>
          <p className="text-[10px] text-muted-foreground">Score</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <p className="text-sm font-bold text-foreground number-format">{formatXAF(totalBEAC).replace(' XAF', '')}</p>
          <p className="text-[10px] text-muted-foreground">Encours Système</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <p className={cn(
            "text-sm font-bold number-format",
            totalImpayes > 0 ? 'text-destructive' : 'text-success'
          )}>{formatXAF(totalImpayes).replace(' XAF', '')}</p>
          <p className="text-[10px] text-muted-foreground">Impayés</p>
        </div>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            Voir Centrale
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Centrale des Risques BEAC</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-2 text-left">Banque</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-right">Montant Initial</th>
                  <th className="p-2 text-right">Solde Restant</th>
                  <th className="p-2 text-right">Impayés</th>
                  <th className="p-2 text-center">Jours Retard</th>
                  <th className="p-2 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {credits.map(c => (
                  <tr key={c.id}>
                    <td className="p-2">{c.banque}</td>
                    <td className="p-2">{c.typeEngagement}</td>
                    <td className="p-2 text-right number-format">{formatXAF(c.montantInitial)}</td>
                    <td className="p-2 text-right number-format">{formatXAF(c.soldeRestant)}</td>
                    <td className="p-2 text-right number-format">{formatXAF(c.impayes)}</td>
                    <td className="p-2 text-center">{c.joursRetard || '-'}</td>
                    <td className="p-2 text-center">
                      <Badge className={cn(
                        c.statut === 'sain' ? 'bg-success/20 text-success' :
                        c.statut === 'douteux' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'
                      )}>
                        {c.statut}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {credits.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      Aucun engagement déclaré
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Zone E - Garanties Component
function ZoneGaranties({ form, setForm }: { form: any; setForm: any }) {
  return (
    <Card className="zone-panel">
      <div className="zone-title">
        <Shield className="w-4 h-4" />
        Garanties
      </div>
      <div className="space-y-4 flex-1">
        <div className="space-y-2">
          <Label className="text-xs">Type de Garantie</Label>
          <Select value={form.type} onValueChange={(v) => setForm((p: any) => ({ ...p, type: v }))}>
            <SelectTrigger className="input-dark">
              <SelectValue placeholder="Sélectionner le type..." />
            </SelectTrigger>
            <SelectContent>
              {typesGarantie.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {form.type === 'personnelle' && (
          <div className="grid grid-cols-3 gap-3 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-xs">Nom de la Caution</Label>
              <Input
                value={form.nomCaution}
                onChange={(e) => setForm((p: any) => ({ ...p, nomCaution: e.target.value }))}
                className="input-dark"
                placeholder="Nom complet"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">N° CNI</Label>
              <Input
                value={form.cniCaution}
                onChange={(e) => setForm((p: any) => ({ ...p, cniCaution: e.target.value }))}
                className="input-dark"
                placeholder="N° CNI"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Revenu Caution (XAF)</Label>
              <Input
                value={form.revenuCaution}
                onChange={(e) => setForm((p: any) => ({ ...p, revenuCaution: e.target.value }))}
                className="input-dark"
                placeholder="0"
              />
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Acte de Caution</Label>
              <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Cliquez pour uploader</p>
              </div>
            </div>
          </div>
        )}

        {form.type === 'immo' && (
          <div className="grid grid-cols-3 gap-3 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-xs">Localisation du Bien</Label>
              <Input
                value={form.localisation}
                onChange={(e) => setForm((p: any) => ({ ...p, localisation: e.target.value }))}
                className="input-dark"
                placeholder="Adresse"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">N° Titre Foncier</Label>
              <Input
                value={form.titreFoncier}
                onChange={(e) => setForm((p: any) => ({ ...p, titreFoncier: e.target.value }))}
                className="input-dark"
                placeholder="TF-XXX"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Valeur du Bien (XAF)</Label>
              <Input
                value={form.valeurBien}
                onChange={(e) => setForm((p: any) => ({ ...p, valeurBien: e.target.value }))}
                className="input-dark"
                placeholder="0"
              />
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Titre Foncier (Document)</Label>
              <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Cliquez pour uploader</p>
              </div>
            </div>
          </div>
        )}

        {form.type === 'vehicule' && (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-xs">Marque & Modèle</Label>
              <Input
                value={form.marque}
                onChange={(e) => setForm((p: any) => ({ ...p, marque: e.target.value }))}
                className="input-dark"
                placeholder="Toyota Corolla"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">N° Châssis</Label>
              <Input
                value={form.chassis}
                onChange={(e) => setForm((p: any) => ({ ...p, chassis: e.target.value }))}
                className="input-dark"
                placeholder="VIN"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Carte Grise</Label>
              <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Cliquez pour uploader</p>
              </div>
            </div>
          </div>
        )}

        {!form.type && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">Sélectionnez un type de garantie</p>
          </div>
        )}
      </div>
    </Card>
  );
}
