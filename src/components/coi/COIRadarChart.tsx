import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface COIRadarChartProps {
  scores: {
    capaciteFinanciere?: number;
    disciplineHistorique?: number;
    endettement?: number;
    garanties?: number;
    contexteActivite?: number;
    stabilite?: number;
  };
}

export default function COIRadarChart({ scores }: COIRadarChartProps) {
  const data = [
    { subject: 'Capacité financière', value: scores.capaciteFinanciere || 0, fullMark: 100 },
    { subject: 'Discipline', value: scores.disciplineHistorique || 0, fullMark: 100 },
    { subject: 'Endettement', value: scores.endettement || 0, fullMark: 100 },
    { subject: 'Garanties', value: scores.garanties || 0, fullMark: 100 },
    { subject: 'Contexte', value: scores.contexteActivite || 0, fullMark: 100 },
    { subject: 'Stabilité', value: scores.stabilite || 0, fullMark: 100 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Radar des Scores COI</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar
              name="Score"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.4}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
