import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

interface COIScoreCardProps {
  score: number;
  classeRisque: string;
  recommendation: string;
}

export default function COIScoreCard({ score, classeRisque, recommendation }: COIScoreCardProps) {
  const getScoreColor = () => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    if (score >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRecommendationIcon = () => {
    switch (recommendation) {
      case 'ACCORD': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ACCORD_SOUS_CONDITIONS': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'AJOURNEMENT': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getClasseBadgeColor = () => {
    switch (classeRisque) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-yellow-500';
      case 'C': return 'bg-orange-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Target className="w-6 h-6 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Score COI Global</span>
        </div>
        <div className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>
          {score}
          <span className="text-lg text-muted-foreground">/100</span>
        </div>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Badge className={getClasseBadgeColor()}>Classe {classeRisque}</Badge>
          <div className="flex items-center gap-1">
            {getRecommendationIcon()}
            <span className="text-sm font-medium">{recommendation?.replace('_', ' ')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
