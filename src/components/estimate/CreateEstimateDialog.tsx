import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PieceData } from '@/components/OptimizationResults';
import { useEdgebands, useMaterials, useServices, useEstimates } from '@/hooks/useEstimates';
import { calculateEstimate } from '@/utils/estimateCalculator';
import { Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EstimateForm, EstimateFormData } from './EstimateForm';

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
  const { materials } = useMaterials();
  const { edgebands } = useEdgebands();
  const { services } = useServices();
  const { createEstimate } = useEstimates();

  const handleCreateEstimate = async () => {
    if (!formData.name || !formData.selectedMaterialId || !formData.selectedEdgebandId || !user) {
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

      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating estimate:', error);
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
          <EstimateForm value={formData} onChange={setFormData} />
        </div>

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
