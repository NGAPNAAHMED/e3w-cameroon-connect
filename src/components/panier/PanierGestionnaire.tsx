import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatXAF } from '@/lib/formatters';
import {
  Search, Play, Loader2, CheckCircle2, XCircle, AlertTriangle,
  Upload, FolderOpen, Eye, ArrowRight, BarChart3
} from 'lucide-react';

export interface PanierDossier {
  id: string;
  clientId: string;
  clientName: string;
  clientType: 'salarie' | 'independant' | 'entreprise';
  avatar: string;
  montant: number;
  duree: number;
  typeCredit: string;
  addedAt: Date;
  status: 'pending' | 'analyzing' | 'analyzed' | 'blocked';
  analysisResult?: {
    score: number;
    classeRisque: string;
    recommandation: string;
    blockedReason?: string;
  };
}

interface Props {
  dossiers: PanierDossier[];
  onAnalyze: (ids: string[]) => Promise<void>;
  onViewDossier: (id: string) => void;
  onDragDrop?: (files: FileList) => void;
}

export function PanierGestionnaire({ dossiers, onAnalyze, onViewDossier, onDragDrop }: Props) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);

  const filteredDossiers = useMemo(() => {
    return dossiers.filter(d => 
      d.clientName.toLowerCase().includes(search.toLowerCase()) ||
      d.typeCredit.toLowerCase().includes(search.toLowerCase())
    );
  }, [dossiers, search]);

  const pendingDossiers = filteredDossiers.filter(d => d.status === 'pending');
  const analyzedDossiers = filteredDossiers.filter(d => d.status === 'analyzed');
  const blockedDossiers = filteredDossiers.filter(d => d.status === 'blocked');

  const handleSelectAll = () => {
    if (selectedIds.size === pendingDossiers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingDossiers.map(d => d.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleAnalyze = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'Aucun dossier sélectionné',
        description: 'Veuillez sélectionner au moins un dossier à analyser',
        variant: 'destructive'
      });
      return;
    }

    setAnalyzingIds(new Set(selectedIds));
    
    try {
      await onAnalyze(Array.from(selectedIds));
      setSelectedIds(new Set());
    } finally {
      setAnalyzingIds(new Set());
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0 && onDragDrop) {
      onDragDrop(e.dataTransfer.files);
    }
  }, [onDragDrop]);

  const getStatusBadge = (status: string, result?: PanierDossier['analysisResult']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-xs">En attente</Badge>;
      case 'analyzing':
        return <Badge className="bg-info/20 text-info border-info/30"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Analyse...</Badge>;
      case 'analyzed':
        return <Badge className="status-success"><CheckCircle2 className="w-3 h-3 mr-1" />Analysé</Badge>;
      case 'blocked':
        return <Badge className="status-danger"><XCircle className="w-3 h-3 mr-1" />Bloqué</Badge>;
      default:
        return null;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return <Badge className="score-excellent">{score}/100</Badge>;
    if (score >= 50) return <Badge className="score-medium">{score}/100</Badge>;
    return <Badge className="score-low">{score}/100</Badge>;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Panier d'analyse</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{pendingDossiers.length} en attente</Badge>
              <Badge className="status-success">{analyzedDossiers.length} analysés</Badge>
              {blockedDossiers.length > 0 && (
                <Badge className="status-danger">{blockedDossiers.length} bloqués</Badge>
              )}
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={selectedIds.size === 0 || analyzingIds.size > 0}
            className="btn-primary"
          >
            {analyzingIds.size > 0 ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyse en cours...</>
            ) : (
              <><Play className="w-4 h-4 mr-2" />Analyser ({selectedIds.size})</>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un dossier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 input-dark"
            />
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg border-2 border-dashed transition-all cursor-pointer",
              isDragging 
                ? "border-primary bg-primary/10 text-primary" 
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm">Glisser-déposer des dossiers</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Pending Dossiers */}
        <div className="flex-1 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">En attente d'analyse</span>
            <Button size="sm" variant="ghost" onClick={handleSelectAll}>
              {selectedIds.size === pendingDossiers.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollable-content">
            {pendingDossiers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FolderOpen className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Aucun dossier en attente</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingDossiers.map(dossier => {
                  const isAnalyzing = analyzingIds.has(dossier.id);
                  
                  return (
                    <div
                      key={dossier.id}
                      className={cn(
                        "p-4 transition-all",
                        selectedIds.has(dossier.id) && "bg-primary/5",
                        isAnalyzing && "opacity-60 pointer-events-none"
                      )}
                    >
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center z-10">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                            <p className="text-sm font-medium">Analyse en cours...</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedIds.has(dossier.id)}
                          onCheckedChange={() => handleSelect(dossier.id)}
                        />
                        
                        <Avatar className="w-10 h-10 border border-border">
                          <AvatarImage src={dossier.avatar} />
                          <AvatarFallback>{dossier.clientName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{dossier.clientName}</p>
                          <p className="text-xs text-muted-foreground">
                            {dossier.typeCredit} • {formatXAF(dossier.montant)} • {dossier.duree} mois
                          </p>
                        </div>
                        
                        {getStatusBadge(isAnalyzing ? 'analyzing' : dossier.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Analyzed/Blocked Dossiers */}
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-border bg-muted/30">
            <span className="text-sm font-medium text-muted-foreground">Résultats d'analyse</span>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollable-content">
            {analyzedDossiers.length === 0 && blockedDossiers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Aucun résultat d'analyse</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {[...analyzedDossiers, ...blockedDossiers].map(dossier => (
                  <div
                    key={dossier.id}
                    className={cn(
                      "p-4 hover:bg-accent/30 transition-colors cursor-pointer",
                      dossier.status === 'blocked' && "bg-destructive/5"
                    )}
                    onClick={() => onViewDossier(dossier.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarImage src={dossier.avatar} />
                        <AvatarFallback>{dossier.clientName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{dossier.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {dossier.typeCredit} • {formatXAF(dossier.montant)}
                        </p>
                        {dossier.status === 'blocked' && dossier.analysisResult?.blockedReason && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {dossier.analysisResult.blockedReason}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {dossier.analysisResult && getScoreBadge(dossier.analysisResult.score)}
                        {getStatusBadge(dossier.status, dossier.analysisResult)}
                      </div>
                      
                      <Button size="icon" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
