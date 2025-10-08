import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useMaterials, useEdgebands, useServices } from '@/hooks/useEstimates';
import { formatCurrency } from '@/utils/estimateCalculator';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eraser } from 'lucide-react';

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

interface EstimateFormProps {
  defaultValues?: EstimateFormData;
  onSubmit: (data: EstimateFormData) => void;
  onValuesChange?: (data: EstimateFormData) => void;
  children?: (form: any) => React.ReactNode;
}

export const EstimateForm = ({ defaultValues, onSubmit, onValuesChange, children }: EstimateFormProps) => {
  const { materials, loading: materialsLoading } = useMaterials();
  const { edgebands, loading: edgebandsLoading } = useEdgebands();
  const { services, loading: servicesLoading } = useServices();

  const isDataLoading = materialsLoading || edgebandsLoading || servicesLoading;

  const form = useForm<EstimateFormData>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: defaultValues || {
      name: '',
      clientName: '',
      clientEmail: '',
      notes: '',
      selectedMaterialId: '',
      selectedEdgebandId: '',
      profitMargin: 20,
    },
  });

  // Watch form values and notify parent
  const watchedValues = form.watch();
  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(watchedValues);
    }
  }, [watchedValues, onValuesChange]);

  const handleClearForm = () => {
    form.reset({
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-muted-foreground">* Campos obrigatórios</p>
          <Button type="button" variant="ghost" size="sm" onClick={handleClearForm}>
            <Eraser className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        </div>

        {/* Nome do Orçamento */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Orçamento *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Cozinha Modulada - Cliente XYZ" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dados do Cliente */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="João Silva" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email do Cliente</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="joao@example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Seleção de Materiais */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="selectedMaterialId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material da Chapa *</FormLabel>
                {isDataLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o material" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name} - {formatCurrency(material.price_per_sqm)}/m²
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="selectedEdgebandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fita de Borda *</FormLabel>
                {isDataLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a fita" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {edgebands.map((edgeband) => (
                        <SelectItem key={edgeband.id} value={edgeband.id}>
                          {edgeband.name} - {formatCurrency(edgeband.price_per_meter)}/m
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Margem de Lucro */}
        <FormField
          control={form.control}
          name="profitMargin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Margem de Lucro (%)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  max="100"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Observações */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações adicionais sobre o orçamento..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {children && children(form)}
      </form>
    </Form>
  );
};
