import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Indicateur {
  nom: string;
  valeur: string;
  seuil?: string;
  statut: 'vert' | 'orange' | 'rouge' | 'conforme' | 'attention' | 'non_conforme';
  poids?: number;
}

interface ConformiteCobac {
  ratio_endettement?: { valeur: number; limite: number; conforme: boolean };
  quotite_cessible?: { valeur: number; limite: number; conforme: boolean };
  garantie_couverture?: { valeur: number; limite: number; conforme: boolean };
}

interface COIIndicatorsProps {
  indicateurs: Indicateur[];
  conformiteCobac?: ConformiteCobac;
}

export default function COIIndicators({ indicateurs, conformiteCobac }: COIIndicatorsProps) {
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'vert':
      case 'conforme': 
        return 'bg-success';
      case 'orange':
      case 'attention': 
        return 'bg-warning';
      case 'rouge':
      case 'non_conforme':
      default: 
        return 'bg-destructive';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'vert':
      case 'conforme':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'orange':
      case 'attention':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'rouge':
      case 'non_conforme':
      default:
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'vert':
      case 'conforme': 
        return 'Conforme';
      case 'orange':
      case 'attention': 
        return 'Attention';
      case 'rouge':
      case 'non_conforme':
      default: 
        return 'Non conforme';
    }
  };

  return (
    <div className="space-y-4">
      {/* Indicateurs critiques */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Indicateurs Critiques (Feux Tricolores)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-left font-semibold">Indicateur</TableHead>
                <TableHead className="text-right font-semibold">Valeur</TableHead>
                <TableHead className="text-right font-semibold">Seuil</TableHead>
                <TableHead className="text-center font-semibold">Statut</TableHead>
                {indicateurs.some(i => i.poids) && (
                  <TableHead className="text-right font-semibold">Poids</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {indicateurs?.map((ind, i) => (
                <TableRow key={i} className={cn("transition-colors", i % 2 === 0 ? 'bg-muted/20' : '')}>
                  <TableCell className="text-left font-medium">{ind.nom}</TableCell>
                  <TableCell className="text-right font-mono">{ind.valeur}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{ind.seuil || '-'}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", getStatusColor(ind.statut))} />
                      <span className="text-xs">{getStatusLabel(ind.statut)}</span>
                    </div>
                  </TableCell>
                  {indicateurs.some(i => i.poids) && (
                    <TableCell className="text-right text-muted-foreground">
                      {ind.poids ? `${ind.poids}%` : '-'}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Conformité COBAC */}
      {conformiteCobac && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Conformité Réglementaire COBAC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {conformiteCobac.ratio_endettement && (
                <div className={cn(
                  "p-4 rounded-lg border",
                  conformiteCobac.ratio_endettement.conforme 
                    ? "border-success/50 bg-success/10" 
                    : "border-destructive/50 bg-destructive/10"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Ratio d'endettement</span>
                    {conformiteCobac.ratio_endettement.conforme 
                      ? <CheckCircle2 className="w-5 h-5 text-success" />
                      : <XCircle className="w-5 h-5 text-destructive" />
                    }
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {conformiteCobac.ratio_endettement.valeur}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Limite: {conformiteCobac.ratio_endettement.limite}%
                      </p>
                    </div>
                    <Badge variant={conformiteCobac.ratio_endettement.conforme ? "default" : "destructive"}>
                      {conformiteCobac.ratio_endettement.conforme ? "Conforme" : "Non conforme"}
                    </Badge>
                  </div>
                </div>
              )}

              {conformiteCobac.quotite_cessible && (
                <div className={cn(
                  "p-4 rounded-lg border",
                  conformiteCobac.quotite_cessible.conforme 
                    ? "border-success/50 bg-success/10" 
                    : "border-destructive/50 bg-destructive/10"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Quotité cessible</span>
                    {conformiteCobac.quotite_cessible.conforme 
                      ? <CheckCircle2 className="w-5 h-5 text-success" />
                      : <XCircle className="w-5 h-5 text-destructive" />
                    }
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {conformiteCobac.quotite_cessible.valeur}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Limite: {conformiteCobac.quotite_cessible.limite}%
                      </p>
                    </div>
                    <Badge variant={conformiteCobac.quotite_cessible.conforme ? "default" : "destructive"}>
                      {conformiteCobac.quotite_cessible.conforme ? "Conforme" : "Non conforme"}
                    </Badge>
                  </div>
                </div>
              )}

              {conformiteCobac.garantie_couverture && (
                <div className={cn(
                  "p-4 rounded-lg border",
                  conformiteCobac.garantie_couverture.conforme 
                    ? "border-success/50 bg-success/10" 
                    : "border-destructive/50 bg-destructive/10"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Couverture garantie</span>
                    {conformiteCobac.garantie_couverture.conforme 
                      ? <CheckCircle2 className="w-5 h-5 text-success" />
                      : <XCircle className="w-5 h-5 text-destructive" />
                    }
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {conformiteCobac.garantie_couverture.valeur}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Minimum: {conformiteCobac.garantie_couverture.limite}%
                      </p>
                    </div>
                    <Badge variant={conformiteCobac.garantie_couverture.conforme ? "default" : "destructive"}>
                      {conformiteCobac.garantie_couverture.conforme ? "Conforme" : "Non conforme"}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
