import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  User,
  Heart,
  Briefcase,
  CreditCard,
  Save,
  CheckCircle2,
  Upload,
  Camera,
} from 'lucide-react';
import { companies } from '@/data/mockData';

export default function ClientKYCForm() {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('identification');
  const [clientType, setClientType] = useState<'salarie' | 'independant' | 'entreprise'>('salarie');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // Identification
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
    ville: '',
    quartier: '',
    telephone: '',
    email: '',
    statutResident: 'resident',
    // Social
    situationMatrimoniale: '',
    personnesCharge: '',
    typeLogement: '',
    ancienneteAdresse: '',
    niveauInstruction: '',
    // Professionnel - Salarié
    employeur: '',
    fonction: '',
    typeContrat: '',
    ancienneteEmploi: '',
    salaireBrut: '',
    salaireNet: '',
    autresRevenus: '',
    // Professionnel - Indépendant
    activite: '',
    ancienneteActivite: '',
    caMensuel: '',
    marge: '',
    charges: '',
    saisonnalite: '',
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
    soldeMoyen: '',
    epargneCons: '',
    creditsEnCours: '',
  });

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    addNotification({
      title: 'Dossier KYC validé',
      message: 'Votre dossier client a été validé avec succès',
      type: 'success',
    });
  };

  const completionPercentage = () => {
    const requiredFields = ['nom', 'prenom', 'dateNaissance', 'telephone', 'email'];
    const filled = requiredFields.filter(f => formData[f as keyof typeof formData]).length;
    return Math.round((filled / requiredFields.length) * 100);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
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
              { id: 'entreprise', label: 'Entreprise', icon: CreditCard },
            ].map(type => (
              <Button
                key={type.id}
                variant={clientType === type.id ? 'default' : 'outline'}
                className={clientType === type.id ? "bg-primary" : ""}
                onClick={() => setClientType(type.id as any)}
              >
                <type.icon className="w-4 h-4 mr-2" />
                {type.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="identification" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="w-4 h-4 mr-2" />
            Identification
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" disabled={clientType === 'entreprise'}>
            <Heart className="w-4 h-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="professionnel" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Briefcase className="w-4 h-4 mr-2" />
            Professionnel
          </TabsTrigger>
          <TabsTrigger value="bancaire" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="w-4 h-4 mr-2" />
            Bancaire
          </TabsTrigger>
        </TabsList>

        {/* IDENTIFICATION TAB */}
        <TabsContent value="identification">
          <Card className="glass-card">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b border-border pb-3">
                <User className="w-5 h-5 text-primary" />
                {clientType === 'entreprise' ? 'Identification Entreprise' : 'Identification du Client'}
              </h3>

              {clientType !== 'entreprise' ? (
                <>
                  {/* Photo & Signature */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Photo" className="w-24 h-24 mx-auto rounded-lg object-cover mb-2" />
                      ) : (
                        <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground mb-2">Photo d'identité</p>
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        <Button variant="outline" size="sm" asChild>
                          <span><Upload className="w-4 h-4 mr-2" />Importer</span>
                        </Button>
                      </label>
                    </div>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      {signaturePreview ? (
                        <img src={signaturePreview} alt="Signature" className="w-24 h-12 mx-auto mb-2 object-contain" />
                      ) : (
                        <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground mb-2">Signature</p>
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                        <Button variant="outline" size="sm" asChild>
                          <span><Upload className="w-4 h-4 mr-2" />Importer</span>
                        </Button>
                      </label>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nom <span className="text-destructive">*</span></Label>
                      <Input value={formData.nom} onChange={(e) => handleChange('nom', e.target.value)} className="input-dark" placeholder="EKEDI" />
                    </div>
                    <div className="space-y-2">
                      <Label>Prénom <span className="text-destructive">*</span></Label>
                      <Input value={formData.prenom} onChange={(e) => handleChange('prenom', e.target.value)} className="input-dark" placeholder="Jean-Paul" />
                    </div>
                    <div className="space-y-2">
                      <Label>Date de naissance <span className="text-destructive">*</span></Label>
                      <Input type="date" value={formData.dateNaissance} onChange={(e) => handleChange('dateNaissance', e.target.value)} className="input-dark" />
                    </div>
                    <div className="space-y-2">
                      <Label>Lieu de naissance</Label>
                      <Input value={formData.lieuNaissance} onChange={(e) => handleChange('lieuNaissance', e.target.value)} className="input-dark" placeholder="Yaoundé" />
                    </div>
                    <div className="space-y-2">
                      <Label>Sexe</Label>
                      <Select value={formData.sexe} onValueChange={(v) => handleChange('sexe', v)}>
                        <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculin</SelectItem>
                          <SelectItem value="F">Féminin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nationalité</Label>
                      <Input value={formData.nationalite} onChange={(e) => handleChange('nationalite', e.target.value)} className="input-dark" />
                    </div>
                  </div>

                  {/* Identity Document */}
                  <h4 className="font-medium pt-4 border-t border-border">Pièce d'identité</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={formData.typePiece} onValueChange={(v) => handleChange('typePiece', v)}>
                        <SelectTrigger className="input-dark"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CNI">CNI</SelectItem>
                          <SelectItem value="Passeport">Passeport</SelectItem>
                          <SelectItem value="Récépissé">Récépissé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Numéro</Label>
                      <Input value={formData.numeroPiece} onChange={(e) => handleChange('numeroPiece', e.target.value)} className="input-dark" />
                    </div>
                    <div className="space-y-2">
                      <Label>Date délivrance</Label>
                      <Input type="date" value={formData.dateDelivrance} onChange={(e) => handleChange('dateDelivrance', e.target.value)} className="input-dark" />
                    </div>
                    <div className="space-y-2">
                      <Label>Date expiration</Label>
                      <Input type="date" value={formData.dateExpiration} onChange={(e) => handleChange('dateExpiration', e.target.value)} className="input-dark" />
                    </div>
                  </div>

                  {/* Address */}
                  <h4 className="font-medium pt-4 border-t border-border">Adresse de résidence</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Ville</Label>
                      <Select value={formData.ville} onValueChange={(v) => handleChange('ville', v)}>
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
                      <Label>Quartier</Label>
                      <Input value={formData.quartier} onChange={(e) => handleChange('quartier', e.target.value)} className="input-dark" placeholder="Bastos" />
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone <span className="text-destructive">*</span></Label>
                      <Input value={formData.telephone} onChange={(e) => handleChange('telephone', e.target.value)} className="input-dark" placeholder="+237 6 XX XX XX XX" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email <span className="text-destructive">*</span></Label>
                      <Input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="input-dark" placeholder="email@example.cm" />
                    </div>
                  </div>
                </>
              ) : (
                /* ENTREPRISE Identification */
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dénomination sociale <span className="text-destructive">*</span></Label>
                    <Input value={formData.denomination} onChange={(e) => handleChange('denomination', e.target.value)} className="input-dark" />
                  </div>
                  <div className="space-y-2">
                    <Label>Forme juridique</Label>
                    <Select value={formData.formeJuridique} onValueChange={(v) => handleChange('formeJuridique', v)}>
                      <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SARL">SARL</SelectItem>
                        <SelectItem value="SA">SA</SelectItem>
                        <SelectItem value="SAS">SAS</SelectItem>
                        <SelectItem value="EI">Entreprise Individuelle</SelectItem>
                        <SelectItem value="GIE">GIE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Numéro RCCM</Label>
                    <Input value={formData.rccm} onChange={(e) => handleChange('rccm', e.target.value)} className="input-dark" placeholder="RC/DLA/2020/B/XXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Numéro Contribuable</Label>
                    <Input value={formData.contribuable} onChange={(e) => handleChange('contribuable', e.target.value)} className="input-dark" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de création</Label>
                    <Input type="date" value={formData.dateCreation} onChange={(e) => handleChange('dateCreation', e.target.value)} className="input-dark" />
                  </div>
                  <div className="space-y-2">
                    <Label>Adresse du siège</Label>
                    <Input value={formData.siege} onChange={(e) => handleChange('siege', e.target.value)} className="input-dark" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Identité du dirigeant</Label>
                    <Input value={formData.dirigeant} onChange={(e) => handleChange('dirigeant', e.target.value)} className="input-dark" placeholder="Nom et prénom du dirigeant" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOCIAL TAB */}
        <TabsContent value="social">
          <Card className="glass-card">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b border-border pb-3">
                <Heart className="w-5 h-5 text-primary" />
                Situation Familiale et Sociale
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Situation Matrimoniale</Label>
                  <Select value={formData.situationMatrimoniale} onValueChange={(v) => handleChange('situationMatrimoniale', v)}>
                    <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celibataire">Célibataire</SelectItem>
                      <SelectItem value="marie">Marié(e)</SelectItem>
                      <SelectItem value="divorce">Divorcé(e)</SelectItem>
                      <SelectItem value="veuf">Veuf(ve)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Personnes à charge</Label>
                  <Input type="number" value={formData.personnesCharge} onChange={(e) => handleChange('personnesCharge', e.target.value)} className="input-dark" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Type de Logement</Label>
                  <Select value={formData.typeLogement} onValueChange={(v) => handleChange('typeLogement', v)}>
                    <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proprietaire">Propriétaire</SelectItem>
                      <SelectItem value="locataire">Locataire</SelectItem>
                      <SelectItem value="heberge">Hébergé (familial)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ancienneté à l'adresse</Label>
                  <Input value={formData.ancienneteAdresse} onChange={(e) => handleChange('ancienneteAdresse', e.target.value)} className="input-dark" placeholder="Ex: 3 ans" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Niveau d'instruction</Label>
                  <Select value={formData.niveauInstruction} onValueChange={(v) => handleChange('niveauInstruction', v)}>
                    <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primaire">Primaire</SelectItem>
                      <SelectItem value="secondaire">Secondaire</SelectItem>
                      <SelectItem value="superieur">Supérieur</SelectItem>
                      <SelectItem value="professionnel">Formation Professionnelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROFESSIONNEL TAB */}
        <TabsContent value="professionnel">
          <Card className="glass-card">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b border-border pb-3">
                <Briefcase className="w-5 h-5 text-primary" />
                Situation Professionnelle et Revenus
              </h3>

              {clientType === 'salarie' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Employeur</Label>
                      <Select value={formData.employeur} onValueChange={(v) => handleChange('employeur', v)}>
                        <SelectTrigger className="input-dark"><SelectValue placeholder="Rechercher..." /></SelectTrigger>
                        <SelectContent>
                          {companies.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name} ({c.sigle})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fonction / Poste</Label>
                      <Input value={formData.fonction} onChange={(e) => handleChange('fonction', e.target.value)} className="input-dark" placeholder="Comptable" />
                    </div>
                    <div className="space-y-2">
                      <Label>Type de Contrat</Label>
                      <Select value={formData.typeContrat} onValueChange={(v) => handleChange('typeContrat', v)}>
                        <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CDI">CDI</SelectItem>
                          <SelectItem value="CDD">CDD</SelectItem>
                          <SelectItem value="Journalier">Journalier</SelectItem>
                          <SelectItem value="Consultant">Consultant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ancienneté (mois)</Label>
                      <Input type="number" value={formData.ancienneteEmploi} onChange={(e) => handleChange('ancienneteEmploi', e.target.value)} className="input-dark" />
                    </div>
                    <div className="space-y-2">
                      <Label>Salaire Brut (FCFA)</Label>
                      <Input value={formData.salaireBrut} onChange={(e) => handleChange('salaireBrut', e.target.value)} className="input-dark" placeholder="500 000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Salaire Net (FCFA)</Label>
                      <Input value={formData.salaireNet} onChange={(e) => handleChange('salaireNet', e.target.value)} className="input-dark" placeholder="420 000" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Autres revenus réguliers</Label>
                      <Input value={formData.autresRevenus} onChange={(e) => handleChange('autresRevenus', e.target.value)} className="input-dark" placeholder="Loyers, primes..." />
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <Label className="text-muted-foreground">Documents à joindre</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Button variant="outline" className="justify-start"><Upload className="w-4 h-4 mr-2" />Attestation de travail</Button>
                      <Button variant="outline" className="justify-start"><Upload className="w-4 h-4 mr-2" />Bulletins de paie (3 derniers)</Button>
                    </div>
                  </div>
                </div>
              )}

              {clientType === 'independant' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Activité principale</Label>
                      <Input value={formData.activite} onChange={(e) => handleChange('activite', e.target.value)} className="input-dark" placeholder="Commerce général" />
                    </div>
                    <div className="space-y-2">
                      <Label>Ancienneté de l'activité (mois)</Label>
                      <Input type="number" value={formData.ancienneteActivite} onChange={(e) => handleChange('ancienneteActivite', e.target.value)} className="input-dark" />
                    </div>
                    <div className="space-y-2">
                      <Label>Chiffre d'affaires mensuel (FCFA)</Label>
                      <Input value={formData.caMensuel} onChange={(e) => handleChange('caMensuel', e.target.value)} className="input-dark" placeholder="2 000 000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Marge estimée (%)</Label>
                      <Input value={formData.marge} onChange={(e) => handleChange('marge', e.target.value)} className="input-dark" placeholder="15" />
                    </div>
                    <div className="space-y-2">
                      <Label>Charges mensuelles (FCFA)</Label>
                      <Input value={formData.charges} onChange={(e) => handleChange('charges', e.target.value)} className="input-dark" placeholder="500 000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Saisonnalité</Label>
                      <Select value={formData.saisonnalite} onValueChange={(v) => handleChange('saisonnalite', v)}>
                        <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stable">Stable</SelectItem>
                          <SelectItem value="saisonnier">Saisonnier</SelectItem>
                          <SelectItem value="variable">Variable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <Label className="text-muted-foreground">Documents à joindre</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Button variant="outline" className="justify-start"><Upload className="w-4 h-4 mr-2" />Patente / Registre commerce</Button>
                      <Button variant="outline" className="justify-start"><Upload className="w-4 h-4 mr-2" />Relevés bancaires (3 derniers)</Button>
                    </div>
                  </div>
                </div>
              )}

              {clientType === 'entreprise' && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">Les informations de l'entreprise ont été saisies dans l'onglet Identification.</p>
                  <div className="border-t border-border pt-4">
                    <Label className="text-muted-foreground">Documents à joindre</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Button variant="outline" className="justify-start"><Upload className="w-4 h-4 mr-2" />RCCM</Button>
                      <Button variant="outline" className="justify-start"><Upload className="w-4 h-4 mr-2" />Statuts de l'entreprise</Button>
                      <Button variant="outline" className="justify-start"><Upload className="w-4 h-4 mr-2" />États financiers</Button>
                      <Button variant="outline" className="justify-start"><Upload className="w-4 h-4 mr-2" />Relevés bancaires</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BANCAIRE TAB */}
        <TabsContent value="bancaire">
          <Card className="glass-card">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b border-border pb-3">
                <CreditCard className="w-5 h-5 text-primary" />
                Informations Financières et Bancaires
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Comptes bancaires ailleurs</Label>
                  <Input value={formData.comptesAutres} onChange={(e) => handleChange('comptesAutres', e.target.value)} className="input-dark" placeholder="Banque, type de compte..." />
                </div>
                <div className="space-y-2">
                  <Label>Historique avec notre banque</Label>
                  <Select value={formData.historiqueBancaire} onValueChange={(v) => handleChange('historiqueBancaire', v)}>
                    <SelectTrigger className="input-dark"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nouveau">Nouveau client</SelectItem>
                      <SelectItem value="moins1an">Moins de 1 an</SelectItem>
                      <SelectItem value="1a3ans">1 à 3 ans</SelectItem>
                      <SelectItem value="plus3ans">Plus de 3 ans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Solde moyen (FCFA)</Label>
                  <Input value={formData.soldeMoyen} onChange={(e) => handleChange('soldeMoyen', e.target.value)} className="input-dark" placeholder="150 000" />
                </div>
                <div className="space-y-2">
                  <Label>Épargne constituée (FCFA)</Label>
                  <Input value={formData.epargneCons} onChange={(e) => handleChange('epargneCons', e.target.value)} className="input-dark" placeholder="500 000" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Autres crédits en cours (banques, IMF, tontines)</Label>
                  <Input value={formData.creditsEnCours} onChange={(e) => handleChange('creditsEnCours', e.target.value)} className="input-dark" placeholder="Montants, durées, échéances..." />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="w-4 h-4 mr-2" />
          Enregistrer Brouillon
        </Button>
        <Button variant="gold" onClick={handleValidate}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Valider Mon Dossier
        </Button>
      </div>
    </div>
  );
}
