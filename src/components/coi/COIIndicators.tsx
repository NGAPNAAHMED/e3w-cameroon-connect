import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Indicateur {
  nom: string;
  valeur: string;
  seuil: string;
  statut: 'vert' | 'orange' | 'rouge';
}

interface COIIndicatorsProps {
  indicateurs: Indicateur[];
}

export default function COIIndicators({ indicateurs }: COIIndicatorsProps) {
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'vert': return 'bg-green-500';
      case 'orange': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Indicateurs Critiques (Feux Tricolores)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-left">Indicateur</TableHead>
              <TableHead className="text-right">Valeur</TableHead>
              <TableHead className="text-right">Seuil</TableHead>
              <TableHead className="text-center">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {indicateurs?.map((ind, i) => (
              <TableRow key={i} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                <TableCell className="text-left font-medium">{ind.nom}</TableCell>
                <TableCell className="text-right">{ind.valeur}</TableCell>
                <TableCell className="text-right text-muted-foreground">{ind.seuil}</TableCell>
                <TableCell className="text-center">
                  <div className={`w-4 h-4 rounded-full mx-auto ${getStatusColor(ind.statut)}`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
