import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  ShoppingCart,
  Send,
  Trash2,
  Eye,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { clients, companies, Client, ClientSalarie, ClientIndependant } from '@/data/mockData';
import { formatXAF, getInitials } from '@/lib/formatters';

// Mock panier data
const panierDossiers = [
  {
    id: 'p1',
    clientId: 'sal_1',
    montant: 5000000,
    type: 'Crédit Consommation',
    dateAjout: '2024-01-15',
  },
  {
    id: 'p2',
    clientId: 'ind_2',
    montant: 8000000,
    type: 'Crédit Auto',
    dateAjout: '2024-01-14',
  },
];

export default function ManagerPanier() {
  const [dossiers, setDossiers] = useState(panierDossiers);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return 'Client inconnu';
    if (client.type !== 'entreprise') {
      const c = client as ClientSalarie | ClientIndependant;
      return `${c.prenom} ${c.nom}`;
    }
    const company = companies.find(co => co.id === (client as any).companyId);
    return company?.name || 'Entreprise';
  };

  const getClient = (clientId: string) => {
    return clients.find(c => c.id === clientId);
  };

  const handleRemove = (id: string) => {
    setDossiers(prev => prev.filter(d => d.id !== id));
    toast({
      title: "Dossier retiré",
      description: "Le dossier a été retiré du panier",
    });
  };

  const handleSubmitAll = () => {
    toast({
      title: "Dossiers transmis",
      description: `${dossiers.length} dossier(s) transmis au comité`,
    });
    setDossiers([]);
  };

  const handleSubmitOne = (id: string) => {
    setDossiers(prev => prev.filter(d => d.id !== id));
    toast({
      title: "Dossier transmis",
      description: "Le dossier a été transmis au comité",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Panier</h1>
          <p className="text-muted-foreground">Dossiers prêts à transmettre au comité</p>
        </div>
        {dossiers.length > 0 && (
          <Button variant="gold" onClick={handleSubmitAll}>
            <Send className="w-4 h-4 mr-2" />
            Transmettre tout ({dossiers.length})
          </Button>
        )}
      </div>

      {dossiers.length > 0 ? (
        <div className="grid gap-4">
          {dossiers.map(dossier => {
            const client = getClient(dossier.clientId);
            const clientName = getClientName(dossier.clientId);
            const avatar = client?.type !== 'entreprise' ? (client as any)?.avatar : undefined;

            return (
              <Card key={dossier.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 border border-border">
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="bg-muted">
                        {client?.type !== 'entreprise' 
                          ? getInitials((client as any)?.nom || '', (client as any)?.prenom || '')
                          : 'E'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">{clientName}</h3>
                        <Badge variant="outline">{dossier.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-primary number-format">
                          {formatXAF(dossier.montant)}
                        </span>
                        <span>Ajouté le {dossier.dateAjout}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                      <Button 
                        variant="gold" 
                        size="sm"
                        onClick={() => handleSubmitOne(dossier.id)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Transmettre
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemove(dossier.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Panier vide</h3>
            <p className="text-muted-foreground">
              Aucun dossier prêt à transmettre au comité
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
