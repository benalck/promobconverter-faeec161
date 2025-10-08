import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PieceData } from '@/components/OptimizationResults';
import { useEdgebands, useMaterials, useServices, useEstimates } from '@/hooks/useEstimates';
import { formatCurrency } from '@/utils/estimateCalculator';
import { Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { EstimateForm } from './EstimateForm';
import { 
  EstimateFormData, 
  computeEstimatePreview, 
  checkEstimateNameExists,
  saveDraftEstimate,
  loadDraftEstimate,
  clearDraftEstimate
} from '@/lib/domain/estimate';

interface CreateEstimateDialogProps {
  pieces: PieceData[];
  trigger?: React.ReactNode;
}

export const CreateEstimateDialog = ({ pieces, trigger }: CreateEstimateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EstimateFormData>({
    name: '',
    clientName: '',
    clientEmail: '',
    notes: '',
    selectedMaterialId: '',
    selectedEdgebandId: '',
    profitMargin: 20,
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { materials } = useMaterials();
  const { edgebands } = useEdgebands();
  const { services } = useServices();
  const { createEstimate } = useEstimates();

  // Load draft on mount
  useEffect(() => {
    if (open) {
      const draft = loadDraftEstimate();
      if (draft) {
        setFormData(draft);
        toast({
          title: "Rascunho restaurado",
          description: "Restauramos seu último orçamento não finalizado.",
        });
      }
    }
  }, [open]);

  // Autosave draft
  useEffect(() => {
    if (open && (formData.name || formData.selectedMaterialId || formData.selectedEdgebandId)) {
      saveDraftEstimate(formData);
    }
  }, [formData, open]);

  // Preview do cálculo
  const calculationPreview = useMemo(() => {
    return computeEstimatePreview(formData, pieces, materials, edgebands, services);
  }, [formData, pieces, materials, edgebands, services]);

  const handleCreateEstimate = async (data: EstimateFormData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se já existe orçamento com o mesmo nome
    const nameExists = await checkEstimateNameExists(data.name, user.id);
    if (nameExists) {
      toast({
        title: "⚠️ Nome duplicado",
        description: "Já existe um orçamento com esse nome. Por favor, escolha outro nome.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const material = materials.find(m => m.id === data.selectedMaterialId);
      const edgeband = edgebands.find(e => e.id === data.selectedEdgebandId);

      if (!material || !edgeband) {
        toast({
          title: "Erro",
          description: "Material ou fita de borda não encontrados.",
          variant: "destructive",
        });
        return;
      }

      // Calcular orçamento usando a camada de domínio
      const calculation = computeEstimatePreview(data, pieces, materials, edgebands, services);
      
      if (!calculation) {
        toast({
          title: "Erro",
          description: "Não foi possível calcular o orçamento.",
          variant: "destructive",
        });
        return;
      }

      // Criar orçamento
      const newEstimate = await createEstimate({
        user_id: user.id,
        name: data.name,
        client_name: data.clientName || null,
        client_email: data.clientEmail || null,
        status: 'draft',
        profit_margin_percent: data.profitMargin,
        tax_percent: 0,
        discount_percent: 0,
        material_cost: calculation.material_cost,
        edgeband_cost: calculation.edgeband_cost,
        service_cost: calculation.service_cost,
        subtotal: calculation.subtotal,
        total: calculation.total,
        pieces_data: pieces,
        calculation_data: calculation,
        notes: data.notes || null,
      });

      // Limpar rascunho
      clearDraftEstimate();

      toast({
        title: "✅ Orçamento criado!",
        description: "O orçamento foi criado com sucesso.",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/estimates')}
          >
            Ver Orçamentos
          </Button>
        ),
      });

      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating estimate:', error);
      toast({
        title: "❌ Erro",
        description: "Ocorreu um erro ao criar o orçamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      clientName: '',
      clientEmail: '',
      notes: '',
      selectedMaterialId: '',
      selectedEdgebandId: '',
      profitMargin: 20,
    });
    clearDraftEstimate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Criar Orçamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Orçamento</DialogTitle>
          <DialogDescription>
            Crie um orçamento profissional a partir das {pieces.reduce((sum, p) => sum + p.quantity, 0)} peças convertidas.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <EstimateForm 
            defaultValues={formData}
            onSubmit={handleCreateEstimate}
            onValuesChange={setFormData}
          >
            {(form) => (
              <>
                {/* Preview do Cálculo */}
                {calculationPreview && (
                  <div className="bg-muted/50 rounded-2xl p-4 space-y-3 shadow-sm border border-border/50">
                    <p className="text-sm font-semibold">💰 Preview do Orçamento</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Material:</span>
                        <span className="font-medium">{formatCurrency(calculationPreview.material_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bordas:</span>
                        <span className="font-medium">{formatCurrency(calculationPreview.edgeband_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Serviços:</span>
                        <span className="font-medium">{formatCurrency(calculationPreview.service_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(calculationPreview.subtotal)}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border/50">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-base">Total:</span>
                        <span className="text-xl font-bold text-primary">{formatCurrency(calculationPreview.total)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">Lucro estimado:</span>
                        <span className="text-xs font-medium text-success">
                          {formatCurrency(calculationPreview.total - calculationPreview.subtotal)} ({formData.profitMargin}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !form.formState.isValid}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Criando..." : "Criar Orçamento"}
                  </Button>
                </div>
              </>
            )}
          </EstimateForm>
        </div>
      </DialogContent>
    </Dialog>
  );
};
