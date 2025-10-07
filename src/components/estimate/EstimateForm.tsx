import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMaterials, useEdgebands, useServices } from '@/hooks/useEstimates';
import { formatCurrency } from '@/utils/estimateCalculator';
import { Loader2 } from 'lucide-react';

export interface EstimateFormData {
  name: string;
  clientName: string;
  clientEmail: string;
  notes: string;
  selectedMaterialId: string;
  selectedEdgebandId: string;
  profitMargin: number;
}

interface EstimateFormProps {
  value: EstimateFormData;
  onChange: (data: EstimateFormData) => void;
}

export const EstimateForm = ({ value, onChange }: EstimateFormProps) => {
  const { materials, loading: materialsLoading } = useMaterials();
  const { edgebands, loading: edgebandsLoading } = useEdgebands();
  const { services, loading: servicesLoading } = useServices();

  const isDataLoading = materialsLoading || edgebandsLoading || servicesLoading;

  const updateField = (field: keyof EstimateFormData, newValue: any) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <div className="space-y-4">
      {/* Nome do Orçamento */}
      <div>
        <Label htmlFor="name">Nome do Orçamento *</Label>
        <Input
          id="name"
          value={value.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Ex: Cozinha Modulada - Cliente XYZ"
        />
      </div>

      {/* Dados do Cliente */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientName">Nome do Cliente</Label>
          <Input
            id="clientName"
            value={value.clientName}
            onChange={(e) => updateField('clientName', e.target.value)}
            placeholder="João Silva"
          />
        </div>
        <div>
          <Label htmlFor="clientEmail">Email do Cliente</Label>
          <Input
            id="clientEmail"
            type="email"
            value={value.clientEmail}
            onChange={(e) => updateField('clientEmail', e.target.value)}
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
            <Select value={value.selectedMaterialId} onValueChange={(val) => updateField('selectedMaterialId', val)}>
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
            <Select value={value.selectedEdgebandId} onValueChange={(val) => updateField('selectedEdgebandId', val)}>
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
          value={value.profitMargin}
          onChange={(e) => updateField('profitMargin', Number(e.target.value))}
          min="0"
          max="100"
        />
      </div>

      {/* Observações */}
      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={value.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Observações adicionais sobre o orçamento..."
          rows={3}
        />
      </div>
    </div>
  );
};
