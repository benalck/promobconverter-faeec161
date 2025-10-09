import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Play, Save, Upload } from 'lucide-react';
import { useCuttingPlans, useCuttingItems } from '@/hooks/useCuttingPlans';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  optimizeCutting,
  validateItems,
  type CuttingItem as AlgorithmItem,
  type OptimizationConfig,
  type OptimizationResult,
} from '@/lib/cutting/algorithm';
import { CuttingPlanVisualization } from '@/components/cutting/CuttingPlanVisualization';
import { supabase } from '@/integrations/supabase/client';

export default function CuttingPlan() {
  const { user } = useAuth();
  const { createPlan, updatePlan } = useCuttingPlans();
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const { items, addItem, deleteItem } = useCuttingItems(currentPlanId);

  const [planName, setPlanName] = useState('');
  const [sheetWidth, setSheetWidth] = useState(2750);
  const [sheetHeight, setSheetHeight] = useState(1850);
  const [sheetThickness, setSheetThickness] = useState(18);
  const [cutMargin, setCutMargin] = useState(3);
  const [grainDirection, setGrainDirection] = useState<'horizontal' | 'vertical' | 'none'>('none');

  const [newItem, setNewItem] = useState({
    name: '',
    width: 0,
    height: 0,
    thickness: 18,
    quantity: 1,
    grainDirection: 'none' as 'horizontal' | 'vertical' | 'none',
  });

  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreatePlan = async () => {
    if (!planName.trim()) {
      toast.error('Digite um nome para o plano');
      return;
    }

    const plan = await createPlan({
      name: planName,
      sheet_width: sheetWidth,
      sheet_height: sheetHeight,
      sheet_thickness: sheetThickness,
      cut_margin: cutMargin,
      grain_direction: grainDirection,
      status: 'draft',
    });

    if (plan) {
      setCurrentPlanId(plan.id);
      toast.success('Plano criado! Adicione as peças.');
    }
  };

  const handleAddItem = async () => {
    if (!currentPlanId) {
      toast.error('Crie um plano primeiro');
      return;
    }

    if (!newItem.name.trim() || newItem.width <= 0 || newItem.height <= 0) {
      toast.error('Preencha todos os campos da peça');
      return;
    }

    await addItem({
      plan_id: currentPlanId,
      name: newItem.name,
      width: newItem.width,
      height: newItem.height,
      thickness: newItem.thickness,
      quantity: newItem.quantity,
      grain_direction: newItem.grainDirection,
    });

    setNewItem({
      name: '',
      width: 0,
      height: 0,
      thickness: sheetThickness,
      quantity: 1,
      grainDirection: 'none',
    });
  };

  const handleOptimize = async () => {
    if (!currentPlanId || items.length === 0) {
      toast.error('Adicione peças antes de otimizar');
      return;
    }

    // Check user credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user?.id)
      .single();

    if (!profile || profile.credits < 1) {
      toast.error('Créditos insuficientes para gerar plano de corte');
      return;
    }

    setIsProcessing(true);

    try {
      const algorithmItems: AlgorithmItem[] = items.map(item => ({
        id: item.id,
        name: item.name,
        width: item.width,
        height: item.height,
        thickness: item.thickness,
        quantity: item.quantity,
        grainDirection: item.grain_direction,
      }));

      const config: OptimizationConfig = {
        sheetWidth,
        sheetHeight,
        cutMargin,
        respectGrainDirection: grainDirection !== 'none',
      };

      // Validate items
      const validation = validateItems(algorithmItems, config);
      if (!validation.valid) {
        toast.error(validation.errors.join('\n'));
        return;
      }

      // Run optimization
      const result = optimizeCutting(algorithmItems, config);
      setOptimizationResult(result);

      // Save sheets to database
      for (const sheet of result.sheets) {
        await supabase.from('cutting_sheets').insert([{
          plan_id: currentPlanId,
          sheet_number: sheet.sheetNumber,
          layout_data: {
            items: sheet.items,
            freeRectangles: sheet.freeRectangles,
          } as any,
          utilization_percent: sheet.utilizationPercent,
        }]);
      }

      // Update plan with results
      await updatePlan(currentPlanId, {
        total_sheets: result.totalSheets,
        utilization_percent: result.totalUtilization,
        total_area: result.totalArea,
        used_area: result.usedArea,
        waste_area: result.wasteArea,
        status: 'completed',
      });

      // Deduct credit
      await supabase
        .from('profiles')
        .update({ credits: profile.credits - 1 })
        .eq('id', user?.id);

      toast.success(`Plano otimizado! ${result.totalSheets} chapas necessárias.`);
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Erro ao otimizar plano de corte');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Plano de Corte Inteligente</h2>
          <p className="text-muted-foreground mb-4">
            Faça login para acessar o otimizador de corte
          </p>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideHeader>
      <div className="space-y-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Plano de Corte Inteligente</h1>
            <p className="text-muted-foreground">
              Otimize o aproveitamento de chapas com algoritmo avançado
            </p>
          </div>
        </div>

        {/* Plan Configuration */}
        {!currentPlanId && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Novo Plano de Corte</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Plano</Label>
                <Input
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Ex: Armário Cozinha"
                />
              </div>

              <div className="space-y-2">
                <Label>Direção do Veio</Label>
                <Select value={grainDirection} onValueChange={(v: any) => setGrainDirection(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem preferência</SelectItem>
                    <SelectItem value="horizontal">Horizontal</SelectItem>
                    <SelectItem value="vertical">Vertical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Largura da Chapa (mm)</Label>
                <Input
                  type="number"
                  value={sheetWidth}
                  onChange={(e) => setSheetWidth(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Altura da Chapa (mm)</Label>
                <Input
                  type="number"
                  value={sheetHeight}
                  onChange={(e) => setSheetHeight(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Espessura (mm)</Label>
                <Input
                  type="number"
                  value={sheetThickness}
                  onChange={(e) => setSheetThickness(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Margem de Corte (mm)</Label>
                <Input
                  type="number"
                  value={cutMargin}
                  onChange={(e) => setCutMargin(Number(e.target.value))}
                />
              </div>
            </div>

            <Button onClick={handleCreatePlan} className="mt-6">
              <Save className="w-4 h-4 mr-2" />
              Criar Plano
            </Button>
          </Card>
        )}

        {/* Add Items */}
        {currentPlanId && (
          <>
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Adicionar Peças</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Ex: Prateleira"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Largura (mm)</Label>
                  <Input
                    type="number"
                    value={newItem.width || ''}
                    onChange={(e) => setNewItem({ ...newItem, width: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Altura (mm)</Label>
                  <Input
                    type="number"
                    value={newItem.height || ''}
                    onChange={(e) => setNewItem({ ...newItem, height: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Espessura (mm)</Label>
                  <Input
                    type="number"
                    value={newItem.thickness}
                    onChange={(e) => setNewItem({ ...newItem, thickness: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={handleAddItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Items Table */}
              {items.length > 0 && (
                <div className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Largura</TableHead>
                        <TableHead>Altura</TableHead>
                        <TableHead>Espessura</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Área Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.width}mm</TableCell>
                          <TableCell>{item.height}mm</TableCell>
                          <TableCell>{item.thickness}mm</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {((item.width * item.height * item.quantity) / 1000000).toFixed(2)} m²
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={handleOptimize}
                      disabled={isProcessing}
                      size="lg"
                    >
                      {isProcessing ? (
                        'Processando...'
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Otimizar Plano de Corte (1 crédito)
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Visualization */}
            {optimizationResult && (
              <CuttingPlanVisualization
                sheets={optimizationResult.sheets}
                sheetWidth={sheetWidth}
                sheetHeight={sheetHeight}
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
