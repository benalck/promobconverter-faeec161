import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PieceData } from '@/components/OptimizationResults';
import { useEdgebands, useMaterials, useServices, useEstimates } from '@/hooks/useEstimates';
import { calculateEstimate, formatCurrency } from '@/utils/estimateCalculator';
import { Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { EstimateForm, EstimateFormData, estimateFormSchema } from './EstimateForm';

interface CreateEstimateDialogProps {
  pieces: PieceData[];
  trigger?: React.ReactNode;
}

export const CreateEstimateDialog = ({ pieces, trigger }: CreateEstimateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
  const { materials } = useMaterials();
  const { edgebands } = useEdgebands();
  const { services } = useServices();
  const { createEstimate } = useEstimates();

  // Preview do cálculo
  const calculationPreview = useMemo(() => {
    if (!formData.selectedMaterialId || !formData.selectedEdgebandId) return null;

    const material = materials.find(m => m.id === formData.selectedMaterialId);
    const edgeband = edgebands.find(e => e.id === formData.selectedEdgebandId);

    if (!material || !edgeband) return null;

    return calculateEstimate({
      pieces,
      material,
      edgeband,
      services,
      profitMargin: formData.profitMargin,
      taxPercent: 0,
      discountPercent: 0,
    });
  }, [formData.selectedMaterialId, formData.selectedEdgebandId, formData.profitMargin, materials, edgebands, services, pieces]);

  const handleCreateEstimate = async () => {
    // Validação com Zod
    const validation = estimateFormSchema.safeParse(formData);
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os campos destacados.",
        variant: "destructive",
      });
      return;
    }

    setErrors({});

    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const material = materials.find(m => m.id === formData.selectedMaterialId);
      const edgeband = edgebands.find(e => e.id === formData.selectedEdgebandId);

      if (!material || !edgeband) return;

      // Calcular orçamento
      const calculation = calculateEstimate({
        pieces,
        material,
        edgeband,
        services,
        profitMargin: formData.profitMargin,
        taxPercent: 0,
        discountPercent: 0,
      });

      // Criar orçamento
      await createEstimate({
        user_id: user.id,
        name: formData.name,
        client_name: formData.clientName || null,
        client_email: formData.clientEmail || null,
        status: 'draft',
        profit_margin_percent: formData.profitMargin,
        tax_percent: 0,
        discount_percent: 0,
        material_cost: calculation.material_cost,
        edgeband_cost: calculation.edgeband_cost,
        service_cost: calculation.service_cost,
        subtotal: calculation.subtotal,
        total: calculation.total,
        pieces_data: pieces,
        calculation_data: calculation,
        notes: formData.notes || null,
      });

      toast({
        title: "Orçamento criado!",
        description: "O orçamento foi criado com sucesso.",
      });

      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating estimate:', error);
      toast({
        title: "Erro",
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
    setErrors({});
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
          <EstimateForm value={formData} onChange={setFormData} errors={errors} />
        </div>

        {/* Preview do Cálculo */}
        {calculationPreview && (
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Preview do Orçamento</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Material:</span>
                <span className="ml-2 font-medium">{formatCurrency(calculationPreview.material_cost)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Bordas:</span>
                <span className="ml-2 font-medium">{formatCurrency(calculationPreview.edgeband_cost)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Serviços:</span>
                <span className="ml-2 font-medium">{formatCurrency(calculationPreview.service_cost)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="ml-2 font-medium">{formatCurrency(calculationPreview.subtotal)}</span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(calculationPreview.total)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lucro: {formatCurrency(calculationPreview.total - calculationPreview.subtotal)} ({formData.profitMargin}%)
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateEstimate}
            disabled={loading || !formData.name || !formData.selectedMaterialId || !formData.selectedEdgebandId}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Orçamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
