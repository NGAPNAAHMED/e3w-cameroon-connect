import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { useCreditTypes } from '@/hooks/useCreditTypes';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Settings, CreditCard, Percent, Save, Plus, Trash2, TrendingUp, PauseCircle, PlayCircle, Shield, Users, Bell, Edit, History, Building2, Briefcase, AlertCircle } from 'lucide-react';
import { formatXAF, formatPourcentage } from '@/lib/formatters';
import { supabase } from '@/integrations/supabase/client';

const formatMontantInput = (value: string): string => {
  const num = value.replace(/\s/g, '').replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const parseMontant = (value: string): number => {
  return parseInt(value.replace(/\s/g, '')) || 0;
};

interface CreditTypeForm {
  libelle: string;
  taux_interet: number;
  montant_min: number;
  montant_max: number;
  duree_min: number;
  duree_max: number;
  differe_max: number;
  client_categories: ('salarie' | 'independant' | 'entreprise')[];
}

export default function AdminParametres() {
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const { creditTypes, loading, createCreditType, updateCreditType, toggleStatus, deleteCreditType } = useCreditTypes();
  
  const [activeTab, setActiveTab] = useState('credits');
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<any>(null);
  const [suspendMotif, setSuspendMotif] = useState('');
  const [editingCredit, setEditingCredit] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [creditForm, setCreditForm] = useState<CreditTypeForm>({
    libelle: '',
    taux_interet: 10,
    montant_min: 100000,
    montant_max: 10000000,
    duree_min: 3,
    duree_max: 36,
    differe_max: 3,
    client_categories: ['salarie', 'independant', 'entreprise'],
  });

  const [notifSettings, setNotifSettings] = useState({
    nouveauClient: true,
    dossierTransmis: true,
    dossierApprouve: true,
    dossierRejete: true,
    impayeDetecte: true,
    rappelRdv: true,
  });

  const loadHistory = async (creditTypeId: string) => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('credit_type_history')
        .select('*')
        .eq('credit_type_id', creditTypeId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenSuspendDialog = (credit: any) => {
    setSelectedCredit(credit);
    setSuspendMotif('');
    setShowSuspendDialog(true);
  };

  const handleToggleCredit = async () => {
    if (!selectedCredit) return;
    
    if (selectedCredit.status === 'actif' && !suspendMotif.trim()) {
      toast({
        title: "Motif requis",
        description: "Veuillez indiquer le motif de suspension",
        variant: "destructive",
      });
      return;
    }

    const success = await toggleStatus(
      selectedCredit.id, 
      selectedCredit.status === 'actif' ? 'suspendu' : 'actif',
      suspendMotif || undefined
    );

    if (success) {
      addNotification({
        title: "Type de crédit modifié",
        message: `${selectedCredit.libelle} a été ${selectedCredit.status === 'actif' ? 'suspendu' : 'activé'}`,
        type: selectedCredit.status === 'actif' ? "warning" : "success"
      });
    }
    
    setShowSuspendDialog(false);
    setSelectedCredit(null);
    setSuspendMotif('');
  };

  const handleOpenCreditDialog = (credit?: any) => {
    if (credit) {
      setEditingCredit(credit);
      setCreditForm({
        libelle: credit.libelle,
        taux_interet: credit.taux_interet,
        montant_min: credit.montant_min || 100000,
        montant_max: credit.montant_max || 10000000,
        duree_min: credit.duree_min || 3,
        duree_max: credit.duree_max || 36,
        differe_max: credit.differe_max || 3,
        client_categories: credit.client_categories || ['salarie', 'independant', 'entreprise'],
      });
    } else {
      setEditingCredit(null);
      setCreditForm({
        libelle: '',
        taux_interet: 10,
        montant_min: 100000,
        montant_max: 10000000,
        duree_min: 3,
        duree_max: 36,
        differe_max: 3,
        client_categories: ['salarie', 'independant', 'entreprise'],
      });
    }
    setShowCreditDialog(true);
  };

  const handleOpenHistoryDialog = async (credit: any) => {
    setSelectedCredit(credit);
    setShowHistoryDialog(true);
    await loadHistory(credit.id);
  };

  const handleSaveCreditType = async () => {
    if (!creditForm.libelle?.trim()) {
      toast({
        title: "Erreur",
        description: "Le libellé est obligatoire",
        variant: "destructive",
      });
      return;
    }

    if (editingCredit) {
      const success = await updateCreditType(editingCredit.id, creditForm);
      if (success) {
        addNotification({
          title: "Type modifié",
          message: `${creditForm.libelle} a été mis à jour`,
          type: "success"
        });
      }
    } else {
      const success = await createCreditType(creditForm);
      if (success) {
        addNotification({
          title: "Nouveau type de crédit",
          message: `${creditForm.libelle} a été créé`,
          type: "success"
        });
      }
    }
    
    setShowCreditDialog(false);
    setEditingCredit(null);
  };

  const handleDeleteCredit = async (id: string) => {
    const credit = creditTypes.find(c => c.id === id);
    const success = await deleteCreditType(id);
    if (success) {
      toast({
        title: "Type supprimé",
        description: `${credit?.libelle} a été supprimé`,
        variant: "destructive",
      });
    }
  };

  const handleClientToggle = (type: 'salarie' | 'independant' | 'entreprise') => {
    const current = creditForm.client_categories || [];
    if (current.includes(type)) {
      setCreditForm(prev => ({
        ...prev,
        client_categories: current.filter(t => t !== type),
      }));
    } else {
      setCreditForm(prev => ({
        ...prev,
        client_categories: [...current, type],
      }));
    }
  };

  const creditsActifs = creditTypes.filter(c => c.status === 'actif');
  const creditsInactifs = creditTypes.filter(c => c.status === 'suspendu');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Paramètres & Configuration</h1>
          <p className="text-muted-foreground">Gérez les règles de crédit et les paramètres système</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="credits" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="w-4 h-4 mr-2" />
            Types de Crédit
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
          <Card className="glass-card">
            <CardContent className="p-4">
              <Button variant="gold" onClick={() => handleOpenCreditDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un nouveau type de crédit
              </Button>
            </CardContent>
          </Card>

          {/* Crédits Actifs */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-success" />
                Types de Crédit Actifs ({creditsActifs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Libellé</TableHead>
                      <TableHead>Taux</TableHead>
                      <TableHead>Montant Min</TableHead>
                      <TableHead>Montant Max</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Catégories</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditsActifs.map(credit => (
                      <TableRow key={credit.id}>
                        <TableCell className="font-medium">{credit.libelle}</TableCell>
                        <TableCell>{formatPourcentage(credit.taux_interet)}</TableCell>
                        <TableCell className="number-format">{formatXAF(credit.montant_min || 0)}</TableCell>
                        <TableCell className="number-format">{formatXAF(credit.montant_max || 0)}</TableCell>
                        <TableCell>{credit.duree_min} - {credit.duree_max} mois</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {credit.client_categories?.map((cat: string) => (
                              <Badge key={cat} variant="outline" className="text-xs">
                                {cat === 'salarie' && <Users className="w-3 h-3 mr-1" />}
                                {cat === 'independant' && <Briefcase className="w-3 h-3 mr-1" />}
                                {cat === 'entreprise' && <Building2 className="w-3 h-3 mr-1" />}
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenHistoryDialog(credit)}>
                              <History className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenCreditDialog(credit)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenSuspendDialog(credit)}>
                              <PauseCircle className="w-4 h-4 text-warning" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCredit(credit.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {creditsActifs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Aucun type de crédit actif
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Crédits Suspendus */}
          {creditsInactifs.length > 0 && (
            <Card className="glass-card border-warning/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <PauseCircle className="w-5 h-5" />
                  Types de Crédit Suspendus ({creditsInactifs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Libellé</TableHead>
                        <TableHead>Taux</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creditsInactifs.map(credit => (
                        <TableRow key={credit.id} className="opacity-60">
                          <TableCell className="font-medium">{credit.libelle}</TableCell>
                          <TableCell>{formatPourcentage(credit.taux_interet)}</TableCell>
                          <TableCell className="number-format">{formatXAF(credit.montant_min || 0)} - {formatXAF(credit.montant_max || 0)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenHistoryDialog(credit)}>
                                <History className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleOpenSuspendDialog(credit)}>
                                <PlayCircle className="w-4 h-4 text-success" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteCredit(credit.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Paramètres de Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-sm text-muted-foreground">Recevoir une notification</p>
                  </div>
                  <Switch 
                    checked={value} 
                    onCheckedChange={(checked) => setNotifSettings(prev => ({ ...prev, [key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistiques */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{creditTypes.length}</p>
                  <p className="text-muted-foreground">Types de crédit</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-success">{creditsActifs.length}</p>
                  <p className="text-muted-foreground">Actifs</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-warning">{creditsInactifs.length}</p>
                  <p className="text-muted-foreground">Suspendus</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Création/Modification */}
      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCredit ? 'Modifier le type de crédit' : 'Nouveau type de crédit'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Libellé *</Label>
                <Input 
                  value={creditForm.libelle}
                  onChange={e => setCreditForm(prev => ({ ...prev, libelle: e.target.value }))}
                  placeholder="Ex: Crédit Consommation"
                  className="input-dark"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Taux d'intérêt (%)</Label>
                <Input 
                  type="number"
                  value={creditForm.taux_interet}
                  onChange={e => setCreditForm(prev => ({ ...prev, taux_interet: parseFloat(e.target.value) || 0 }))}
                  className="input-dark"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Différé max (mois)</Label>
                <Input 
                  type="number"
                  value={creditForm.differe_max}
                  onChange={e => setCreditForm(prev => ({ ...prev, differe_max: parseInt(e.target.value) || 0 }))}
                  className="input-dark"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Montant minimum (FCFA)</Label>
                <Input 
                  value={formatMontantInput(String(creditForm.montant_min))}
                  onChange={e => setCreditForm(prev => ({ ...prev, montant_min: parseMontant(e.target.value) }))}
                  className="input-dark"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Montant maximum (FCFA)</Label>
                <Input 
                  value={formatMontantInput(String(creditForm.montant_max))}
                  onChange={e => setCreditForm(prev => ({ ...prev, montant_max: parseMontant(e.target.value) }))}
                  className="input-dark"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Durée minimum (mois)</Label>
                <Input 
                  type="number"
                  value={creditForm.duree_min}
                  onChange={e => setCreditForm(prev => ({ ...prev, duree_min: parseInt(e.target.value) || 0 }))}
                  className="input-dark"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Durée maximum (mois)</Label>
                <Input 
                  type="number"
                  value={creditForm.duree_max}
                  onChange={e => setCreditForm(prev => ({ ...prev, duree_max: parseInt(e.target.value) || 0 }))}
                  className="input-dark"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Catégories de clients éligibles</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="salarie"
                    checked={creditForm.client_categories.includes('salarie')}
                    onCheckedChange={() => handleClientToggle('salarie')}
                  />
                  <Label htmlFor="salarie" className="flex items-center gap-1 cursor-pointer">
                    <Users className="w-4 h-4" /> Salariés
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="independant"
                    checked={creditForm.client_categories.includes('independant')}
                    onCheckedChange={() => handleClientToggle('independant')}
                  />
                  <Label htmlFor="independant" className="flex items-center gap-1 cursor-pointer">
                    <Briefcase className="w-4 h-4" /> Indépendants
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="entreprise"
                    checked={creditForm.client_categories.includes('entreprise')}
                    onCheckedChange={() => handleClientToggle('entreprise')}
                  />
                  <Label htmlFor="entreprise" className="flex items-center gap-1 cursor-pointer">
                    <Building2 className="w-4 h-4" /> Entreprises
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreditDialog(false)}>
              Annuler
            </Button>
            <Button variant="gold" onClick={handleSaveCreditType}>
              <Save className="w-4 h-4 mr-2" />
              {editingCredit ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Suspension/Activation */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCredit?.status === 'actif' ? 'Suspendre le type de crédit' : 'Activer le type de crédit'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <p>
              Êtes-vous sûr de vouloir {selectedCredit?.status === 'actif' ? 'suspendre' : 'activer'} <strong>{selectedCredit?.libelle}</strong> ?
            </p>
            
            {selectedCredit?.status === 'actif' && (
              <div className="space-y-2">
                <Label>Motif de suspension *</Label>
                <Textarea 
                  value={suspendMotif}
                  onChange={e => setSuspendMotif(e.target.value)}
                  placeholder="Indiquez le motif de la suspension..."
                  className="input-dark"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant={selectedCredit?.status === 'actif' ? 'destructive' : 'gold'}
              onClick={handleToggleCredit}
            >
              {selectedCredit?.status === 'actif' ? (
                <>
                  <PauseCircle className="w-4 h-4 mr-2" />
                  Suspendre
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Activer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Historique */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historique - {selectedCredit?.libelle}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {history.map((entry, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={entry.action === 'creation' ? 'default' : entry.action === 'modification' ? 'secondary' : 'outline'}>
                        {entry.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    {entry.motif && (
                      <p className="text-sm text-muted-foreground mt-1">{entry.motif}</p>
                    )}
                    {entry.user_name && (
                      <p className="text-xs text-muted-foreground mt-1">Par: {entry.user_name}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucun historique disponible</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
