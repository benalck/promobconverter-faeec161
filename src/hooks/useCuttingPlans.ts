import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CuttingPlan {
  id: string;
  user_id: string;
  name: string;
  sheet_width: number;
  sheet_height: number;
  sheet_thickness: number;
  cut_margin: number;
  grain_direction: 'horizontal' | 'vertical' | 'none';
  total_sheets: number;
  utilization_percent: number;
  total_area: number;
  used_area: number;
  waste_area: number;
  status: 'draft' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

export interface CuttingItem {
  id: string;
  plan_id: string;
  name: string;
  width: number;
  height: number;
  thickness: number;
  quantity: number;
  grain_direction: 'horizontal' | 'vertical' | 'none';
  created_at: string;
}

export function useCuttingPlans() {
  const [plans, setPlans] = useState<CuttingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPlans = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cutting_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans((data || []) as CuttingPlan[]);
    } catch (error: any) {
      console.error('Error fetching cutting plans:', error);
      toast.error('Erro ao carregar planos de corte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [user]);

  const createPlan = async (planData: Partial<CuttingPlan>) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('cutting_plans')
        .insert([
          {
            user_id: user.id,
            name: planData.name || 'Novo Plano',
            sheet_width: planData.sheet_width || 2750,
            sheet_height: planData.sheet_height || 1850,
            sheet_thickness: planData.sheet_thickness || 18,
            cut_margin: planData.cut_margin || 3,
            grain_direction: planData.grain_direction || 'none',
            ...planData,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Plano de corte criado com sucesso!');
      await fetchPlans();
      return data;
    } catch (error: any) {
      console.error('Error creating cutting plan:', error);
      toast.error('Erro ao criar plano de corte');
      return null;
    }
  };

  const updatePlan = async (planId: string, updates: Partial<CuttingPlan>) => {
    try {
      const { error } = await supabase
        .from('cutting_plans')
        .update(updates)
        .eq('id', planId);

      if (error) throw error;

      toast.success('Plano atualizado com sucesso!');
      await fetchPlans();
    } catch (error: any) {
      console.error('Error updating cutting plan:', error);
      toast.error('Erro ao atualizar plano');
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('cutting_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast.success('Plano excluído com sucesso!');
      await fetchPlans();
    } catch (error: any) {
      console.error('Error deleting cutting plan:', error);
      toast.error('Erro ao excluir plano');
    }
  };

  return {
    plans,
    loading,
    createPlan,
    updatePlan,
    deletePlan,
    refreshPlans: fetchPlans,
  };
}

export function useCuttingItems(planId: string | null) {
  const [items, setItems] = useState<CuttingItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    if (!planId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cutting_items')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setItems((data || []) as CuttingItem[]);
    } catch (error: any) {
      console.error('Error fetching cutting items:', error);
      toast.error('Erro ao carregar peças');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [planId]);

  const addItem = async (itemData: Omit<CuttingItem, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('cutting_items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;

      await fetchItems();
      return data;
    } catch (error: any) {
      console.error('Error adding cutting item:', error);
      toast.error('Erro ao adicionar peça');
      return null;
    }
  };

  const updateItem = async (itemId: string, updates: Partial<CuttingItem>) => {
    try {
      const { error } = await supabase
        .from('cutting_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;

      await fetchItems();
    } catch (error: any) {
      console.error('Error updating cutting item:', error);
      toast.error('Erro ao atualizar peça');
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cutting_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await fetchItems();
    } catch (error: any) {
      console.error('Error deleting cutting item:', error);
      toast.error('Erro ao excluir peça');
    }
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    refreshItems: fetchItems,
  };
}
