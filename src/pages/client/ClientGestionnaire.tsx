import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageSquare, Clock, User } from 'lucide-react';
import { staff } from '@/data/mockData';
import { getInitials } from '@/lib/formatters';

export default function ClientGestionnaire() {
  // Mock: assigned gestionnaire (Ahmed)
  const gestionnaire = staff.find(s => s.email === 'ahmed@e3w.cm');
  const isAssigned = true; // Change to false to see "En attente" state

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display">Mon Gestionnaire</h1>
        <p className="text-muted-foreground">Votre contact dédié pour vos demandes</p>
      </div>

      {isAssigned && gestionnaire ? (
        <Card className="glass-card overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
          <CardContent className="relative -mt-12 text-center">
            <Avatar className="w-24 h-24 mx-auto border-4 border-card">
              <AvatarImage src={gestionnaire.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(gestionnaire.nom, gestionnaire.prenom)}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="mt-4 text-xl font-bold font-display">
              {gestionnaire.prenom} {gestionnaire.nom}
            </h2>
            <Badge variant="outline" className="mt-2">
              Gestionnaire de Compte
            </Badge>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{gestionnaire.telephone}</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{gestionnaire.email}</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button variant="gold" className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                Appeler
              </Button>
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold font-display mb-2">En attente d'attribution</h2>
            <p className="text-muted-foreground mb-4">
              Un gestionnaire vous sera assigné très prochainement.
            </p>
            <div className="flex items-center justify-center gap-2 text-warning">
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Attribution en cours...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <MessageSquare className="w-4 h-4 mr-3" />
            Envoyer un message
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Clock className="w-4 h-4 mr-3" />
            Prendre rendez-vous
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
