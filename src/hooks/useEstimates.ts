import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Estimate, Material, Edgeband, Service } from '@/types/estimate';

export const useEstimates = () => {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEstimates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEstimates(data || []);
    } catch (error) {
      console.error('Error fetching estimates:', error);
      toast({
        title: 'Erro ao carregar orçamentos',
        description: 'Não foi possível carregar os orçamentos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const createEstimate = async (estimateData: any) => {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .insert([estimateData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Orçamento criado',
        description: 'Novo orçamento criado com sucesso.',
      });

      await fetchEstimates();
      return data;
    } catch (error) {
      console.error('Error creating estimate:', error);
      toast({
        title: 'Erro ao criar orçamento',
        description: 'Não foi possível criar o orçamento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateEstimate = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Orçamento atualizado',
        description: 'Orçamento atualizado com sucesso.',
      });

      await fetchEstimates();
    } catch (error) {
      console.error('Error updating estimate:', error);
      toast({
        title: 'Erro ao atualizar orçamento',
        description: 'Não foi possível atualizar o orçamento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteEstimate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Orçamento excluído',
        description: 'Orçamento excluído com sucesso.',
      });

      await fetchEstimates();
    } catch (error) {
      console.error('Error deleting estimate:', error);
      toast({
        title: 'Erro ao excluir orçamento',
        description: 'Não foi possível excluir o orçamento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    estimates,
    loading,
    fetchEstimates,
    createEstimate,
    updateEstimate,
    deleteEstimate,
  };
};

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setMaterials(data || []);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  return { materials, loading };
};

export const useEdgebands = () => {
  const [edgebands, setEdgebands] = useState<Edgeband[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEdgebands = async () => {
      try {
        const { data, error } = await supabase
          .from('edgebands')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setEdgebands(data || []);
      } catch (error) {
        console.error('Error fetching edgebands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEdgebands();
  }, []);

  return { edgebands, loading };
};

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading };
};
