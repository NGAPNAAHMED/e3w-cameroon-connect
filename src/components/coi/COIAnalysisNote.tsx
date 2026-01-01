import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Shield } from 'lucide-react';
import { formatMontant } from '@/lib/formatters';
import jsPDF from 'jspdf';

interface COIAnalysisNoteProps {
  dossier: any;
  client: any;
  analysis: any;
}

export default function COIAnalysisNote({ dossier, client, analysis }: COIAnalysisNoteProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    
    doc.setFontSize(16);
    doc.text('NOTE D\'ANALYSE DE CRÉDIT', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Module COI - EPSILON EARLY WARNING ENGINE', 105, 28, { align: 'center' });
    doc.text(`Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`, 105, 35, { align: 'center' });
    
    let y = 50;
    doc.setFontSize(12);
    doc.text('1. IDENTIFICATION CLIENT', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Nom: ${client?.type === 'entreprise' ? client.raisonSociale : `${client?.prenom} ${client?.nom}`}`, 14, y);
    y += 6;
    doc.text(`Type: ${client?.type}`, 14, y);
    
    y += 15;
    doc.setFontSize(12);
    doc.text('2. CRÉDIT DEMANDÉ', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Montant: ${formatMontant(dossier.montant)} FCFA`, 14, y);
    y += 6;
    doc.text(`Durée: ${dossier.duree} mois`, 14, y);
    
    y += 15;
    doc.setFontSize(12);
    doc.text('3. DÉCISION COI', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Score Global: ${analysis.scoreGlobal}/100`, 14, y);
    y += 6;
    doc.text(`Classe de Risque: ${analysis.classeRisque}`, 14, y);
    y += 6;
    doc.text(`Recommandation: ${analysis.recommendation}`, 14, y);
    
    doc.save(`note_coi_${dossier.id}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={generatePDF}>
          <FileDown className="w-4 h-4 mr-2" />
          Télécharger PDF
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-center">
            NOTE D'ANALYSE DE CRÉDIT
            <p className="text-sm font-normal text-muted-foreground mt-1">
              Module COI - EPSILON EARLY WARNING ENGINE
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <section>
            <h3 className="font-semibold border-b pb-2 mb-3">1. OBJET DE LA NOTE</h3>
            <p className="text-sm text-muted-foreground">
              Analyse du dossier de demande de crédit sur la base des indicateurs financiers, 
              comportementaux et réglementaires consolidés par le module COI.
            </p>
          </section>

          <section>
            <h3 className="font-semibold border-b pb-2 mb-3">2. IDENTIFICATION CLIENT</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Nom:</span> {client?.type === 'entreprise' ? client.raisonSociale : `${client?.prenom} ${client?.nom}`}</div>
              <div><span className="text-muted-foreground">Type:</span> {client?.type}</div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold border-b pb-2 mb-3">3. CRÉDIT DEMANDÉ</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Montant:</span> {formatMontant(dossier.montant)} FCFA</div>
              <div><span className="text-muted-foreground">Durée:</span> {dossier.duree} mois</div>
              <div><span className="text-muted-foreground">Type:</span> {dossier.typeCredit}</div>
              <div><span className="text-muted-foreground">Mensualité:</span> {formatMontant(dossier.mensualite)} FCFA</div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold border-b pb-2 mb-3">4. RÉSULTATS DU SCORING COI</h3>
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">{analysis.scoreGlobal}/100</div>
              <div className="text-sm text-muted-foreground">Classe {analysis.classeRisque} - {analysis.recommendation?.replace('_', ' ')}</div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold border-b pb-2 mb-3">5. ANALYSE DÉTAILLÉE</h3>
            <p className="text-sm text-muted-foreground">{analysis.analyseDetaille}</p>
          </section>

          <section className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
            <div className="text-sm">
              <span className="font-medium">Conformité COBAC:</span>{' '}
              {analysis.conformiteCOBAC?.commentaires || 'Conforme'}
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
