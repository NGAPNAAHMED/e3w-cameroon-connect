import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  User,
  Heart,
  Briefcase,
  Building,
  CreditCard,
  Save,
  CheckCircle2,
  Upload,
  Camera,
} from 'lucide-react';
import { companies } from '@/data/mockData';
import { cn } from '@/lib/utils';

const steps = [
  { id: 'identification', label: 'Identification', icon: User },
  { id: 'social', label: 'Situation Sociale', icon: Heart },
  { id: 'professionnel', label: 'Professionnel', icon: Briefcase },
  { id: 'bancaire', label: 'Bancaire', icon: CreditCard },
];

export default function ClientKYCForm() {
  const [activeStep, setActiveStep] = useState('identification');
  const [clientType, setClientType] = useState<'salarie' | 'independant' | 'entreprise'>('salarie');
  const [formData, setFormData] = useState({
    // Identification
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    sexe: '',
    nationalite: 'Camerounaise',
    numeroCNI: '',
    dateDelivranceCNI: '',
    dateExpirationCNI: '',
    ville: '',
    quartier: '',
    telephone: '',
    email: '',
    // Social
    situationMatrimoniale: '',
    enfantsCharge: '',
    logement: '',
    niveauInstruction: '',
    // Professionnel - Salarié
    employeur: '',
    fonction: '',
    typeContrat: '',
    ancienneteEmploi: '',
    salaireNet: '',
    // Professionnel - Indépendant
    activite: '',
    ancienneteActivite: '',
    caMensuel: '',
    marge: '',
    charges: '',
    // Professionnel - Entreprise
    denomination: '',
    formeJuridique: '',
    rccm: '',
    contribuable: '',
    dateCreation: '',
    siege: '',
    dirigeant: '',
    // Bancaire
    comptesAutres: '',
    historiqueBancaire: '',
  });

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveDraft = () => {
    toast({
      title: "Brouillon enregistré",
      description: "Vos informations ont été sauvegardées",
    });
  };

  const handleValidate = () => {
    toast({
      title: "Dossier validé !",
      description: "Votre dossier client est maintenant complet",
    });
  };

  const completionPercentage = () => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(v => v !== '').length;
    return Math.round((filledFields / totalFields) * 100);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Créer Mon Dossier Client</h1>
          <p className="text-muted-foreground">Complétez votre profil pour accéder aux services</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {completionPercentage()}% complété
        </Badge>
      </div>

      {/* Client Type Selection */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <Label className="text-sm text-muted-foreground mb-3 block">Type de profil</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'salarie', label: 'Salarié', icon: User },
              { id: 'independant', label: 'Indépendant', icon: Briefcase },
              { id: 'entreprise', label: 'Entreprise', icon: Building },
            ].map(type => (
              <Button
                key={type.id}
                variant={clientType === type.id ? 'default' : 'outline'}
                className={cn("h-auto py-4 flex-col gap-2", clientType === type.id && "bg-primary")}
                onClick={() => setClientType(type.id as any)}
              >
                <type.icon className="w-5 h-5" />
                <span>{type.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <Button
              key={step.id}
              variant={isActive ? 'default' : 'outline'}
              className={cn("flex-shrink-0", isActive && "bg-primary")}
              onClick={() => setActiveStep(step.id)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {step.label}
            </Button>
          );
        })}
      </div>

      {/* Form Content */}
      <Card className="glass-card">
        <CardContent className="p-6">
          {/* IDENTIFICATION */}
          {activeStep === 'identification' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Identification
              </h3>
              
              {/* Photo & Signature */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Photo d'identité</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Uploader
                  </Button>
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Signature</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Uploader
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={formData.nom}
                    onChange={(e) => handleChange('nom', e.target.value)}
                    className="input-dark"
                    placeholder="EKEDI"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input
                    value={formData.prenom}
                    onChange={(e) => handleChange('prenom', e.target.value)}
                    className="input-dark"
                    placeholder="Jean-Paul"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date de naissance</Label>
                  <Input
                    type="date"
                    value={formData.dateNaissance}
                    onChange={(e) => handleChange('dateNaissance', e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lieu de naissance</Label>
                  <Input
                    value={formData.lieuNaissance}
                    onChange={(e) => handleChange('lieuNaissance', e.target.value)}
                    className="input-dark"
                    placeholder="Yaoundé"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sexe</Label>
                  <Select value={formData.sexe} onValueChange={(v) => handleChange('sexe', v)}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
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
                    onChange={(e) => handleChange('nationalite', e.target.value)}
                    className="input-dark"
                  />
                </div>
              </div>

              <h4 className="font-medium mt-6">Carte Nationale d'Identité</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Numéro CNI</Label>
                  <Input
                    value={formData.numeroCNI}
                    onChange={(e) => handleChange('numeroCNI', e.target.value)}
                    className="input-dark"
                    placeholder="XXX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date de délivrance</Label>
                  <Input
                    type="date"
                    value={formData.dateDelivranceCNI}
                    onChange={(e) => handleChange('dateDelivranceCNI', e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date d'expiration</Label>
                  <Input
                    type="date"
                    value={formData.dateExpirationCNI}
                    onChange={(e) => handleChange('dateExpirationCNI', e.target.value)}
                    className="input-dark"
                  />
                </div>
              </div>

              <h4 className="font-medium mt-6">Adresse</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Select value={formData.ville} onValueChange={(v) => handleChange('ville', v)}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
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
                  <Label>Quartier</Label>
                  <Input
                    value={formData.quartier}
                    onChange={(e) => handleChange('quartier', e.target.value)}
                    className="input-dark"
                    placeholder="Bastos"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={formData.telephone}
                    onChange={(e) => handleChange('telephone', e.target.value)}
                    className="input-dark"
                    placeholder="+237 6 XX XX XX XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="input-dark"
                    placeholder="email@example.cm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SOCIAL */}
          {activeStep === 'social' && clientType !== 'entreprise' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Situation Sociale
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Situation Matrimoniale</Label>
                  <Select value={formData.situationMatrimoniale} onValueChange={(v) => handleChange('situationMatrimoniale', v)}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celibataire">Célibataire</SelectItem>
                      <SelectItem value="marie">Marié(e)</SelectItem>
                      <SelectItem value="divorce">Divorcé(e)</SelectItem>
                      <SelectItem value="veuf">Veuf(ve)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Enfants à charge</Label>
                  <Input
                    type="number"
                    value={formData.enfantsCharge}
                    onChange={(e) => handleChange('enfantsCharge', e.target.value)}
                    className="input-dark"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type de Logement</Label>
                  <Select value={formData.logement} onValueChange={(v) => handleChange('logement', v)}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proprietaire">Propriétaire</SelectItem>
                      <SelectItem value="locataire">Locataire</SelectItem>
                      <SelectItem value="heberge">Hébergé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Niveau d'instruction</Label>
                  <Select value={formData.niveauInstruction} onValueChange={(v) => handleChange('niveauInstruction', v)}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primaire">Primaire</SelectItem>
                      <SelectItem value="secondaire">Secondaire</SelectItem>
                      <SelectItem value="superieur">Supérieur</SelectItem>
                      <SelectItem value="professionnel">Formation Professionnelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* PROFESSIONNEL - SALARIÉ */}
          {activeStep === 'professionnel' && clientType === 'salarie' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Informations Professionnelles - Salarié
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employeur</Label>
                  <Select value={formData.employeur} onValueChange={(v) => handleChange('employeur', v)}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Rechercher..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.sigle})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fonction</Label>
                  <Input
                    value={formData.fonction}
                    onChange={(e) => handleChange('fonction', e.target.value)}
                    className="input-dark"
                    placeholder="Comptable"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type de Contrat</Label>
                  <Select value={formData.typeContrat} onValueChange={(v) => handleChange('typeContrat', v)}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Consultant">Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ancienneté (mois)</Label>
                  <Input
                    type="number"
                    value={formData.ancienneteEmploi}
                    onChange={(e) => handleChange('ancienneteEmploi', e.target.value)}
                    className="input-dark"
                    placeholder="24"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Salaire Net Mensuel (FCFA)</Label>
                  <Input
                    value={formData.salaireNet}
                    onChange={(e) => handleChange('salaireNet', e.target.value)}
                    className="input-dark"
                    placeholder="500 000"
                  />
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-6">
                <h4 className="font-medium mb-4">Documents à joindre</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto py-4">
                    <Upload className="w-4 h-4 mr-2" />
                    Attestation de travail
                  </Button>
                  <Button variant="outline" className="h-auto py-4">
                    <Upload className="w-4 h-4 mr-2" />
                    3 derniers bulletins de paie
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* PROFESSIONNEL - INDÉPENDANT */}
          {activeStep === 'professionnel' && clientType === 'independant' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Informations Professionnelles - Indépendant
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Activité</Label>
                  <Input
                    value={formData.activite}
                    onChange={(e) => handleChange('activite', e.target.value)}
                    className="input-dark"
                    placeholder="Commerce Général"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ancienneté (mois)</Label>
                  <Input
                    type="number"
                    value={formData.ancienneteActivite}
                    onChange={(e) => handleChange('ancienneteActivite', e.target.value)}
                    className="input-dark"
                    placeholder="36"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chiffre d'Affaires Mensuel (FCFA)</Label>
                  <Input
                    value={formData.caMensuel}
                    onChange={(e) => handleChange('caMensuel', e.target.value)}
                    className="input-dark"
                    placeholder="5 000 000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marge (%)</Label>
                  <Input
                    type="number"
                    value={formData.marge}
                    onChange={(e) => handleChange('marge', e.target.value)}
                    className="input-dark"
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Charges Mensuelles (FCFA)</Label>
                  <Input
                    value={formData.charges}
                    onChange={(e) => handleChange('charges', e.target.value)}
                    className="input-dark"
                    placeholder="500 000"
                  />
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-6">
                <h4 className="font-medium mb-4">Documents à joindre</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto py-4">
                    <Upload className="w-4 h-4 mr-2" />
                    Patente / Carte contribuable
                  </Button>
                  <Button variant="outline" className="h-auto py-4">
                    <Upload className="w-4 h-4 mr-2" />
                    Relevés bancaires
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* PROFESSIONNEL - ENTREPRISE */}
          {activeStep === 'professionnel' && clientType === 'entreprise' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Informations Entreprise
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dénomination</Label>
                  <Input
                    value={formData.denomination}
                    onChange={(e) => handleChange('denomination', e.target.value)}
                    className="input-dark"
                    placeholder="Ma Société SARL"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Forme Juridique</Label>
                  <Select value={formData.formeJuridique} onValueChange={(v) => handleChange('formeJuridique', v)}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SARL">SARL</SelectItem>
                      <SelectItem value="SA">SA</SelectItem>
                      <SelectItem value="ETS">Établissement</SelectItem>
                      <SelectItem value="GIE">GIE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Numéro RCCM</Label>
                  <Input
                    value={formData.rccm}
                    onChange={(e) => handleChange('rccm', e.target.value)}
                    className="input-dark"
                    placeholder="RC/DLA/2020/B/XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>N° Contribuable</Label>
                  <Input
                    value={formData.contribuable}
                    onChange={(e) => handleChange('contribuable', e.target.value)}
                    className="input-dark"
                    placeholder="M-XXXXX-X"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date de Création</Label>
                  <Input
                    type="date"
                    value={formData.dateCreation}
                    onChange={(e) => handleChange('dateCreation', e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Siège Social</Label>
                  <Input
                    value={formData.siege}
                    onChange={(e) => handleChange('siege', e.target.value)}
                    className="input-dark"
                    placeholder="Douala, Bonanjo"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Nom du Dirigeant</Label>
                  <Input
                    value={formData.dirigeant}
                    onChange={(e) => handleChange('dirigeant', e.target.value)}
                    className="input-dark"
                    placeholder="Jean EKEDI"
                  />
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-6">
                <h4 className="font-medium mb-4">Documents à joindre</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto py-4">
                    <Upload className="w-4 h-4 mr-2" />
                    RCCM
                  </Button>
                  <Button variant="outline" className="h-auto py-4">
                    <Upload className="w-4 h-4 mr-2" />
                    Statuts
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* BANCAIRE */}
          {activeStep === 'bancaire' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Informations Bancaires
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Comptes dans d'autres banques</Label>
                  <Select value={formData.comptesAutres} onValueChange={(v) => handleChange('comptesAutres', v)}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oui">Oui</SelectItem>
                      <SelectItem value="non">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Historique bancaire</Label>
                  <Select value={formData.historiqueBancaire} onValueChange={(v) => handleChange('historiqueBancaire', v)}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="bon">Bon</SelectItem>
                      <SelectItem value="moyen">Moyen</SelectItem>
                      <SelectItem value="nouveau">Nouveau client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleSaveDraft} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Enregistrer Brouillon
        </Button>
        <Button variant="gold" onClick={handleValidate} className="flex-1">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Valider Mon Dossier
        </Button>
      </div>
    </div>
  );
}
