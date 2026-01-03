import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, FileText, CheckCircle2, AlertCircle, XCircle, 
  TrendingUp, Shield, Star, AlertTriangle, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';

interface Recommandation {
  decision: 'favorable' | 'defavorable' | 'reserve';
  conditions?: string[];
  points_forts?: string[];
  points_vigilance?: string[];
  note_synthetique?: string;
}

interface COIAnalysisNoteProps {
  dossier?: any;
  client?: any;
  analysis?: any;
  recommandation?: Recommandation;
}

export default function COIAnalysisNote({ dossier, client, analysis, recommandation }: COIAnalysisNoteProps) {
  // Use recommandation directly or from analysis
  const rec = recommandation || analysis?.recommandation;

  const getDecisionIcon = () => {
    switch (rec?.decision) {
      case 'favorable': return <CheckCircle2 className="w-6 h-6 text-success" />;
      case 'reserve': return <AlertCircle className="w-6 h-6 text-warning" />;
      case 'defavorable': return <XCircle className="w-6 h-6 text-destructive" />;
      default: return <Target className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getDecisionColor = () => {
    switch (rec?.decision) {
      case 'favorable': return 'text-success bg-success/10 border-success/30';
      case 'reserve': return 'text-warning bg-warning/10 border-warning/30';
      case 'defavorable': return 'text-destructive bg-destructive/10 border-destructive/30';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getDecisionLabel = () => {
    switch (rec?.decision) {
      case 'favorable': return 'AVIS FAVORABLE';
      case 'reserve': return 'AVIS RÉSERVÉ';
      case 'defavorable': return 'AVIS DÉFAVORABLE';
      default: return 'EN ATTENTE';
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTE D\'ANALYSE DE CRÉDIT', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Module : Credit Origination Intelligence (COI) – E³W', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Date
    doc.setFontSize(9);
    doc.text(`Date d'émission: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPos);
    yPos += 15;

    // Decision Box
    doc.setFillColor(rec?.decision === 'favorable' ? 220 : rec?.decision === 'reserve' ? 255 : 255, 
                     rec?.decision === 'favorable' ? 252 : rec?.decision === 'reserve' ? 243 : 220,
                     rec?.decision === 'favorable' ? 231 : rec?.decision === 'reserve' ? 205 : 220);
    doc.rect(20, yPos - 5, pageWidth - 40, 20, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`RECOMMANDATION: ${getDecisionLabel()}`, pageWidth / 2, yPos + 8, { align: 'center' });
    yPos += 25;

    // Client info if available
    if (client || dossier) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. IDENTIFICATION DU CLIENT', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (client?.nom) doc.text(`Nom: ${client.nom} ${client.prenom || ''}`, 25, yPos);
      else if (dossier?.client_id) doc.text(`Identifiant: ${dossier.client_id}`, 25, yPos);
      yPos += 15;
    }

    // Synthesis
    if (rec?.note_synthetique) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('2. SYNTHÈSE DE L\'ANALYSE', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(rec.note_synthetique, pageWidth - 50);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 5 + 10;
    }

    // Points forts
    if (rec?.points_forts && rec.points_forts.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('3. POINTS FORTS', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      rec.points_forts.forEach((point: string) => {
        doc.text(`• ${point}`, 25, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    // Points de vigilance
    if (rec?.points_vigilance && rec.points_vigilance.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('4. POINTS DE VIGILANCE', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      rec.points_vigilance.forEach((point: string) => {
        doc.text(`• ${point}`, 25, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    // Conditions
    if (rec?.conditions && rec.conditions.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('5. CONDITIONS D\'OCTROI', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      rec.conditions.forEach((cond: string) => {
        doc.text(`• ${cond}`, 25, yPos);
        yPos += 6;
      });
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Document généré par E³W - Credit Origination Intelligence', pageWidth / 2, footerY, { align: 'center' });
    doc.text('Conforme aux exigences COBAC', pageWidth / 2, footerY + 5, { align: 'center' });

    doc.save(`note_analyse_coi_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (!rec) {
    return (
      <Card className="glass-card">
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune analyse disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Note d'Analyse COI
        </CardTitle>
        <Button variant="outline" size="sm" onClick={generatePDF}>
          <Download className="w-4 h-4 mr-2" />
          Télécharger PDF
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Decision Banner */}
        <div className={cn("p-4 rounded-lg border-2 flex items-center gap-4", getDecisionColor())}>
          {getDecisionIcon()}
          <div>
            <p className="font-bold text-lg">{getDecisionLabel()}</p>
            <p className="text-sm opacity-80">Recommandation du système COI</p>
          </div>
        </div>

        {/* Synthesis */}
        {rec.note_synthetique && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Synthèse de l'analyse
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed p-4 bg-muted/30 rounded-lg">
              {rec.note_synthetique}
            </p>
          </div>
        )}

        <Separator />

        {/* Points forts & vigilance */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Points forts */}
          {rec.points_forts && rec.points_forts.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-success">
                <Star className="w-4 h-4" />
                Points Forts
              </h4>
              <ul className="space-y-2">
                {rec.points_forts.map((point: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Points de vigilance */}
          {rec.points_vigilance && rec.points_vigilance.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-warning">
                <AlertTriangle className="w-4 h-4" />
                Points de Vigilance
              </h4>
              <ul className="space-y-2">
                {rec.points_vigilance.map((point: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Conditions */}
        {rec.conditions && rec.conditions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Conditions d'Octroi Suggérées
              </h4>
              <div className="flex flex-wrap gap-2">
                {rec.conditions.map((cond: string, i: number) => (
                  <Badge key={i} variant="outline" className="px-3 py-1">
                    {cond}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Compliance footer */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Conforme aux exigences COBAC</span>
            </div>
            <span>Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
