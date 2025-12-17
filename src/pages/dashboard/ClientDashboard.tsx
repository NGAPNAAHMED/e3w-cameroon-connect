import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { staff } from '@/data/mockData';
import { getInitials } from '@/lib/formatters';

export default function ClientDashboard() {
  // Mock assigned gestionnaire
  const gestionnaire = staff.find(s => s.email === 'ahmed@e3w.cm');
  const kycProgress = 65;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Welcome Card */}
      <Card className="glass-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
        <CardContent className="relative p-6">
          <h1 className="text-2xl font-bold font-display mb-2">Bienvenue, Jean-Paul</h1>
          <p className="text-muted-foreground">
            Complétez votre fiche KYC pour accéder aux services de crédit.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KYC Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Ma Fiche KYC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progression</span>
                <span className="text-sm font-medium">{kycProgress}%</span>
              </div>
              <Progress value={kycProgress} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="text-sm">Identité</span>
                <Badge className="ml-auto bg-success/20 text-success">Complété</Badge>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="text-sm">État Civil</span>
                <Badge className="ml-auto bg-success/20 text-success">Complété</Badge>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-warning" />
                <span className="text-sm">Emploi / Revenus</span>
                <Badge className="ml-auto bg-warning/20 text-warning">En cours</Badge>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Adresse</span>
                <Badge className="ml-auto bg-muted text-muted-foreground">À remplir</Badge>
              </div>
            </div>

            <Button variant="gold" className="w-full">
              Continuer ma fiche KYC
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Mon Gestionnaire */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Mon Gestionnaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gestionnaire ? (
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto border-2 border-primary/30">
                  <AvatarImage src={gestionnaire.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">
                    {getInitials(gestionnaire.nom, gestionnaire.prenom)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-4 font-semibold text-lg">
                  {gestionnaire.prenom} {gestionnaire.nom}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Gestionnaire de Compte</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {gestionnaire.telephone}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {gestionnaire.email}
                  </div>
                </div>

                <Button variant="outline" className="mt-4">
                  Contacter
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  En attente d'attribution
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Un gestionnaire vous sera assigné prochainement
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
