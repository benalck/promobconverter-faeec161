import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useMaterials, useEdgebands, useServices } from '@/hooks/useEstimates';
import { formatCurrency } from '@/utils/estimateCalculator';
import { z } from 'zod';

export const estimateFormSchema = z.object({
  name: z.string().min(3, "Digite um nome válido para o orçamento (mínimo 3 caracteres)"),
  clientName: z.string().optional(),
  clientEmail: z.string().email("E-mail inválido").or(z.literal('')).optional(),
  notes: z.string().optional(),
  selectedMaterialId: z.string().min(1, "Selecione um material"),
  selectedEdgebandId: z.string().min(1, "Selecione uma fita de borda"),
  profitMargin: z.number().min(0, "Margem deve ser no mínimo 0%").max(100, "Margem deve ser no máximo 100%"),
});

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
  errors?: Record<string, string>;
}

export const EstimateForm = ({ value, onChange, errors = {} }: EstimateFormProps) => {
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
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
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
            className={errors.clientEmail ? 'border-destructive' : ''}
          />
          {errors.clientEmail && <p className="text-sm text-destructive mt-1">{errors.clientEmail}</p>}
        </div>
      </div>

      {/* Seleção de Materiais */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="material">Material da Chapa *</Label>
          {isDataLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={value.selectedMaterialId} onValueChange={(val) => updateField('selectedMaterialId', val)}>
              <SelectTrigger className={errors.selectedMaterialId ? 'border-destructive' : ''}>
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
          {errors.selectedMaterialId && <p className="text-sm text-destructive mt-1">{errors.selectedMaterialId}</p>}
        </div>

        <div>
          <Label htmlFor="edgeband">Fita de Borda *</Label>
          {isDataLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={value.selectedEdgebandId} onValueChange={(val) => updateField('selectedEdgebandId', val)}>
              <SelectTrigger className={errors.selectedEdgebandId ? 'border-destructive' : ''}>
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
          {errors.selectedEdgebandId && <p className="text-sm text-destructive mt-1">{errors.selectedEdgebandId}</p>}
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
          className={errors.profitMargin ? 'border-destructive' : ''}
        />
        {errors.profitMargin && <p className="text-sm text-destructive mt-1">{errors.profitMargin}</p>}
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
