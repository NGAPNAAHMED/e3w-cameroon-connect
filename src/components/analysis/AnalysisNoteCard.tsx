import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, Eye, TrendingUp, AlertTriangle, CheckCircle2, 
  XCircle, ThumbsUp, ThumbsDown, Send, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatXAF } from '@/lib/formatters';

interface AnalysisData {
  clientName: string;
  clientId: string;
  anciennete: string;
  secteur: string;
  montantDemande: number;
  duree: number;
  objet: string;
  encoursActuel: number;
  statutEncours: string;
  // Points forts
  nbCreditsRembourses: number;
  tauxRegularisation: number;
  fluxDomicilies: number;
  // Points de vigilance
  dsr: number;
  seuilDSR: number;
  echeance: number;
  revenuDisponible: number;
  garantieCouverture: number;
  valeurGarantie: number;
  // Score
  scoreGlobal: number;
  classeRisque: string;
  // Recommandation
  recommandation: 'accord' | 'accord_conditions' | 'ajournement' | 'refus';
  conditions?: string[];
  montantRecommande?: number;
}

interface Props {
  data: AnalysisData;
  onSubmitDecision: (decision: {
    agreedWithAI: boolean;
    comment: string;
    finalStatus: string;
  }) => void;
  onTransmit: () => void;
  showDecisionPanel?: boolean;
}

export function AnalysisNoteCard({ data, onSubmitDecision, onTransmit, showDecisionPanel = true }: Props) {
  const [showDetailedNote, setShowDetailedNote] = useState(false);
  const [agreedWithAI, setAgreedWithAI] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [finalStatus, setFinalStatus] = useState('suivre_ia');

  const getRecommendationStyle = () => {
    switch (data.recommandation) {
      case 'accord':
        return { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success', label: 'ACCORD IMMÉDIAT' };
      case 'accord_conditions':
        return { bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning', label: 'ACCORD SOUS CONDITIONS' };
      case 'ajournement':
        return { bg: 'bg-info/10', border: 'border-info/30', text: 'text-info', label: 'AJOURNEMENT' };
      case 'refus':
        return { bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive', label: 'REFUS' };
      default:
        return { bg: 'bg-muted', border: 'border-border', text: 'text-foreground', label: 'EN ATTENTE' };
    }
  };

  const recStyle = getRecommendationStyle();

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const handleSubmitDecision = () => {
    if (agreedWithAI !== null) {
      onSubmitDecision({
        agreedWithAI,
        comment,
        finalStatus
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Note Synthétique */}
      <div className={cn("p-5 rounded-xl border", recStyle.bg, recStyle.border)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Rapport d'analyse IA</h3>
          </div>
          <Badge className={cn("text-xs", recStyle.text, recStyle.bg, recStyle.border)}>
            {recStyle.label}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Profil & Engagement */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              1. Profil & Engagement
            </h4>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Client :</span> Fidèle depuis {data.anciennete}, secteur {data.secteur}.</p>
              <p><span className="text-muted-foreground">Demande :</span> {formatXAF(data.montantDemande)} sur {data.duree} mois pour {data.objet}.</p>
              <p><span className="text-muted-foreground">Encours actuel :</span> {formatXAF(data.encoursActuel)} ({data.statutEncours}).</p>
            </div>
          </div>

          {/* Points Forts */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-success" />
              2. Points Forts
            </h4>
            <ul className="text-sm space-y-1 pl-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-success rounded-full" />
                <span><strong>Historique :</strong> {data.nbCreditsRembourses} crédits remboursés sans incident ({data.tauxRegularisation}% de régularisation).</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-success rounded-full" />
                <span><strong>Relation :</strong> Flux domiciliés régulièrement ({formatXAF(data.fluxDomicilies)}/mois observés).</span>
              </li>
            </ul>
          </div>

          {/* Points de Vigilance */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-warning" />
              3. Points de Vigilance (Alertes COI)
            </h4>
            <ul className="text-sm space-y-2 pl-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-warning rounded-full mt-2" />
                <span>
                  <strong>DSR (Taux d'endettement) :</strong> {data.dsr}%, au-dessus de la norme interne ({data.seuilDSR}%). 
                  L'échéance de {formatXAF(data.echeance)} est jugée trop lourde face au revenu net disponible ({formatXAF(data.revenuDisponible)}).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-warning rounded-full mt-2" />
                <span>
                  <strong>Garantie :</strong> Couverture de {data.garantieCouverture}% seulement ({formatXAF(data.valeurGarantie)} pour {formatXAF(data.montantDemande)} demandés).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-warning rounded-full mt-2" />
                <span>
                  <strong>Score Global :</strong> <span className={getScoreColor(data.scoreGlobal)}>{data.scoreGlobal}/100</span> (Classe {data.classeRisque}).
                </span>
              </li>
            </ul>
          </div>

          {/* Avis E3W */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
              4. Avis E³W (COI)
            </h4>
            <p className="text-sm font-medium mb-2">
              <span className={recStyle.text}>{recStyle.label}</span>. Le profil moral est excellent, mais la structure financière actuelle ne supporte pas le montant demandé.
            </p>
            {data.conditions && data.conditions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">👉 Recommandation :</p>
                <ul className="text-sm space-y-1">
                  {data.conditions.map((condition, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => setShowDetailedNote(true)}
        >
          <Eye className="w-4 h-4 mr-2" />
          Voir plus (Note détaillée)
        </Button>
      </div>

      {/* Decision Panel */}
      {showDecisionPanel && (
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Décision du gestionnaire</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Vous avez la possibilité de modifier la recommandation de l'IA
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Commentaire / justification</Label>
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="RAS ou justification si forçage..."
                className="input-dark h-24"
              />
            </div>
            <div className="space-y-2">
              <Label>Statut final</Label>
              <Select value={finalStatus} onValueChange={setFinalStatus}>
                <SelectTrigger className="input-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suivre_ia">Suivre l'IA</SelectItem>
                  <SelectItem value="accord">Accord</SelectItem>
                  <SelectItem value="accord_conditions">Accord sous conditions</SelectItem>
                  <SelectItem value="refus">Refus</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2 mt-3">
                <Button
                  variant={agreedWithAI === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAgreedWithAI(true)}
                  className={cn(agreedWithAI === true && "bg-success text-success-foreground")}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  D'accord avec l'IA
                </Button>
                <Button
                  variant={agreedWithAI === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAgreedWithAI(false)}
                  className={cn(agreedWithAI === false && "bg-warning text-warning-foreground")}
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  Avis différent
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter PDF
            </Button>
            <Button 
              onClick={onTransmit} 
              disabled={agreedWithAI === null}
              className="btn-primary"
            >
              <Send className="w-4 h-4 mr-2" />
              Transmettre au N+1
            </Button>
          </div>
        </div>
      )}

      {/* Detailed Note Dialog */}
      <Dialog open={showDetailedNote} onOpenChange={setShowDetailedNote}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              NOTE D'ANALYSE DÉTAILLÉE – MODULE COI
            </DialogTitle>
          </DialogHeader>

          <div className="prose prose-sm prose-invert max-w-none space-y-6">
            <section>
              <h3 className="text-primary border-b border-primary/30 pb-2">I. CONTEXTE ET IDENTIFICATION</h3>
              <p>
                <strong>{data.clientName}</strong>, client de notre institution depuis <strong>{data.anciennete}</strong>, 
                sollicite un concours financier de <strong>{formatXAF(data.montantDemande)}</strong> pour {data.objet} ({data.secteur}). 
                Ce client est un opérateur économique connu de nos services, ayant déjà contracté et remboursé 
                <strong> {data.nbCreditsRembourses} cycles de crédit</strong> avec une gestion globalement satisfaisante de ses engagements.
              </p>
            </section>

            <section>
              <h3 className="text-primary border-b border-primary/30 pb-2">II. ANALYSE DE LA SITUATION FINANCIÈRE</h3>
              <p>
                L'analyse automatisée par le module COI révèle un flux financier observé sur le compte de 
                <strong> {formatXAF(data.fluxDomicilies)}/mois</strong>.
              </p>
              <p>
                Après déduction des charges de vie et d'exploitation, la capacité de remboursement mensuelle 
                résiduelle s'établit à <strong>{formatXAF(data.revenuDisponible)}</strong>.
              </p>
              <p>
                L'octroi du prêt aux conditions demandées générerait une échéance mensuelle de 
                <strong> {formatXAF(data.echeance)}</strong>, portant le Debt Service Ratio (DSR) à 
                <strong className="text-warning"> {data.dsr}%</strong>. Ce niveau d'endettement dépasse les 
                standards de prudence de l'EMF ({data.seuilDSR}%) et expose le client à un risque d'asphyxie 
                financière à court terme.
              </p>
            </section>

            <section>
              <h3 className="text-primary border-b border-primary/30 pb-2">III. COMPORTEMENT ET RISQUES</h3>
              <p>
                Le score d'origination de <strong className={getScoreColor(data.scoreGlobal)}>{data.scoreGlobal}/100</strong> reflète une dualité :
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>Sur le plan comportemental :</strong> Le client est fiable. Bien que des retards 
                  techniques de moins de 15 jours aient été notés par le passé, sa volonté de payer est intacte 
                  (taux de régularisation de {data.tauxRegularisation}%).
                </li>
                <li>
                  <strong>Sur le plan prudentiel :</strong> Le dossier présente une faiblesse au niveau des garanties. 
                  La valeur estimée des sûretés ({formatXAF(data.valeurGarantie)}) ne couvre que 
                  <strong className="text-warning"> {data.garantieCouverture}%</strong> de l'exposition, 
                  ce qui est non conforme à notre politique de risque qui exige une couverture minimale de 100%.
                </li>
              </ol>
            </section>

            <section>
              <h3 className="text-primary border-b border-primary/30 pb-2">IV. CONFORMITÉ RÉGLEMENTAIRE (COBAC)</h3>
              <p>
                Le dossier respecte les limites d'exposition par signature. Cependant, l'analyse COI souligne 
                la nécessité d'une <strong>dérogation</strong> si le montant demandé est maintenu, en raison du 
                dépassement du seuil de capacité de remboursement.
              </p>
            </section>

            <section>
              <h3 className="text-primary border-b border-primary/30 pb-2">V. CONCLUSION ET PRÉCONISATIONS</h3>
              <p>
                Au regard des éléments consolidés par le système E³W, nous recommandons un 
                <strong> ajustement de l'offre commerciale</strong> plutôt qu'un refus sec.
              </p>
              <p>Afin de sécuriser l'institution tout en accompagnant le client, il est proposé :</p>
              <ul className="list-disc pl-6 space-y-1">
                {data.conditions?.map((condition, idx) => (
                  <li key={idx}>{condition}</li>
                ))}
                <li>D'activer le module <strong>Silent Risk Detector</strong> pour suivre l'évolution de ses flux durant les 6 premiers mois.</li>
              </ul>
            </section>

            <div className="border-t border-border pt-4 mt-6">
              <p className="text-sm text-muted-foreground italic">
                <strong>Signature :</strong> Analyste Crédit / Système E³W
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
