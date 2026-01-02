import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Dossier = Database['public']['Tables']['dossiers']['Row'];
type DossierInsert = Database['public']['Tables']['dossiers']['Insert'];
type DossierHistory = Database['public']['Tables']['dossier_history']['Row'];

export interface DossierWithAnalysis extends Dossier {
  history?: DossierHistory[];
}

export function useDossiers() {
  const { user } = useAuth();
  const [dossiers, setDossiers] = useState<DossierWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDossiers = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('dossiers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setDossiers(data || []);
    } catch (err: any) {
      console.error('Error fetching dossiers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDossier = async (data: Omit<DossierInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: newDossier, error: createError } = await supabase
        .from('dossiers')
        .insert({
          ...data,
          gestionnaire_id: user?.id,
          status: 'en_cours'
        })
        .select()
        .single();

      if (createError) throw createError;

      // Log history
      await supabase.from('dossier_history').insert({
        dossier_id: newDossier.id,
        action: 'creation',
        user_id: user?.id,
        user_name: user ? `${user.prenom} ${user.nom}` : 'Système',
        details: { montant: data.montant, duree: data.duree }
      });

      toast({
        title: 'Dossier créé',
        description: 'Le dossier a été enregistré avec succès'
      });

      await fetchDossiers();
      return newDossier;
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  };

  const updateDossierStatus = async (
    id: string, 
    status: Dossier['status'],
    details?: Record<string, any>
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('dossiers')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;

      // Log history
      await supabase.from('dossier_history').insert({
        dossier_id: id,
        action: `changement_statut_${status}`,
        user_id: user?.id,
        user_name: user ? `${user.prenom} ${user.nom}` : 'Système',
        details: { new_status: status, ...details }
      });

      await fetchDossiers();
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  };

  const addToPanier = async (id: string) => {
    await updateDossierStatus(id, 'panier');
    toast({
      title: 'Ajouté au panier',
      description: 'Le dossier a été ajouté au panier'
    });
  };

  const analyzeWithAI = async (id: string, clientData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-dossier', {
        body: {
          dossierId: id,
          clientData,
          creditData: dossiers.find(d => d.id === id)
        }
      });

      if (error) throw error;

      // Update dossier with AI analysis
      await supabase
        .from('dossiers')
        .update({
          analysis_data: data.analysis,
          ai_recommendation: data.recommendation,
          score_global: data.score_global,
          classe_risque: data.classe_risque,
          status: 'analyse'
        })
        .eq('id', id);

      // Log history
      await supabase.from('dossier_history').insert({
        dossier_id: id,
        action: 'analyse_ia',
        user_id: user?.id,
        user_name: user ? `${user.prenom} ${user.nom}` : 'Système',
        details: { score: data.score_global, classe: data.classe_risque }
      });

      await fetchDossiers();
      return data;
    } catch (err: any) {
      toast({
        title: 'Erreur d\'analyse',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  };

  const transmitToComite = async (ids: string[], remarks?: string) => {
    try {
      for (const id of ids) {
        await supabase
          .from('dossiers')
          .update({ 
            status: 'transmis',
            gestionnaire_remarks: remarks
          })
          .eq('id', id);

        await supabase.from('dossier_history').insert({
          dossier_id: id,
          action: 'transmission_comite',
          user_id: user?.id,
          user_name: user ? `${user.prenom} ${user.nom}` : 'Système',
          details: { remarks }
        });
      }

      // Create notification for admin
      await supabase.from('notifications').insert({
        user_id: user?.id || '',
        title: 'Nouveaux dossiers transmis',
        message: `${ids.length} dossier(s) reçu(s) de ${user?.prenom} ${user?.nom}`,
        type: 'info',
        metadata: { dossier_count: ids.length, from: user?.id }
      });

      toast({
        title: 'Dossiers transmis',
        description: `${ids.length} dossier(s) transmis au comité`
      });

      await fetchDossiers();
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  };

  const classifyDossier = async (id: string, motif: string) => {
    try {
      await supabase
        .from('dossiers')
        .update({ status: 'classe' })
        .eq('id', id);

      await supabase.from('dossier_history').insert({
        dossier_id: id,
        action: 'classement',
        user_id: user?.id,
        user_name: user ? `${user.prenom} ${user.nom}` : 'Système',
        details: { motif }
      });

      toast({
        title: 'Dossier classé',
        description: 'Le dossier a été classé sans suite'
      });

      await fetchDossiers();
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const fetchHistory = async (dossierId: string): Promise<DossierHistory[]> => {
    const { data, error } = await supabase
      .from('dossier_history')
      .select('*')
      .eq('dossier_id', dossierId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }

    return data || [];
  };

  useEffect(() => {
    fetchDossiers();
  }, [fetchDossiers]);

  return {
    dossiers,
    loading,
    error,
    createDossier,
    updateDossierStatus,
    addToPanier,
    analyzeWithAI,
    transmitToComite,
    classifyDossier,
    fetchHistory,
    refresh: fetchDossiers
  };
}
