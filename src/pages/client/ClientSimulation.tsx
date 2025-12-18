import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingUp, Calendar, Percent } from 'lucide-react';
import { formatXAF } from '@/lib/formatters';
import { typesCredit } from '@/data/mockData';

export default function ClientSimulation() {
  const [montant, setMontant] = useState('');
  const [taux, setTaux] = useState('12');
  const [dureeUnite, setDureeUnite] = useState<'mois' | 'semaines'>('mois');
  const [dureeValeur, setDureeValeur] = useState('24');
  const [differeUnite, setDiffereUnite] = useState<'mois' | 'semaines'>('mois');
  const [differeValeur, setDiffereValeur] = useState('0');

  const handleMontantChange = (value: string) => {
    const numericValue = value.replace(/\s/g, '').replace(/\D/g, '');
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    setMontant(formatted);
  };

  // Convert everything to months for calculation
  const dureeMois = dureeUnite === 'mois' 
    ? parseInt(dureeValeur) || 0 
    : Math.ceil((parseInt(dureeValeur) || 0) / 4);
  
  const differeMois = differeUnite === 'mois'
    ? parseInt(differeValeur) || 0
    : Math.ceil((parseInt(differeValeur) || 0) / 4);

  const montantNum = parseInt(montant.replace(/\s/g, '')) || 0;
  const tauxNum = parseFloat(taux) || 0;

  // Calculate amortization schedule
  const amortissement = useMemo(() => {
    if (!montantNum || !tauxNum || !dureeMois) return [];

    const tauxMensuel = tauxNum / 100 / 12;
    const dureeEffective = dureeMois - differeMois;
    
    if (dureeEffective <= 0) return [];

    // Capital after différé (interest capitalized)
    const capitalApresiffere = montantNum * Math.pow(1 + tauxMensuel, differeMois);
    
    // Monthly payment calculation
    const mensualite = capitalApresiffere * (tauxMensuel * Math.pow(1 + tauxMensuel, dureeEffective)) / 
                       (Math.pow(1 + tauxMensuel, dureeEffective) - 1);

    const schedule = [];
    let capitalRestant = capitalApresiffere;

    // Différé period
    for (let i = 1; i <= differeMois; i++) {
      const interet = montantNum * tauxMensuel * Math.pow(1 + tauxMensuel, i - 1);
      schedule.push({
        periode: i,
        mensualite: 0,
        capital: 0,
        interet: Math.round(interet),
        capitalRestant: Math.round(montantNum * Math.pow(1 + tauxMensuel, i)),
        type: 'differe'
      });
    }

    // Amortization period
    for (let i = 1; i <= dureeEffective; i++) {
      const interet = capitalRestant * tauxMensuel;
      const capital = mensualite - interet;
      capitalRestant = capitalRestant - capital;

      schedule.push({
        periode: differeMois + i,
        mensualite: Math.round(mensualite),
        capital: Math.round(capital),
        interet: Math.round(interet),
        capitalRestant: Math.max(0, Math.round(capitalRestant)),
        type: 'amortissement'
      });
    }

    return schedule;
  }, [montantNum, tauxNum, dureeMois, differeMois]);

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
            <div className="space-y-2">
              <Label>Montant (FCFA)</Label>
              <Input
                value={montant}
                onChange={(e) => handleMontantChange(e.target.value)}
                className="input-dark text-lg font-semibold"
                placeholder="5 000 000"
              />
            </div>

            <div className="space-y-2">
              <Label>Taux d'intérêt (%)</Label>
              <Input
                type="number"
                step="0.5"
                value={taux}
                onChange={(e) => setTaux(e.target.value)}
                className="input-dark"
              />
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
                  placeholder="24"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Différé</Label>
              <div className="flex gap-2">
                <Select value={differeUnite} onValueChange={(v) => setDiffereUnite(v as any)}>
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
                  value={differeValeur}
                  onChange={(e) => setDiffereValeur(e.target.value)}
                  className="input-dark"
                  placeholder="0"
                />
              </div>
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
            <CardHeader>
              <CardTitle>Tableau d'Amortissement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Période</th>
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
                            <span className="ml-2 text-xs text-warning">(Différé)</span>
                          )}
                        </td>
                        <td className="p-2 text-right number-format">{formatXAF(row.mensualite)}</td>
                        <td className="p-2 text-right number-format">{formatXAF(row.capital)}</td>
                        <td className="p-2 text-right number-format text-warning">{formatXAF(row.interet)}</td>
                        <td className="p-2 text-right number-format">{formatXAF(row.capitalRestant)}</td>
                      </tr>
                    ))}
                    {amortissement.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          Entrez les paramètres pour voir le tableau
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
