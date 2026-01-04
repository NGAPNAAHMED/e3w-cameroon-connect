import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  Search, CheckCircle2, XCircle, Eye, FileText, User, Clock,
  AlertTriangle, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

interface KYCSubmission {
  id: string;
  clientId: string;
  clientName: string;
  clientType: 'salarie' | 'independant' | 'entreprise';
  avatar: string;
  submittedAt: Date;
  status: 'pending' | 'validated' | 'rejected';
  progress: number;
  rejectionReason?: string;
}

interface Props {
  submissions: KYCSubmission[];
  onValidate: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onViewDetails: (id: string) => void;
}

export function KYCValidationList({ submissions, onValidate, onReject, onViewDetails }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated' | 'rejected'>('pending');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = s.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleRejectClick = (id: string) => {
    setSelectedId(id);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedId && rejectionReason.trim()) {
      onReject(selectedId, rejectionReason);
      setRejectDialogOpen(false);
      toast({
        title: 'Fiche KYC rejetée',
        description: 'Le client a été notifié du motif de rejet',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge className="status-success"><CheckCircle2 className="w-3 h-3 mr-1" />Validée</Badge>;
      case 'rejected':
        return <Badge className="status-danger"><XCircle className="w-3 h-3 mr-1" />Rejetée</Badge>;
      default:
        return <Badge className="status-pending"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
    }
  };

  const getClientTypeBadge = (type: string) => {
    switch (type) {
      case 'salarie':
        return <Badge variant="outline" className="text-xs">Salarié</Badge>;
      case 'independant':
        return <Badge variant="outline" className="text-xs">Indépendant</Badge>;
      case 'entreprise':
        return <Badge variant="outline" className="text-xs">Entreprise</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 input-dark"
            />
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(['all', 'pending', 'validated', 'rejected'] as const).map(f => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'ghost'}
                onClick={() => setFilter(f)}
                className={cn(
                  "text-xs px-3",
                  filter === f && "bg-primary text-primary-foreground"
                )}
              >
                {f === 'all' && 'Tous'}
                {f === 'pending' && 'En attente'}
                {f === 'validated' && 'Validées'}
                {f === 'rejected' && 'Rejetées'}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {filteredSubmissions.length} fiche(s) trouvée(s)
          </span>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-warning">
              <Clock className="w-3 h-3" />
              {submissions.filter(s => s.status === 'pending').length} en attente
            </span>
            <span className="flex items-center gap-1 text-success">
              <CheckCircle2 className="w-3 h-3" />
              {submissions.filter(s => s.status === 'validated').length} validées
            </span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollable-content">
        {filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p>Aucune fiche KYC trouvée</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredSubmissions.map(submission => (
              <div
                key={submission.id}
                className={cn(
                  "p-4 hover:bg-accent/30 transition-colors",
                  submission.status === 'pending' && "bg-warning/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-border">
                    <AvatarImage src={submission.avatar} />
                    <AvatarFallback>{submission.clientName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold truncate">{submission.clientName}</span>
                      {getClientTypeBadge(submission.clientType)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Soumis le {formatDate(submission.submittedAt.toISOString())}</span>
                      <span className="flex items-center gap-1">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${submission.progress}%` }}
                          />
                        </div>
                        {submission.progress}%
                      </span>
                    </div>
                    {submission.rejectionReason && (
                      <div className="mt-2 p-2 rounded bg-destructive/10 text-xs text-destructive flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{submission.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(submission.status)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(submission.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {submission.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onValidate(submission.id)}
                          className="btn-primary"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectClick(submission.id)}
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Rejeter la fiche KYC
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Veuillez indiquer le motif du rejet. Le client sera notifié de cette raison.
            </p>
            
            <div className="space-y-2">
              <Label>Motif du rejet <span className="text-destructive">*</span></Label>
              <Textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Ex: Carte nationale d'identité expirée, documents illisibles..."
                className="input-dark min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                'CNI expirée',
                'Documents illisibles',
                'Informations incomplètes',
                'Photo non conforme'
              ].map(reason => (
                <Button
                  key={reason}
                  size="sm"
                  variant="outline"
                  onClick={() => setRejectionReason(reason)}
                  className="justify-start text-xs"
                >
                  {reason}
                </Button>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim()}
              className="btn-danger"
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
