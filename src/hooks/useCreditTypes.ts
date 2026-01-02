import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type CreditType = Database['public']['Tables']['credit_types']['Row'];
type CreditTypeInsert = Database['public']['Tables']['credit_types']['Insert'];
type EligibilityRule = Database['public']['Tables']['eligibility_rules']['Row'];
type AwardRule = Database['public']['Tables']['award_rules']['Row'];
type CreditTypeHistory = Database['public']['Tables']['credit_type_history']['Row'];

export interface CreditTypeWithRules extends CreditType {
  eligibility_rules?: EligibilityRule;
  award_rules?: AwardRule;
  history?: CreditTypeHistory[];
}

export function useCreditTypes() {
  const { user } = useAuth();
  const [creditTypes, setCreditTypes] = useState<CreditTypeWithRules[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditTypes = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch credit types
      const { data: types, error: typesError } = await supabase
        .from('credit_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (typesError) throw typesError;

      // Fetch eligibility rules
      const { data: eligibilityRules } = await supabase
        .from('eligibility_rules')
        .select('*');

      // Fetch award rules
      const { data: awardRules } = await supabase
        .from('award_rules')
        .select('*');

      // Combine data
      const combined = types?.map(type => ({
        ...type,
        eligibility_rules: eligibilityRules?.find(r => r.credit_type_id === type.id),
        award_rules: awardRules?.find(r => r.credit_type_id === type.id)
      })) || [];

      setCreditTypes(combined);
    } catch (err: any) {
      console.error('Error fetching credit types:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCreditType = async (
    data: Omit<CreditTypeInsert, 'id' | 'created_at' | 'updated_at'>,
    eligibilityRules?: Partial<EligibilityRule>,
    awardRules?: Partial<AwardRule>
  ): Promise<boolean> => {
    try {
      const { data: newType, error: typeError } = await supabase
        .from('credit_types')
        .insert(data)
        .select()
        .single();

      if (typeError) throw typeError;

      // Create eligibility rules
      if (eligibilityRules) {
        await supabase.from('eligibility_rules').insert({
          credit_type_id: newType.id,
          ...eligibilityRules
        });
      }

      // Create award rules
      if (awardRules) {
        await supabase.from('award_rules').insert({
          credit_type_id: newType.id,
          ...awardRules
        });
      }

      // Log history
      await supabase.from('credit_type_history').insert({
        credit_type_id: newType.id,
        action: 'creation',
        user_id: user?.id,
        user_name: user ? `${user.prenom} ${user.nom}` : 'Système',
        details: { libelle: data.libelle }
      });

      toast({
        title: 'Type de crédit créé',
        description: `${data.libelle} a été ajouté avec succès`
      });

      await fetchCreditTypes();
      return true;
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateCreditType = async (
    id: string,
    data: Partial<CreditType>,
    motif?: string
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('credit_types')
        .update(data)
        .eq('id', id);

      if (updateError) throw updateError;

      // Log history
      await supabase.from('credit_type_history').insert({
        credit_type_id: id,
        action: 'modification',
        user_id: user?.id,
        user_name: user ? `${user.prenom} ${user.nom}` : 'Système',
        motif,
        details: data
      });

      toast({
        title: 'Type de crédit modifié',
        description: 'Les modifications ont été enregistrées'
      });

      await fetchCreditTypes();
      return true;
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  const toggleStatus = async (id: string, newStatus: 'actif' | 'suspendu', motif?: string): Promise<boolean> => {
    try {
      const creditType = creditTypes.find(c => c.id === id);
      if (!creditType) return false;

      const action = newStatus === 'actif' ? 'activation' : 'suspension';

      const { error: updateError } = await supabase
        .from('credit_types')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) throw updateError;

      // Log history
      await supabase.from('credit_type_history').insert({
        credit_type_id: id,
        action,
        user_id: user?.id,
        user_name: user ? `${user.prenom} ${user.nom}` : 'Système',
        motif,
        details: { previous_status: creditType.status, new_status: newStatus }
      });

      toast({
        title: newStatus === 'actif' ? 'Type activé' : 'Type suspendu',
        description: `${creditType.libelle} a été ${newStatus === 'actif' ? 'activé' : 'suspendu'}`
      });

      await fetchCreditTypes();
      return true;
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteCreditType = async (id: string): Promise<boolean> => {
    try {
      // Delete related rules first
      await supabase.from('eligibility_rules').delete().eq('credit_type_id', id);
      await supabase.from('award_rules').delete().eq('credit_type_id', id);
      await supabase.from('credit_type_history').delete().eq('credit_type_id', id);
      
      const { error: deleteError } = await supabase
        .from('credit_types')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Type supprimé',
        description: 'Le type de crédit a été supprimé'
      });

      await fetchCreditTypes();
      return true;
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  const fetchHistory = async (creditTypeId: string): Promise<CreditTypeHistory[]> => {
    const { data, error } = await supabase
      .from('credit_type_history')
      .select('*')
      .eq('credit_type_id', creditTypeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }

    return data || [];
  };

  useEffect(() => {
    fetchCreditTypes();
  }, [fetchCreditTypes]);

  return {
    creditTypes,
    loading,
    error,
    createCreditType,
    updateCreditType,
    toggleStatus,
    deleteCreditType,
    fetchHistory,
    refresh: fetchCreditTypes
  };
}
