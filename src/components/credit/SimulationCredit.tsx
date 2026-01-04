import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calculator, TrendingUp, Calendar, Percent, CreditCard } from 'lucide-react';
import { formatXAF } from '@/lib/formatters';
import { useCreditTypes } from '@/hooks/useCreditTypes';
import { addMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function SimulationCredit() {
  const { creditTypes, loading } = useCreditTypes();
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [montant, setMontant] = useState('');
  const [dureeUnite, setDureeUnite] = useState<'mois' | 'semaines'>('mois');
  const [dureeValeur, setDureeValeur] = useState('12');
  const [differeValeur, setDiffereValeur] = useState('0');

  const selectedType = creditTypes.find(t => t.id === selectedTypeId);
  const taux = selectedType?.taux_interet || 12;

  const handleMontantChange = (value: string) => {
    const numericValue = value.replace(/\s/g, '').replace(/\D/g, '');
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    setMontant(formatted);
  };

  const handleTypeChange = (typeId: string) => {
    setSelectedTypeId(typeId);
    // Reset values to type defaults
    const type = creditTypes.find(t => t.id === typeId);
    if (type) {
      if (type.duree_min) setDureeValeur(String(type.duree_min));
      if (type.differe_max) setDiffereValeur('0');
    }
  };

  // Convert everything to months for calculation
  const dureeMois = dureeUnite === 'mois' 
    ? parseInt(dureeValeur) || 0 
    : Math.ceil((parseInt(dureeValeur) || 0) / 4);
  
  const differeMois = dureeUnite === 'mois'
    ? parseInt(differeValeur) || 0
    : Math.ceil((parseInt(differeValeur) || 0) / 4);

  const montantNum = parseInt(montant.replace(/\s/g, '')) || 0;

  // Calculate amortization schedule with real dates
  const amortissement = useMemo(() => {
    if (!montantNum || !taux || !dureeMois) return [];

    const tauxMensuel = taux / 100 / 12;
    const dureeEffective = dureeMois - differeMois;
    
    if (dureeEffective <= 0) return [];

    // Capital after différé (interest capitalized)
    const capitalApresiffere = montantNum * Math.pow(1 + tauxMensuel, differeMois);
    
    // Monthly payment calculation
    const mensualite = capitalApresiffere * (tauxMensuel * Math.pow(1 + tauxMensuel, dureeEffective)) / 
                       (Math.pow(1 + tauxMensuel, dureeEffective) - 1);

    const schedule = [];
    let capitalRestant = capitalApresiffere;
    const startDate = new Date();

    // Différé period
    for (let i = 1; i <= differeMois; i++) {
      const interet = montantNum * tauxMensuel * Math.pow(1 + tauxMensuel, i - 1);
      const dateEcheance = addMonths(startDate, i);
      
      schedule.push({
        periode: i,
        dateEcheance: format(dateEcheance, 'MMMM yyyy', { locale: fr }),
        mensualite: 0,
        capital: 0,
        interet: Math.round(interet),
        capitalRestant: Math.round(montantNum * Math.pow(1 + tauxMensuel, i)),
        type: 'differe' as const
      });
    }

    // Amortization period
    for (let i = 1; i <= dureeEffective; i++) {
      const interet = capitalRestant * tauxMensuel;
      const capital = mensualite - interet;
      capitalRestant = capitalRestant - capital;
      const dateEcheance = addMonths(startDate, differeMois + i);

      schedule.push({
        periode: differeMois + i,
        dateEcheance: format(dateEcheance, 'MMMM yyyy', { locale: fr }),
        mensualite: Math.round(mensualite),
        capital: Math.round(capital),
        interet: Math.round(interet),
        capitalRestant: Math.max(0, Math.round(capitalRestant)),
        type: 'amortissement' as const
      });
    }

    return schedule;
  }, [montantNum, taux, dureeMois, differeMois]);

  const mensualite = amortissement.find(a => a.type === 'amortissement')?.mensualite || 0;
  const totalInterets = amortissement.reduce((sum, a) => sum + a.interet, 0);
  const coutTotal = montantNum + totalInterets;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display">Simulation de Crédit</h1>
        <p className="text-muted-foreground">Calculez votre tableau d'amortissement prévisionnel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Paramètres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type de crédit */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Type de crédit
              </Label>
              <Select value={selectedTypeId} onValueChange={handleTypeChange}>
                <SelectTrigger className="input-dark">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {creditTypes.filter(t => t.status === 'actif').map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.libelle} ({type.taux_interet}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Taux d'intérêt */}
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taux d'intérêt appliqué</span>
                <Badge className="bg-primary text-primary-foreground text-lg px-3">
                  {taux}%
                </Badge>
              </div>
              {selectedType && (
                <p className="text-xs text-muted-foreground mt-1">
                  Montant: {formatXAF(selectedType.montant_min || 0)} - {formatXAF(selectedType.montant_max || 0)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Montant (FCFA)</Label>
              <Input
                value={montant}
                onChange={(e) => handleMontantChange(e.target.value)}
                className="input-dark text-lg font-semibold"
                placeholder="5 000 000"
              />
              {selectedType && montantNum > 0 && (
                <Progress 
                  value={Math.min(100, (montantNum / (selectedType.montant_max || montantNum)) * 100)} 
                  className="h-1" 
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Durée</Label>
              <div className="flex gap-2">
                <Select value={dureeUnite} onValueChange={(v) => setDureeUnite(v as any)}>
                  <SelectTrigger className="input-dark w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mois">Mois</SelectItem>
                    <SelectItem value="semaines">Semaines</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={dureeValeur}
                  onChange={(e) => setDureeValeur(e.target.value)}
                  className="input-dark"
                  placeholder="12"
                  max={selectedType?.duree_max || 60}
                  min={selectedType?.duree_min || 1}
                />
              </div>
              {selectedType && (
                <p className="text-xs text-muted-foreground">
                  Durée: {selectedType.duree_min} - {selectedType.duree_max} mois
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Différé ({dureeUnite})</Label>
              <Input
                type="number"
                value={differeValeur}
                onChange={(e) => setDiffereValeur(e.target.value)}
                className="input-dark"
                placeholder="0"
                max={selectedType?.differe_max || 6}
              />
              {selectedType && (
                <p className="text-xs text-muted-foreground">
                  Max: {selectedType.differe_max || 0} mois
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Mensualité</p>
                <p className="text-lg font-bold text-primary number-format">
                  {mensualite ? formatXAF(mensualite) : '-'}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Percent className="w-6 h-6 mx-auto mb-2 text-warning" />
                <p className="text-xs text-muted-foreground">Total Intérêts</p>
                <p className="text-lg font-bold text-warning number-format">
                  {totalInterets ? formatXAF(totalInterets) : '-'}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Calculator className="w-6 h-6 mx-auto mb-2 text-info" />
                <p className="text-xs text-muted-foreground">Coût Total</p>
                <p className="text-lg font-bold text-info number-format">
                  {coutTotal ? formatXAF(coutTotal) : '-'}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-success" />
                <p className="text-xs text-muted-foreground">Durée</p>
                <p className="text-lg font-bold text-success">
                  {dureeMois} mois
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Amortization Table */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tableau d'Amortissement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-80 scrollable-content">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">N°</th>
                      <th className="p-2 text-left">Échéance</th>
                      <th className="p-2 text-right">Mensualité</th>
                      <th className="p-2 text-right">Capital</th>
                      <th className="p-2 text-right">Intérêts</th>
                      <th className="p-2 text-right">Capital Restant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {amortissement.map((row) => (
                      <tr key={row.periode} className={row.type === 'differe' ? 'bg-warning/10' : ''}>
                        <td className="p-2">
                          {row.periode}
                          {row.type === 'differe' && (
                            <Badge variant="outline" className="ml-2 text-xs text-warning">Différé</Badge>
                          )}
                        </td>
                        <td className="p-2 capitalize font-medium">{row.dateEcheance}</td>
                        <td className="p-2 text-right number-format">{formatXAF(row.mensualite)}</td>
                        <td className="p-2 text-right number-format">{formatXAF(row.capital)}</td>
                        <td className="p-2 text-right number-format text-warning">{formatXAF(row.interet)}</td>
                        <td className="p-2 text-right number-format">{formatXAF(row.capitalRestant)}</td>
                      </tr>
                    ))}
                    {amortissement.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          Sélectionnez un type de crédit et entrez les paramètres
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
