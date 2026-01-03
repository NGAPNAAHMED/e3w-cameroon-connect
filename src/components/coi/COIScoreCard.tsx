import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle, AlertTriangle, XCircle, AlertCircle, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface COIScoreCardProps {
  score: number;
  classeRisque: string;
  recommendation?: string;
  decision?: 'favorable' | 'defavorable' | 'reserve';
}

export default function COIScoreCard({ score, classeRisque, recommendation, decision }: COIScoreCardProps) {
  const getScoreColor = () => {
    if (score >= 70) return 'text-success';
    if (score >= 50) return 'text-warning';
    if (score >= 30) return 'text-orange-500';
    return 'text-destructive';
  };

  const getScoreBgGradient = () => {
    if (score >= 70) return 'from-success/20 to-success/5';
    if (score >= 50) return 'from-warning/20 to-warning/5';
    if (score >= 30) return 'from-orange-500/20 to-orange-500/5';
    return 'from-destructive/20 to-destructive/5';
  };

  const getRecommendationIcon = () => {
    const rec = decision || recommendation;
    switch (rec) {
      case 'favorable':
      case 'ACCORD': 
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'reserve':
      case 'ACCORD_SOUS_CONDITIONS': 
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'AJOURNEMENT': 
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'defavorable':
      default: 
        return <XCircle className="w-5 h-5 text-destructive" />;
    }
  };

  const getClasseBadgeColor = () => {
    switch (classeRisque) {
      case 'A': return 'bg-success text-success-foreground';
      case 'B': return 'bg-warning text-warning-foreground';
      case 'C': return 'bg-orange-500 text-white';
      default: return 'bg-destructive text-destructive-foreground';
    }
  };

  const getDecisionLabel = () => {
    const rec = decision || recommendation;
    switch (rec) {
      case 'favorable': return 'FAVORABLE';
      case 'ACCORD': return 'ACCORD';
      case 'reserve': return 'RÉSERVÉ';
      case 'ACCORD_SOUS_CONDITIONS': return 'ACCORD SOUS CONDITIONS';
      case 'AJOURNEMENT': return 'AJOURNEMENT';
      case 'defavorable': return 'DÉFAVORABLE';
      default: return rec?.replace(/_/g, ' ') || 'N/A';
    }
  };

  const getDecisionColor = () => {
    const rec = decision || recommendation;
    switch (rec) {
      case 'favorable':
      case 'ACCORD': 
        return 'text-success';
      case 'reserve':
      case 'ACCORD_SOUS_CONDITIONS': 
        return 'text-warning';
      case 'AJOURNEMENT': 
        return 'text-orange-500';
      case 'defavorable':
      default: 
        return 'text-destructive';
    }
  };

  // Calculate circle progress
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className={cn("overflow-hidden", `bg-gradient-to-br ${getScoreBgGradient()}`)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/30"
              />
              <circle
                cx="56"
                cy="56"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className={getScoreColor()}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: 'stroke-dashoffset 1s ease-in-out'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-3xl font-bold", getScoreColor())}>{score}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Score COI Global</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className={cn("text-sm px-3 py-1", getClasseBadgeColor())}>
                Classe {classeRisque}
              </Badge>
              <div className="flex items-center gap-2">
                {getRecommendationIcon()}
                <span className={cn("text-sm font-semibold", getDecisionColor())}>
                  {getDecisionLabel()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Score calculé par IA</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Conforme COBAC</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
