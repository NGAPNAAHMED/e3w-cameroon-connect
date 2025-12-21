import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  Phone,
  Mail,
  MessageSquare,
  Send,
  CreditCard,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { staff } from '@/data/mockData';

// Messages prédéfinis pour les clients
const messagesPredefinis = {
  demande_pret: [
    { sujet: "Demande de crédit consommation", contenu: "Je souhaite obtenir un crédit consommation pour financer un projet personnel.", reponseAuto: "Votre demande a été enregistrée. Un gestionnaire vous contactera sous 24h pour étudier votre dossier." },
    { sujet: "Demande de crédit scolaire", contenu: "Je souhaite financer la scolarité de mes enfants pour la rentrée.", reponseAuto: "Votre demande de crédit scolaire a été reçue. Préparez vos bulletins de salaire et justificatifs de scolarité." },
    { sujet: "Demande de crédit immobilier", contenu: "Je souhaite acquérir un bien immobilier et demande un financement.", reponseAuto: "Pour le crédit immobilier, veuillez préparer le titre foncier et l'évaluation du bien. RDV à prendre." },
  ],
  probleme: [
    { sujet: "Problème de prélèvement", contenu: "Mon prélèvement automatique n'a pas fonctionné ce mois-ci.", reponseAuto: "Nous avons bien reçu votre signalement. Un conseiller analysera votre compte sous 48h." },
    { sujet: "Contestation de frais", contenu: "Je conteste des frais prélevés sur mon compte.", reponseAuto: "Votre réclamation est en cours d'examen. Réponse sous 5 jours ouvrés." },
    { sujet: "Difficulté de remboursement", contenu: "Je rencontre des difficultés pour rembourser mon crédit en cours.", reponseAuto: "Un conseiller vous contactera pour étudier un réaménagement de votre échéancier." },
  ],
  rdv: [
    { sujet: "Demande de rendez-vous", contenu: "Je souhaite prendre rendez-vous avec mon gestionnaire.", reponseAuto: "Votre demande de RDV a été transmise. Vous serez recontacté pour confirmation du créneau." },
    { sujet: "Modifier un rendez-vous", contenu: "Je souhaite modifier la date de mon prochain rendez-vous.", reponseAuto: "Votre demande de modification a été enregistrée. Confirmation sous 24h." },
  ],
};
import { getInitials } from '@/lib/formatters';

interface MessagePredefini {
  sujet: string;
  contenu: string;
  reponseAuto: string;
}

export default function ClientContact() {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('message');
  const [selectedCategory, setSelectedCategory] = useState<'demande_pret' | 'probleme' | 'rdv' | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessagePredefini | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [sentMessages, setSentMessages] = useState<Array<{id: string, sujet: string, date: Date, reponse?: string}>>([]);

  // Mock assigned gestionnaire
  const gestionnaire = staff.find(s => s.email === 'ahmed@e3w.cm');

  const handleSendMessage = () => {
    if (!selectedMessage && !customMessage) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner ou rédiger un message",
        variant: "destructive",
      });
      return;
    }

    const newMessage = {
      id: `msg_${Date.now()}`,
      sujet: selectedMessage?.sujet || 'Message personnalisé',
      date: new Date(),
      reponse: selectedMessage?.reponseAuto,
    };

    setSentMessages(prev => [newMessage, ...prev]);
    
    toast({
      title: "Message envoyé",
      description: selectedMessage?.reponseAuto || "Votre message a été transmis au gestionnaire",
    });

    addNotification({
      title: 'Message envoyé',
      message: `Votre message "${newMessage.sujet}" a été envoyé`,
      type: 'success',
    });

    setSelectedCategory(null);
    setSelectedMessage(null);
    setCustomMessage('');
  };

  const handleCall = () => {
    toast({
      title: "Appel en cours",
      description: `Connexion avec ${gestionnaire?.prenom} ${gestionnaire?.nom}...`,
    });
  };

  const handleEmail = () => {
    window.location.href = `mailto:${gestionnaire?.email}?subject=Contact client E³W`;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display">Contacter Mon Gestionnaire</h1>
        <p className="text-muted-foreground">Communiquez avec votre gestionnaire de compte</p>
      </div>

      {/* Gestionnaire Info Card */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border-2 border-primary/30">
              <AvatarImage src={gestionnaire?.avatar} />
              <AvatarFallback className="bg-primary/20 text-primary text-xl">
                {gestionnaire ? getInitials(gestionnaire.nom, gestionnaire.prenom) : 'G'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{gestionnaire?.prenom} {gestionnaire?.nom}</h3>
              <p className="text-muted-foreground">Gestionnaire de Compte</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {gestionnaire?.telephone}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {gestionnaire?.email}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCall}>
                <Phone className="w-4 h-4 mr-2" />
                Appeler
              </Button>
              <Button variant="outline" onClick={handleEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="message" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="w-4 h-4 mr-2" />
            Envoyer un Message
          </TabsTrigger>
          <TabsTrigger value="historique" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="w-4 h-4 mr-2" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Phone className="w-4 h-4 mr-2" />
            Contact Direct
          </TabsTrigger>
        </TabsList>

        {/* Message Tab */}
        <TabsContent value="message" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Choisissez votre motif de contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Selection */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={selectedCategory === 'demande_pret' ? 'default' : 'outline'}
                  className={`h-auto py-4 flex-col gap-2 ${selectedCategory === 'demande_pret' ? 'bg-primary' : ''}`}
                  onClick={() => { setSelectedCategory('demande_pret'); setSelectedMessage(null); }}
                >
                  <CreditCard className="w-6 h-6" />
                  <span>Demande de prêt</span>
                </Button>
                <Button
                  variant={selectedCategory === 'probleme' ? 'default' : 'outline'}
                  className={`h-auto py-4 flex-col gap-2 ${selectedCategory === 'probleme' ? 'bg-primary' : ''}`}
                  onClick={() => { setSelectedCategory('probleme'); setSelectedMessage(null); }}
                >
                  <AlertCircle className="w-6 h-6" />
                  <span>Signaler un problème</span>
                </Button>
                <Button
                  variant={selectedCategory === 'rdv' ? 'default' : 'outline'}
                  className={`h-auto py-4 flex-col gap-2 ${selectedCategory === 'rdv' ? 'bg-primary' : ''}`}
                  onClick={() => { setSelectedCategory('rdv'); setSelectedMessage(null); }}
                >
                  <Calendar className="w-6 h-6" />
                  <span>Prendre RDV</span>
                </Button>
              </div>

              {/* Pre-defined Messages */}
              {selectedCategory && (
                <div className="space-y-3 animate-fade-in">
                  <p className="text-sm text-muted-foreground">Messages suggérés :</p>
                  {messagesPredefinis[selectedCategory].map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedMessage?.sujet === msg.sujet 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedMessage(msg)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{msg.sujet}</p>
                        {selectedMessage?.sujet === msg.sujet && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{msg.contenu}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Message */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Ou rédigez un message personnalisé :</p>
                <Textarea
                  placeholder="Votre message..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="input-dark min-h-24"
                />
              </div>

              <Button variant="gold" className="w-full" onClick={handleSendMessage}>
                <Send className="w-4 h-4 mr-2" />
                Envoyer le Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historique Tab */}
        <TabsContent value="historique">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Historique des échanges</CardTitle>
            </CardHeader>
            <CardContent>
              {sentMessages.length > 0 ? (
                <div className="space-y-3">
                  {sentMessages.map(msg => (
                    <div key={msg.id} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{msg.sujet}</p>
                        <Badge variant="outline" className="text-xs">
                          {msg.date.toLocaleDateString('fr-FR')}
                        </Badge>
                      </div>
                      {msg.reponse && (
                        <div className="mt-2 p-3 rounded bg-success/10 border border-success/20">
                          <p className="text-xs text-success font-medium mb-1">Réponse automatique :</p>
                          <p className="text-sm">{msg.reponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun message envoyé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Direct Tab */}
        <TabsContent value="contact">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Contact Direct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-6 flex-col gap-3" onClick={handleCall}>
                  <Phone className="w-8 h-8 text-success" />
                  <div className="text-center">
                    <p className="font-medium">Appeler</p>
                    <p className="text-sm text-muted-foreground">{gestionnaire?.telephone}</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex-col gap-3" onClick={handleEmail}>
                  <Mail className="w-8 h-8 text-info" />
                  <div className="text-center">
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{gestionnaire?.email}</p>
                  </div>
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">
                  Horaires de disponibilité : <strong>Lundi - Vendredi, 8h - 17h</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
