import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Settings,
  CreditCard,
  Percent,
  Save,
  Plus,
  Trash2,
  TrendingUp,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import { typesCredit } from '@/data/mockData';
import { formatPourcentage } from '@/lib/formatters';

export default function AdminParametres() {
  const [credits, setCredits] = useState(typesCredit.map(c => ({
    ...c,
    actif: true,
    plafond: 50000000,
  })));

  const handleToggle = (id: string) => {
    setCredits(prev => prev.map(c => 
      c.id === id ? { ...c, actif: !c.actif } : c
    ));
    toast({
      title: "Paramètre modifié",
      description: "Le type de crédit a été mis à jour",
    });
  };

  const handleSave = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Les modifications ont été enregistrées",
    });
  };

  // Mock stats
  const stats = [
    { type: 'Crédit Consommation', count: 145, montant: 725000000 },
    { type: 'Crédit Scolaire', count: 89, montant: 267000000 },
    { type: 'Crédit Immobilier', count: 34, montant: 510000000 },
    { type: 'Crédit Auto', count: 56, montant: 336000000 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Paramètres & Règles</h1>
          <p className="text-muted-foreground">Configuration des types de crédit et plafonds</p>
        </div>
        <Button variant="gold" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Types de Crédit */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Types de Crédit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {credits.map(credit => (
              <div 
                key={credit.id} 
                className={`p-4 rounded-lg border transition-all ${
                  credit.actif ? 'bg-muted/30 border-border' : 'bg-muted/10 border-border/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {credit.actif ? (
                      <PlayCircle className="w-5 h-5 text-success" />
                    ) : (
                      <PauseCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">{credit.label}</span>
                  </div>
                  <Switch
                    checked={credit.actif}
                    onCheckedChange={() => handleToggle(credit.id)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Taux d'intérêt</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.5"
                        value={credit.taux}
                        className="input-dark h-8"
                        disabled={!credit.actif}
                      />
                      <Percent className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Plafond (FCFA)</Label>
                    <Input
                      type="text"
                      value="50 000 000"
                      className="input-dark h-8"
                      disabled={!credit.actif}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un type de crédit
            </Button>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Statistiques des Crédits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{stat.type}</span>
                  <Badge variant="outline">{stat.count} octroyés</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Volume total</span>
                  <span className="font-semibold text-primary number-format">
                    {new Intl.NumberFormat('fr-FR').format(stat.montant)} FCFA
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Règles Globales */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Règles Globales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Taux d'endettement max (%)</Label>
              <Input
                type="number"
                defaultValue="33"
                className="input-dark"
              />
            </div>
            <div className="space-y-2">
              <Label>Ancienneté min. emploi (mois)</Label>
              <Input
                type="number"
                defaultValue="6"
                className="input-dark"
              />
            </div>
            <div className="space-y-2">
              <Label>Ancienneté min. banque (mois)</Label>
              <Input
                type="number"
                defaultValue="3"
                className="input-dark"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
