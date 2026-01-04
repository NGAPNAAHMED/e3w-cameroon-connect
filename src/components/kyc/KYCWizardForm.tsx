import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
  User, Heart, Briefcase, CheckCircle2, ChevronRight, ChevronLeft,
  Upload, Camera, Building2, FileText, Shield, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ClientType = 'salarie' | 'independant' | 'entreprise';

export interface KYCFormData {
  // A. Identification
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: string;
  nationalite: string;
  typePiece: string;
  numeroPiece: string;
  dateDelivrance: string;
  dateExpiration: string;
  photo: string | null;
  
  // B. Coordonnées & Vie Sociale
  ville: string;
  quartier: string;
  rue: string;
  telephonePrincipal: string;
  telephoneSecondaire: string;
  email: string;
  statutMatrimonial: string;
  nombreEnfants: number;
  typeLogement: string;
  
  // C. Professionnel - Salarié
  employeur: string;
  fonction: string;
  typeContrat: string;
  dateEmbauche: string;
  salaireMensuelNet: number;
  autresRevenus: number;
  isPPE: boolean;
  
  // C. Professionnel - Indépendant
  natureActivite: string;
  nomCommercial: string;
  lieuExercice: string;
  dateDebutActivite: string;
  revenuMensuelMoyen: number;
  margeBeneficiaire: number;
  chargesMensuelles: number;
  saisonnalite: string;
  numeroPatente: string;
  
  // A. Entreprise
  raisonSociale: string;
  sigle: string;
  formeJuridique: string;
  numeroRCCM: string;
  numeroContribuable: string;
  dateCreation: string;
  secteurActivite: string;
  adresseSiege: string;
  telephoneEntreprise: string;
  emailEntreprise: string;
  nombreEmployes: number;
  masseSalariale: number;
  
  // Gouvernance
  representantLegal: string;
  representantCNI: string;
  beneficiairesEffectifs: string;
  chiffreAffairesAnnuel: number;
  principauxClients: string;
  isPPEEntreprise: boolean;
}

const initialFormData: KYCFormData = {
  nom: '',
  prenom: '',
  dateNaissance: '',
  lieuNaissance: '',
  sexe: '',
  nationalite: 'Camerounaise',
  typePiece: 'CNI',
  numeroPiece: '',
  dateDelivrance: '',
  dateExpiration: '',
  photo: null,
  ville: '',
  quartier: '',
  rue: '',
  telephonePrincipal: '',
  telephoneSecondaire: '',
  email: '',
  statutMatrimonial: '',
  nombreEnfants: 0,
  typeLogement: '',
  employeur: '',
  fonction: '',
  typeContrat: '',
  dateEmbauche: '',
  salaireMensuelNet: 0,
  autresRevenus: 0,
  isPPE: false,
  natureActivite: '',
  nomCommercial: '',
  lieuExercice: '',
  dateDebutActivite: '',
  revenuMensuelMoyen: 0,
  margeBeneficiaire: 0,
  chargesMensuelles: 0,
  saisonnalite: '',
  numeroPatente: '',
  raisonSociale: '',
  sigle: '',
  formeJuridique: '',
  numeroRCCM: '',
  numeroContribuable: '',
  dateCreation: '',
  secteurActivite: '',
  adresseSiege: '',
  telephoneEntreprise: '',
  emailEntreprise: '',
  nombreEmployes: 0,
  masseSalariale: 0,
  representantLegal: '',
  representantCNI: '',
  beneficiairesEffectifs: '',
  chiffreAffairesAnnuel: 0,
  principauxClients: '',
  isPPEEntreprise: false,
};

interface Props {
  clientType: ClientType;
  initialData?: Partial<KYCFormData>;
  prefilledData?: Partial<KYCFormData>;
  onSubmit: (data: KYCFormData) => void;
  onCancel?: () => void;
  mode?: 'client' | 'gestionnaire';
}

const getSteps = (clientType: ClientType) => {
  if (clientType === 'entreprise') {
    return [
      { id: 'identification', label: 'Identification', icon: Building2 },
      { id: 'coordonnees', label: 'Coordonnées', icon: FileText },
      { id: 'gouvernance', label: 'Gouvernance', icon: Shield },
    ];
  }
  return [
    { id: 'identification', label: 'Identification', icon: User },
    { id: 'social', label: 'Vie Sociale', icon: Heart },
    { id: 'professionnel', label: 'Professionnel', icon: Briefcase },
  ];
};

export function KYCWizardForm({ clientType, initialData, prefilledData, onSubmit, onCancel, mode = 'gestionnaire' }: Props) {
  const [formData, setFormData] = useState<KYCFormData>({ ...initialFormData, ...prefilledData, ...initialData });
  const [currentStep, setCurrentStep] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const steps = getSteps(clientType);

  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => ({ ...prev, ...prefilledData }));
    }
  }, [prefilledData]);

  const handleChange = (name: keyof KYCFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        handleChange('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateProgress = (): number => {
    const requiredFields = getRequiredFieldsForType(clientType);
    const filled = requiredFields.filter(f => {
      const value = formData[f as keyof KYCFormData];
      return value !== '' && value !== null && value !== undefined && value !== 0;
    });
    return Math.round((filled.length / requiredFields.length) * 100);
  };

  const getRequiredFieldsForType = (type: ClientType): string[] => {
    const common = ['nom', 'prenom', 'dateNaissance', 'telephonePrincipal', 'email', 'ville', 'quartier'];
    
    if (type === 'salarie') {
      return [...common, 'employeur', 'fonction', 'typeContrat', 'salaireMensuelNet'];
    }
    if (type === 'independant') {
      return [...common, 'natureActivite', 'lieuExercice', 'revenuMensuelMoyen'];
    }
    return ['raisonSociale', 'formeJuridique', 'numeroRCCM', 'numeroContribuable', 'telephoneEntreprise', 'representantLegal'];
  };

  const isStepComplete = (stepIndex: number): boolean => {
    const stepId = steps[stepIndex].id;
    const fieldsForStep = getFieldsForStep(stepId);
    return fieldsForStep.every(f => {
      const value = formData[f as keyof KYCFormData];
      return value !== '' && value !== null && value !== undefined;
    });
  };

  const getFieldsForStep = (stepId: string): string[] => {
    if (clientType === 'entreprise') {
      switch (stepId) {
        case 'identification': return ['raisonSociale', 'formeJuridique', 'numeroRCCM', 'numeroContribuable', 'dateCreation'];
        case 'coordonnees': return ['adresseSiege', 'telephoneEntreprise', 'emailEntreprise'];
        case 'gouvernance': return ['representantLegal', 'representantCNI'];
        default: return [];
      }
    }
    switch (stepId) {
      case 'identification': return ['nom', 'prenom', 'dateNaissance', 'typePiece', 'numeroPiece'];
      case 'social': return ['ville', 'quartier', 'telephonePrincipal', 'email'];
      case 'professionnel': 
        return clientType === 'salarie' 
          ? ['employeur', 'fonction', 'salaireMensuelNet']
          : ['natureActivite', 'lieuExercice', 'revenuMensuelMoyen'];
      default: return [];
    }
  };

  const canGoNext = isStepComplete(currentStep);
  const progress = calculateProgress();
  const canSubmit = progress >= 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canGoNext) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(formData);
    } else {
      toast({
        title: 'Formulaire incomplet',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isComplete = idx < currentStep || isStepComplete(idx);
              
              return (
                <button
                  key={step.id}
                  onClick={() => idx <= currentStep && setCurrentStep(idx)}
                  className={cn(
                    "wizard-step",
                    isActive && "active",
                    isComplete && !isActive && "completed",
                    !isActive && !isComplete && "pending"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                    isActive && "bg-primary text-primary-foreground",
                    isComplete && !isActive && "bg-success text-success-foreground",
                    !isActive && !isComplete && "bg-muted text-muted-foreground"
                  )}>
                    {isComplete && !isActive ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{step.label}</span>
                </button>
              );
            })}
          </div>
          
          <Badge 
            variant={progress >= 100 ? 'default' : 'outline'}
            className={cn(
              "text-lg px-4 py-2",
              progress >= 100 && "bg-success text-success-foreground"
            )}
          >
            {progress}%
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2" />
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6 overflow-y-auto scrollable-content">
        {/* Step 1: Identification */}
        {currentStep === 0 && clientType !== 'entreprise' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Identification Personnelle
            </h3>
            
            {/* Photo Upload */}
            <div className="flex justify-center">
              <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Photo 4x4</span>
                  </>
                )}
                <label className="absolute inset-0 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nom <span className="text-destructive">*</span></Label>
                <Input 
                  value={formData.nom} 
                  onChange={e => handleChange('nom', e.target.value)} 
                  className="input-dark"
                  disabled={!!prefilledData?.nom}
                />
              </div>
              <div className="space-y-2">
                <Label>Prénom(s) <span className="text-destructive">*</span></Label>
                <Input 
                  value={formData.prenom} 
                  onChange={e => handleChange('prenom', e.target.value)} 
                  className="input-dark"
                  disabled={!!prefilledData?.prenom}
                />
              </div>
              <div className="space-y-2">
                <Label>Date de naissance <span className="text-destructive">*</span></Label>
                <Input 
                  type="date" 
                  value={formData.dateNaissance} 
                  onChange={e => handleChange('dateNaissance', e.target.value)} 
                  className="input-dark"
                  disabled={!!prefilledData?.dateNaissance}
                />
              </div>
              <div className="space-y-2">
                <Label>Lieu de naissance</Label>
                <Input 
                  value={formData.lieuNaissance} 
                  onChange={e => handleChange('lieuNaissance', e.target.value)} 
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label>Sexe</Label>
                <Select value={formData.sexe} onValueChange={v => handleChange('sexe', v)}>
                  <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nationalité</Label>
                <Input 
                  value={formData.nationalite} 
                  onChange={e => handleChange('nationalite', e.target.value)} 
                  className="input-dark"
                  disabled={!!prefilledData?.nationalite}
                />
              </div>
            </div>

            <h4 className="font-medium pt-4 border-t border-border">Pièce d'identité</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Type <span className="text-destructive">*</span></Label>
                <Select value={formData.typePiece} onValueChange={v => handleChange('typePiece', v)}>
                  <SelectTrigger className="input-dark"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNI">CNI</SelectItem>
                    <SelectItem value="Passeport">Passeport</SelectItem>
                    <SelectItem value="CarteSejour">Carte de séjour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Numéro <span className="text-destructive">*</span></Label>
                <Input value={formData.numeroPiece} onChange={e => handleChange('numeroPiece', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Date d'établissement</Label>
                <Input type="date" value={formData.dateDelivrance} onChange={e => handleChange('dateDelivrance', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Date d'expiration</Label>
                <Input type="date" value={formData.dateExpiration} onChange={e => handleChange('dateExpiration', e.target.value)} className="input-dark" />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Entreprise Identification */}
        {currentStep === 0 && clientType === 'entreprise' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Identification de l'Entreprise
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Raison Sociale <span className="text-destructive">*</span></Label>
                <Input value={formData.raisonSociale} onChange={e => handleChange('raisonSociale', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Sigle / Nom commercial</Label>
                <Input value={formData.sigle} onChange={e => handleChange('sigle', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Forme Juridique <span className="text-destructive">*</span></Label>
                <Select value={formData.formeJuridique} onValueChange={v => handleChange('formeJuridique', v)}>
                  <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SARL">SARL</SelectItem>
                    <SelectItem value="SA">SA</SelectItem>
                    <SelectItem value="ETS">ETS</SelectItem>
                    <SelectItem value="GIC">GIC</SelectItem>
                    <SelectItem value="Association">Association</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Secteur d'activité</Label>
                <Select value={formData.secteurActivite} onValueChange={v => handleChange('secteurActivite', v)}>
                  <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTP">BTP</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Import/Export">Import/Export</SelectItem>
                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                    <SelectItem value="Commerce">Commerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Numéro RCCM <span className="text-destructive">*</span></Label>
                <Input value={formData.numeroRCCM} onChange={e => handleChange('numeroRCCM', e.target.value)} className="input-dark" placeholder="RC/DLA/2020/B/XXXX" />
              </div>
              <div className="space-y-2">
                <Label>Numéro Contribuable (NIU) <span className="text-destructive">*</span></Label>
                <Input value={formData.numeroContribuable} onChange={e => handleChange('numeroContribuable', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Date de création <span className="text-destructive">*</span></Label>
                <Input type="date" value={formData.dateCreation} onChange={e => handleChange('dateCreation', e.target.value)} className="input-dark" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Social (Personne Physique) */}
        {currentStep === 1 && clientType !== 'entreprise' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Coordonnées & Vie Sociale
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ville <span className="text-destructive">*</span></Label>
                <Select value={formData.ville} onValueChange={v => handleChange('ville', v)}>
                  <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yaoundé">Yaoundé</SelectItem>
                    <SelectItem value="Douala">Douala</SelectItem>
                    <SelectItem value="Bafoussam">Bafoussam</SelectItem>
                    <SelectItem value="Garoua">Garoua</SelectItem>
                    <SelectItem value="Bamenda">Bamenda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quartier <span className="text-destructive">*</span></Label>
                <Input value={formData.quartier} onChange={e => handleChange('quartier', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Rue</Label>
                <Input value={formData.rue} onChange={e => handleChange('rue', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Téléphone Principal <span className="text-destructive">*</span></Label>
                <Input value={formData.telephonePrincipal} onChange={e => handleChange('telephonePrincipal', e.target.value)} className="input-dark" placeholder="+237 6XX XX XX XX" />
              </div>
              <div className="space-y-2">
                <Label>Téléphone Secondaire</Label>
                <Input value={formData.telephoneSecondaire} onChange={e => handleChange('telephoneSecondaire', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="input-dark" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label>Statut matrimonial</Label>
                <Select value={formData.statutMatrimonial} onValueChange={v => handleChange('statutMatrimonial', v)}>
                  <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Célibataire">Célibataire</SelectItem>
                    <SelectItem value="Marié(e)">Marié(e)</SelectItem>
                    <SelectItem value="Divorcé(e)">Divorcé(e)</SelectItem>
                    <SelectItem value="Veuf(ve)">Veuf(ve)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nombre d'enfants à charge</Label>
                <Input type="number" value={formData.nombreEnfants} onChange={e => handleChange('nombreEnfants', parseInt(e.target.value) || 0)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Type de logement</Label>
                <Select value={formData.typeLogement} onValueChange={v => handleChange('typeLogement', v)}>
                  <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Propriétaire">Propriétaire</SelectItem>
                    <SelectItem value="Locataire">Locataire</SelectItem>
                    <SelectItem value="Logement de fonction">Logement de fonction</SelectItem>
                    <SelectItem value="Sous-locataire">Sous-locataire</SelectItem>
                    <SelectItem value="Domicile familial">Domicile familial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Coordonnées Entreprise */}
        {currentStep === 1 && clientType === 'entreprise' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Coordonnées & Siège Social
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Adresse du siège <span className="text-destructive">*</span></Label>
                <Input value={formData.adresseSiege} onChange={e => handleChange('adresseSiege', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Téléphone entreprise <span className="text-destructive">*</span></Label>
                <Input value={formData.telephoneEntreprise} onChange={e => handleChange('telephoneEntreprise', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Email professionnel</Label>
                <Input type="email" value={formData.emailEntreprise} onChange={e => handleChange('emailEntreprise', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Nombre d'employés</Label>
                <Input type="number" value={formData.nombreEmployes} onChange={e => handleChange('nombreEmployes', parseInt(e.target.value) || 0)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Masse salariale mensuelle (FCFA)</Label>
                <Input type="number" value={formData.masseSalariale} onChange={e => handleChange('masseSalariale', parseInt(e.target.value) || 0)} className="input-dark" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Professionnel Salarié */}
        {currentStep === 2 && clientType === 'salarie' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Informations Professionnelles - Salarié
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employeur (Entreprise/Administration) <span className="text-destructive">*</span></Label>
                <Input value={formData.employeur} onChange={e => handleChange('employeur', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Fonction / Poste <span className="text-destructive">*</span></Label>
                <Input value={formData.fonction} onChange={e => handleChange('fonction', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Type de contrat <span className="text-destructive">*</span></Label>
                <Select value={formData.typeContrat} onValueChange={v => handleChange('typeContrat', v)}>
                  <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Intérim">Intérim</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date d'embauche (Ancienneté)</Label>
                <Input type="date" value={formData.dateEmbauche} onChange={e => handleChange('dateEmbauche', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Salaire Mensuel Net (FCFA) <span className="text-destructive">*</span></Label>
                <Input type="number" value={formData.salaireMensuelNet || ''} onChange={e => handleChange('salaireMensuelNet', parseInt(e.target.value) || 0)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Autres revenus (Primes, locatifs, etc.)</Label>
                <Input type="number" value={formData.autresRevenus || ''} onChange={e => handleChange('autresRevenus', parseInt(e.target.value) || 0)} className="input-dark" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
              <Label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.isPPE}
                  onChange={e => handleChange('isPPE', e.target.checked)}
                  className="w-4 h-4 rounded border-warning"
                />
                <span className="text-warning font-medium">PPE - Personne Politiquement Exposée</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">Le client occupe-t-il une haute fonction politique ou publique ?</p>
            </div>
          </div>
        )}

        {/* Step 3: Professionnel Indépendant */}
        {currentStep === 2 && clientType === 'independant' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Informations sur l'Activité - Indépendant
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nature de l'activité <span className="text-destructive">*</span></Label>
                <Select value={formData.natureActivite} onValueChange={v => handleChange('natureActivite', v)}>
                  <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Commerce">Commerce</SelectItem>
                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                    <SelectItem value="Artisanat">Artisanat</SelectItem>
                    <SelectItem value="Consultant">Consultant</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nom commercial / Enseigne</Label>
                <Input value={formData.nomCommercial} onChange={e => handleChange('nomCommercial', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Lieu d'exercice <span className="text-destructive">*</span></Label>
                <Select value={formData.lieuExercice} onValueChange={v => handleChange('lieuExercice', v)}>
                  <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Marché">Marché</SelectItem>
                    <SelectItem value="Boutique">Boutique</SelectItem>
                    <SelectItem value="Domicile">Domicile</SelectItem>
                    <SelectItem value="Bureau">Bureau</SelectItem>
                    <SelectItem value="Ambulant">Ambulant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date de début d'activité</Label>
                <Input type="date" value={formData.dateDebutActivite} onChange={e => handleChange('dateDebutActivite', e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Revenu mensuel moyen (CA estimé) <span className="text-destructive">*</span></Label>
                <Input type="number" value={formData.revenuMensuelMoyen || ''} onChange={e => handleChange('revenuMensuelMoyen', parseInt(e.target.value) || 0)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Marge bénéficiaire estimée (%)</Label>
                <Input type="number" value={formData.margeBeneficiaire || ''} onChange={e => handleChange('margeBeneficiaire', parseInt(e.target.value) || 0)} className="input-dark" max="100" />
              </div>
              <div className="space-y-2">
                <Label>Charges mensuelles (Loyer, stock, transport)</Label>
                <Input type="number" value={formData.chargesMensuelles || ''} onChange={e => handleChange('chargesMensuelles', parseInt(e.target.value) || 0)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Saisonnalité</Label>
                <Input value={formData.saisonnalite} onChange={e => handleChange('saisonnalite', e.target.value)} className="input-dark" placeholder="Ex: Fort en Décembre" />
              </div>
              <div className="space-y-2">
                <Label>Numéro de Patente ou NIU</Label>
                <Input value={formData.numeroPatente} onChange={e => handleChange('numeroPatente', e.target.value)} className="input-dark" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
              <Label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.isPPE}
                  onChange={e => handleChange('isPPE', e.target.checked)}
                  className="w-4 h-4 rounded border-warning"
                />
                <span className="text-warning font-medium">PPE - Personne Politiquement Exposée</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">Lien avec le secteur public ?</p>
            </div>
          </div>
        )}

        {/* Step 3: Gouvernance Entreprise */}
        {currentStep === 2 && clientType === 'entreprise' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Gouvernance & Propriété
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Représentant Légal (Gérant/DG) <span className="text-destructive">*</span></Label>
                <Input value={formData.representantLegal} onChange={e => handleChange('representantLegal', e.target.value)} className="input-dark" placeholder="Nom et prénom" />
              </div>
              <div className="space-y-2">
                <Label>N° CNI du représentant <span className="text-destructive">*</span></Label>
                <Input value={formData.representantCNI} onChange={e => handleChange('representantCNI', e.target.value)} className="input-dark" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Bénéficiaires Effectifs (&gt;25% du capital)</Label>
                <Input value={formData.beneficiairesEffectifs} onChange={e => handleChange('beneficiairesEffectifs', e.target.value)} className="input-dark" placeholder="Noms des actionnaires principaux" />
              </div>
              <div className="space-y-2">
                <Label>Chiffre d'affaires annuel (FCFA)</Label>
                <Input type="number" value={formData.chiffreAffairesAnnuel || ''} onChange={e => handleChange('chiffreAffairesAnnuel', parseInt(e.target.value) || 0)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>Principaux clients</Label>
                <Select value={formData.principauxClients} onValueChange={v => handleChange('principauxClients', v)}>
                  <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">Secteur Public</SelectItem>
                    <SelectItem value="Privé">Secteur Privé</SelectItem>
                    <SelectItem value="Mixte">Mixte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
              <Label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.isPPEEntreprise}
                  onChange={e => handleChange('isPPEEntreprise', e.target.checked)}
                  className="w-4 h-4 rounded border-warning"
                />
                <span className="text-warning font-medium">PPE - L'un des actionnaires est-il une figure politique ?</span>
              </Label>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-card/50 flex items-center justify-between">
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>
        </div>
        
        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={!canGoNext} className="btn-primary">
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!canSubmit}
              className={cn(
                "transition-all",
                canSubmit ? "btn-primary" : "opacity-50 cursor-not-allowed"
              )}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {mode === 'client' ? 'Soumettre la fiche' : 'Valider la fiche KYC'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
