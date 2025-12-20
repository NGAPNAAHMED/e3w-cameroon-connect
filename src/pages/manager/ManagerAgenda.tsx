import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  MessageSquare,
  Mail,
  CreditCard,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Send,
  Eye,
  Trash2,
} from 'lucide-react';
import { getInitials } from '@/lib/formatters';

// Types de messages clients
const messageTypes = {
  demande_pret: { label: 'Demande de prêt', icon: CreditCard, color: 'text-primary' },
  probleme: { label: 'Problème', icon: AlertCircle, color: 'text-destructive' },
  rdv: { label: 'Demande de RDV', icon: Calendar, color: 'text-info' },
  question: { label: 'Question', icon: HelpCircle, color: 'text-warning' },
};

// Mock messages from clients
const initialMessages = [
  {
    id: 'm1',
    clientName: 'Jean-Paul Ekedi',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    type: 'demande_pret' as const,
    sujet: 'Demande de crédit scolaire',
    contenu: 'Bonjour, je souhaite faire une demande de crédit scolaire pour la rentrée de mes enfants.',
    dateEnvoi: new Date(Date.now() - 1000 * 60 * 30),
    lu: false,
    telephone: '+237 6 99 88 77 66',
  },
  {
    id: 'm2',
    clientName: 'Marie Atangana',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    type: 'probleme' as const,
    sujet: 'Problème avec mon échéance',
    contenu: 'Je n\'arrive pas à effectuer le paiement de mon échéance ce mois-ci. Pouvez-vous m\'aider?',
    dateEnvoi: new Date(Date.now() - 1000 * 60 * 120),
    lu: false,
    telephone: '+237 6 77 66 55 44',
  },
  {
    id: 'm3',
    clientName: 'Paul Fotso',
    clientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    type: 'rdv' as const,
    sujet: 'Rendez-vous pour dossier',
    contenu: 'Je souhaite prendre rendez-vous pour compléter mon dossier de crédit immobilier.',
    dateEnvoi: new Date(Date.now() - 1000 * 60 * 60 * 24),
    lu: true,
    telephone: '+237 6 55 44 33 22',
  },
  {
    id: 'm4',
    clientName: 'Esther Ngono',
    clientAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150',
    type: 'question' as const,
    sujet: 'Question sur le taux',
    contenu: 'Quel est le taux actuel pour un crédit consommation de 5 millions?',
    dateEnvoi: new Date(Date.now() - 1000 * 60 * 60 * 48),
    lu: true,
    telephone: '+237 6 44 33 22 11',
  },
];

// Mock appointments
const initialAppointments = [
  {
    id: 'a1',
    clientName: 'Jean-Paul Ekedi',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    date: '2024-01-20',
    time: '09:00',
    type: 'Étude dossier',
    notes: 'Apporter bulletins de paie',
  },
  {
    id: 'a2',
    clientName: 'Marie Atangana',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    date: '2024-01-20',
    time: '14:30',
    type: 'Signature',
    notes: 'Contrat crédit consommation',
  },
  {
    id: 'a3',
    clientName: 'Paul Fotso',
    clientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    date: '2024-01-22',
    time: '10:00',
    type: 'Premier contact',
    notes: '',
  },
];

// Réponses automatiques suggérées
const autoResponses = {
  demande_pret: [
    "Merci pour votre demande. Je vous invite à compléter votre fiche client dans votre espace pour que nous puissions étudier votre dossier.",
    "Pour votre demande de prêt, veuillez préparer les documents suivants: CNI, bulletins de salaire, attestation d'emploi. Je vous contacterai pour un RDV.",
  ],
  probleme: [
    "Je comprends votre situation. Veuillez me contacter directement au téléphone pour trouver une solution adaptée.",
    "Nous allons examiner votre dossier. En attendant, merci de ne pas vous inquiéter, nous trouverons une solution ensemble.",
  ],
  rdv: [
    "Je suis disponible les matins cette semaine. Proposez-moi une date et heure qui vous convient.",
    "Parfait, je note votre demande de RDV. Je vous confirme le créneau par message.",
  ],
  question: [
    "Merci pour votre question. Je vous réponds dans les plus brefs délais.",
    "Je vais vérifier cette information et reviens vers vous rapidement.",
  ],
};

export default function ManagerAgenda() {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState(initialMessages);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMessage, setSelectedMessage] = useState<typeof initialMessages[0] | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // New appointment form
  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    date: '',
    time: '',
    type: '',
    notes: '',
  });

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = (firstDay.getDay() + 6) % 7;
    
    const daysArray = [];
    for (let i = 0; i < startingDay; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }
    return daysArray;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'À l\'instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  };

  const hasAppointment = (day: number | null) => {
    if (!day) return false;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.some(a => a.date === dateStr);
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, lu: true } : m
    ));
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyText) return;
    
    addNotification({
      title: "Message envoyé",
      message: `Réponse envoyée à ${selectedMessage.clientName}`,
      type: "success"
    });
    
    toast({
      title: "Message envoyé",
      description: `Votre réponse a été envoyée à ${selectedMessage.clientName}`,
    });
    
    handleMarkAsRead(selectedMessage.id);
    setReplyText('');
    setSelectedMessage(null);
  };

  const handleAddAppointment = () => {
    if (!newAppointment.clientName || !newAppointment.date || !newAppointment.time) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    const appointment = {
      id: `a_${Date.now()}`,
      ...newAppointment,
      clientAvatar: '',
    };
    
    setAppointments(prev => [...prev, appointment]);
    
    addNotification({
      title: "RDV programmé",
      message: `RDV avec ${newAppointment.clientName} le ${newAppointment.date} à ${newAppointment.time}`,
      type: "info"
    });
    
    toast({
      title: "RDV ajouté",
      description: "Le rendez-vous a été programmé",
    });
    
    setNewAppointment({ clientName: '', date: '', time: '', type: '', notes: '' });
  };

  const unreadCount = messages.filter(m => !m.lu).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Agenda & Messages</h1>
          <p className="text-muted-foreground">Gérez vos communications et rendez-vous clients</p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="outline" className="text-warning border-warning">
            {unreadCount} messages non lus
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="messages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-destructive text-destructive-foreground">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rdv" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            Rendez-vous
          </TabsTrigger>
          <TabsTrigger value="calendrier" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="w-4 h-4 mr-2" />
            Calendrier
          </TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4 mt-4">
          {messages.map(message => {
            const typeInfo = messageTypes[message.type];
            const TypeIcon = typeInfo.icon;
            
            return (
              <Card key={message.id} className={`glass-card transition-all ${!message.lu ? 'border-primary/50 bg-primary/5' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 border border-border">
                      <AvatarImage src={message.clientAvatar} />
                      <AvatarFallback className="bg-muted">
                        {getInitials(message.clientName.split(' ')[1] || '', message.clientName.split(' ')[0])}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{message.clientName}</span>
                        <Badge variant="outline" className={typeInfo.color}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                        {!message.lu && (
                          <span className="w-2 h-2 bg-primary rounded-full" />
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">{formatTimeAgo(message.dateEnvoi)}</span>
                      </div>
                      <p className="font-medium text-sm mb-1">{message.sujet}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{message.contenu}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedMessage(message);
                              handleMarkAsRead(message.id);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                              {message.sujet}
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4 mt-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={message.clientAvatar} />
                                <AvatarFallback>{message.clientName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{message.clientName}</p>
                                <p className="text-xs text-muted-foreground">{message.telephone}</p>
                              </div>
                              <Button variant="outline" size="icon" className="ml-auto">
                                <Phone className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="p-4 rounded-lg bg-muted/30 border border-border">
                              <p className="text-sm">{message.contenu}</p>
                              <p className="text-xs text-muted-foreground mt-2">{formatTimeAgo(message.dateEnvoi)}</p>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Réponses suggérées:</p>
                              <div className="space-y-2">
                                {autoResponses[message.type].map((response, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start text-left h-auto py-2 text-xs"
                                    onClick={() => setReplyText(response)}
                                  >
                                    {response}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Écrivez votre réponse..."
                                className="input-dark min-h-20"
                              />
                              <div className="flex gap-2">
                                <DialogClose asChild>
                                  <Button variant="outline" className="flex-1">Fermer</Button>
                                </DialogClose>
                                <Button variant="gold" className="flex-1" onClick={handleSendReply}>
                                  <Send className="w-4 h-4 mr-2" />
                                  Envoyer
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`tel:${message.telephone}`}>
                          <Phone className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {messages.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucun message</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* RDV Tab */}
        <TabsContent value="rdv" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add RDV */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Nouveau Rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm">Nom du client *</label>
                  <Input
                    value={newAppointment.clientName}
                    onChange={(e) => setNewAppointment(p => ({...p, clientName: e.target.value}))}
                    placeholder="Nom du client"
                    className="input-dark"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm">Date *</label>
                    <Input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment(p => ({...p, date: e.target.value}))}
                      className="input-dark"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Heure *</label>
                    <Input
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment(p => ({...p, time: e.target.value}))}
                      className="input-dark"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Type de RDV</label>
                  <Select value={newAppointment.type} onValueChange={(v) => setNewAppointment(p => ({...p, type: v}))}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premier_contact">Premier contact</SelectItem>
                      <SelectItem value="etude_dossier">Étude dossier</SelectItem>
                      <SelectItem value="signature">Signature</SelectItem>
                      <SelectItem value="suivi">Suivi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Notes</label>
                  <Textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment(p => ({...p, notes: e.target.value}))}
                    placeholder="Notes optionnelles..."
                    className="input-dark"
                  />
                </div>
                <Button variant="gold" className="w-full" onClick={handleAddAppointment}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter le RDV
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Prochains Rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointments.map(apt => (
                  <div key={apt.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{apt.type}</Badge>
                      <span className="text-sm font-medium">{apt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={apt.clientAvatar} />
                        <AvatarFallback className="text-xs">{apt.clientName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium text-sm">{apt.clientName}</span>
                        <p className="text-xs text-muted-foreground">{apt.date}</p>
                      </div>
                    </div>
                    {apt.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">{apt.notes}</p>
                    )}
                  </div>
                ))}
                
                {appointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Aucun RDV prévu</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendrier" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {days.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                {getDaysInMonth(currentDate).map((day, index) => {
                  const isToday = day === new Date().getDate() && 
                    currentDate.getMonth() === new Date().getMonth() && 
                    currentDate.getFullYear() === new Date().getFullYear();
                  
                  return (
                    <div
                      key={index}
                      className={`aspect-square p-2 text-center rounded-lg transition-colors cursor-pointer relative
                        ${day ? 'hover:bg-muted/50' : ''}
                        ${isToday ? 'bg-primary/20 text-primary font-bold' : ''}
                      `}
                    >
                      {day}
                      {hasAppointment(day) && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
