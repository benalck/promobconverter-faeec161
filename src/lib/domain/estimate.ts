import { z } from 'zod';
import { calculateEstimate } from '@/utils/estimateCalculator';
import { Material, Edgeband, Service } from '@/types/estimate';
import { PieceData } from '@/components/OptimizationResults';
import { supabase } from '@/integrations/supabase/client';

export const estimateFormSchema = z.object({
  name: z.string().min(3, "Digite um nome válido para o orçamento (mínimo 3 caracteres)"),
  clientName: z.string().optional(),
  clientEmail: z.string().email("E-mail inválido").or(z.literal('')).optional(),
  notes: z.string().optional(),
  selectedMaterialId: z.string().min(1, "Selecione um material"),
  selectedEdgebandId: z.string().min(1, "Selecione uma fita de borda"),
  profitMargin: z.number().min(0, "Margem deve ser no mínimo 0%").max(100, "Margem deve ser no máximo 100%"),
});

export type EstimateFormData = z.infer<typeof estimateFormSchema>;

/**
 * Valida os dados do formulário de orçamento
 */
export const validateEstimate = (data: EstimateFormData) => {
  return estimateFormSchema.safeParse(data);
};

/**
 * Computa o preview do orçamento em tempo real
 */
export const computeEstimatePreview = (
  data: EstimateFormData,
  pieces: PieceData[],
  materials: Material[],
  edgebands: Edgeband[],
  services: Service[]
) => {
  const material = materials.find(m => m.id === data.selectedMaterialId);
  const edgeband = edgebands.find(e => e.id === data.selectedEdgebandId);

  if (!material || !edgeband) return null;

  return calculateEstimate({
    pieces,
    material,
    edgeband,
    services,
    profitMargin: data.profitMargin,
    taxPercent: 0,
    discountPercent: 0,
  });
};

/**
 * Verifica se já existe um orçamento com o mesmo nome para o usuário
 */
export const checkEstimateNameExists = async (name: string, userId: string, excludeId?: string) => {
  try {
    let query = supabase
      .from('estimates')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error checking estimate name:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking estimate name:', error);
    return false;
  }
};

/**
 * Salva o rascunho do orçamento no localStorage
 */
export const saveDraftEstimate = (data: EstimateFormData) => {
  try {
    localStorage.setItem('draftEstimate', JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error saving draft estimate:', error);
  }
};

/**
 * Recupera o rascunho do orçamento do localStorage
 */
export const loadDraftEstimate = (): EstimateFormData | null => {
  try {
    const draft = localStorage.getItem('draftEstimate');
    if (!draft) return null;

    const parsed = JSON.parse(draft);
    
    // Check if draft is older than 24 hours
    const timestamp = new Date(parsed.timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      clearDraftEstimate();
      return null;
    }

    // Remove timestamp before returning
    const { timestamp: _, ...data } = parsed;
    return data;
  } catch (error) {
    console.error('Error loading draft estimate:', error);
    return null;
  }
};

/**
 * Limpa o rascunho do orçamento do localStorage
 */
export const clearDraftEstimate = () => {
  try {
    localStorage.removeItem('draftEstimate');
  } catch (error) {
    console.error('Error clearing draft estimate:', error);
  }
};
