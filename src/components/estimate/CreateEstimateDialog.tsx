import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieceData } from '@/components/OptimizationResults';
import { useMaterials, useEdgebands, useServices, useEstimates } from '@/hooks/useEstimates';
import { calculateEstimate, formatCurrency } from '@/utils/estimateCalculator';
import { Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CreateEstimateDialogProps {
  pieces: PieceData[];
  trigger?: React.ReactNode;
}

export const CreateEstimateDialog = ({ pieces, trigger }: CreateEstimateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedEdgebandId, setSelectedEdgebandId] = useState('');
  const [profitMargin, setProfitMargin] = useState(20);
  
  const { user } = useAuth();
  const { materials, loading: materialsLoading } = useMaterials();
  const { edgebands, loading: edgebandsLoading } = useEdgebands();
  const { services, loading: servicesLoading } = useServices();
  const { createEstimate } = useEstimates();

  const handleCreateEstimate = async () => {
    if (!name || !selectedMaterialId || !selectedEdgebandId || !user) {
      return;
    }

    setLoading(true);

    try {
      const material = materials.find(m => m.id === selectedMaterialId);
      const edgeband = edgebands.find(e => e.id === selectedEdgebandId);

      if (!material || !edgeband) return;

      // Calcular orçamento
      const calculation = calculateEstimate({
        pieces,
        material,
        edgeband,
        services,
        profitMargin,
        taxPercent: 0,
        discountPercent: 0,
      });

      // Criar orçamento
      await createEstimate({
        user_id: user.id,
        name,
        client_name: clientName || null,
        client_email: clientEmail || null,
        status: 'draft',
        profit_margin_percent: profitMargin,
        tax_percent: 0,
        discount_percent: 0,
        material_cost: calculation.material_cost,
        edgeband_cost: calculation.edgeband_cost,
        service_cost: calculation.service_cost,
        subtotal: calculation.subtotal,
        total: calculation.total,
        pieces_data: pieces,
        calculation_data: calculation,
        notes: notes || null,
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
    setName('');
    setClientName('');
    setClientEmail('');
    setNotes('');
    setSelectedMaterialId('');
    setSelectedEdgebandId('');
    setProfitMargin(20);
  };

  const isDataLoading = materialsLoading || edgebandsLoading || servicesLoading;

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

        <div className="space-y-4 py-4">
          {/* Nome do Orçamento */}
          <div>
            <Label htmlFor="name">Nome do Orçamento *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Cozinha Modulada - Cliente XYZ"
            />
          </div>

          {/* Dados do Cliente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="João Silva"
              />
            </div>
            <div>
              <Label htmlFor="clientEmail">Email do Cliente</Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="joao@example.com"
              />
            </div>
          </div>

          {/* Seleção de Materiais */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="material">Material da Chapa *</Label>
              {isDataLoading ? (
                <div className="flex items-center justify-center h-10 border rounded">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} - {formatCurrency(material.price_per_sqm)}/m²
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="edgeband">Fita de Borda *</Label>
              {isDataLoading ? (
                <div className="flex items-center justify-center h-10 border rounded">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Select value={selectedEdgebandId} onValueChange={setSelectedEdgebandId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a fita" />
                  </SelectTrigger>
                  <SelectContent>
                    {edgebands.map((edgeband) => (
                      <SelectItem key={edgeband.id} value={edgeband.id}>
                        {edgeband.name} - {formatCurrency(edgeband.price_per_meter)}/m
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Margem de Lucro */}
          <div>
            <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
            <Input
              id="profitMargin"
              type="number"
              value={profitMargin}
              onChange={(e) => setProfitMargin(Number(e.target.value))}
              min="0"
              max="100"
            />
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais sobre o orçamento..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateEstimate}
            disabled={loading || !name || !selectedMaterialId || !selectedEdgebandId || isDataLoading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Orçamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
