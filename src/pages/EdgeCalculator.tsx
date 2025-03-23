
import React, { useState, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Calculator, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface Panel {
  id: number;
  description: string;
  width: number;
  height: number;
  quantity: number;
  edgeTop: boolean;
  edgeBottom: boolean;
  edgeLeft: boolean;
  edgeRight: boolean;
}

interface EdgeResult {
  totalEdgeLength: number;
  edgeLengthByPanel: Record<number, {
    panel: Panel;
    edgeLength: number;
  }>;
  totalEdgeRolls: number;
  wastage: number;
}

const EdgeCalculator: React.FC = () => {
  const [panels, setPanels] = useState<Panel[]>([
    { 
      id: 1, 
      description: "Lateral", 
      width: 600, 
      height: 800, 
      quantity: 2,
      edgeTop: true,
      edgeBottom: true,
      edgeLeft: false,
      edgeRight: true
    },
  ]);
  const [rollLength, setRollLength] = useState<number>(50000); // Default 50m in mm
  const [result, setResult] = useState<EdgeResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const addPanel = useCallback(() => {
    const newId = panels.length > 0 ? Math.max(...panels.map(p => p.id)) + 1 : 1;
    setPanels([...panels, { 
      id: newId, 
      description: "", 
      width: 0, 
      height: 0, 
      quantity: 1,
      edgeTop: false,
      edgeBottom: false,
      edgeLeft: false,
      edgeRight: false
    }]);
  }, [panels]);

  const removePanel = useCallback((id: number) => {
    setPanels(panels.filter(p => p.id !== id));
  }, [panels]);

  const updatePanel = useCallback((id: number, field: keyof Panel, value: string | number | boolean) => {
    setPanels(panels.map(p => {
      if (p.id === id) {
        if (typeof value === 'string' && ['width', 'height', 'quantity'].includes(field)) {
          return { ...p, [field]: parseInt(value) || 0 };
        }
        return { ...p, [field]: value };
      }
      return p;
    }));
  }, [panels]);

  const calculateEdgeBanding = useCallback(() => {
    if (!user) {
      toast({
        title: "Acesso Restrito",
        description: "Você precisa estar logado para usar esta funcionalidade.",
        variant: "destructive",
      });
      navigate("/register");
      return;
    }

    // Validate inputs
    const hasInvalidPanels = panels.some(p => !p.description || p.width <= 0 || p.height <= 0 || p.quantity <= 0);
    if (hasInvalidPanels) {
      toast({
        title: "Dados Inválidos",
        description: "Por favor, preencha todas as informações dos painéis corretamente.",
        variant: "destructive",
      });
      return;
    }

    if (rollLength <= 0) {
      toast({
        title: "Dados Inválidos",
        description: "O comprimento do rolo deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    // Simple timeout to simulate calculation
    setTimeout(() => {
      const edgeLengthByPanel: EdgeResult['edgeLengthByPanel'] = {};
      let totalEdgeLength = 0;

      // Calculate edge banding required for each panel
      panels.forEach(panel => {
        let panelEdgeLength = 0;
        
        // For each panel, calculate the edge banding required
        if (panel.edgeTop) panelEdgeLength += panel.width;
        if (panel.edgeBottom) panelEdgeLength += panel.width;
        if (panel.edgeLeft) panelEdgeLength += panel.height;
        if (panel.edgeRight) panelEdgeLength += panel.height;
        
        // Multiply by quantity
        panelEdgeLength *= panel.quantity;
        
        // Add to the total
        totalEdgeLength += panelEdgeLength;
        
        // Store the result
        edgeLengthByPanel[panel.id] = {
          panel,
          edgeLength: panelEdgeLength
        };
      });

      // Calculate rolls needed (adding 10% waste allowance)
      const lengthWithWastage = totalEdgeLength * 1.1;
      const rollsNeeded = Math.ceil(lengthWithWastage / rollLength);
      const wastage = rollsNeeded * rollLength - totalEdgeLength;
      const wastagePercentage = (wastage / (rollsNeeded * rollLength)) * 100;

      // Set the result
      setResult({
        totalEdgeLength,
        edgeLengthByPanel,
        totalEdgeRolls: rollsNeeded,
        wastage: Math.round(wastagePercentage * 100) / 100
      });

      setIsCalculating(false);
    }, 1000);
  }, [panels, rollLength, user, toast, navigate]);

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-center my-6 text-blue-700">
          Calculadora de Fita de Borda
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle>Configuração do Rolo</CardTitle>
                <CardDescription>
                  Informe o comprimento do rolo de fita de borda
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="roll-length">Comprimento do Rolo (mm)</Label>
                    <Input
                      id="roll-length"
                      type="number"
                      value={rollLength}
                      onChange={(e) => setRollLength(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Padrão: 50.000mm (50 metros)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Painéis</CardTitle>
                    <CardDescription>
                      Adicione os painéis que precisam de fita de borda
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={addPanel} 
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Adicionar Painel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[20%]">Descrição</TableHead>
                      <TableHead className="w-[15%]">Largura (mm)</TableHead>
                      <TableHead className="w-[15%]">Altura (mm)</TableHead>
                      <TableHead className="w-[10%]">Qtd</TableHead>
                      <TableHead className="w-[30%]" colSpan={4}>Bordas</TableHead>
                      <TableHead className="w-[10%]">Ações</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead colSpan={4}></TableHead>
                      <TableHead className="text-center">Superior</TableHead>
                      <TableHead className="text-center">Inferior</TableHead>
                      <TableHead className="text-center">Esquerda</TableHead>
                      <TableHead className="text-center">Direita</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {panels.map((panel) => (
                      <TableRow key={panel.id}>
                        <TableCell>
                          <Input
                            value={panel.description}
                            onChange={(e) => updatePanel(panel.id, 'description', e.target.value)}
                            placeholder="Ex: Lateral, Base, etc."
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={panel.width || ''}
                            onChange={(e) => updatePanel(panel.id, 'width', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={panel.height || ''}
                            onChange={(e) => updatePanel(panel.id, 'height', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={panel.quantity || ''}
                            onChange={(e) => updatePanel(panel.id, 'quantity', e.target.value)}
                            min={1}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={panel.edgeTop}
                            onChange={(e) => updatePanel(panel.id, 'edgeTop', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={panel.edgeBottom}
                            onChange={(e) => updatePanel(panel.id, 'edgeBottom', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={panel.edgeLeft}
                            onChange={(e) => updatePanel(panel.id, 'edgeLeft', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={panel.edgeRight}
                            onChange={(e) => updatePanel(panel.id, 'edgeRight', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePanel(panel.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {panels.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          Nenhum painel adicionado. Clique em "Adicionar Painel" para começar.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                <Button
                  onClick={calculateEdgeBanding}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                  disabled={isCalculating || panels.length === 0}
                >
                  {isCalculating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Calculando...</span>
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      <span>Calcular Fita de Borda Necessária</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle>Resultado do Cálculo</CardTitle>
                <CardDescription>
                  Quantidade de fita de borda necessária
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-green-600 font-medium">Total de Fita Necessária</p>
                        <p className="text-2xl font-bold text-green-700">
                          {(result.totalEdgeLength / 1000).toFixed(2)} metros
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-blue-600 font-medium">Rolos Necessários</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {result.totalEdgeRolls}
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          ({(rollLength / 1000).toFixed(0)}m por rolo)
                        </p>
                      </div>
                      
                      <div className="bg-amber-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-amber-600 font-medium">Estimativa de Desperdício</p>
                        <p className="text-2xl font-bold text-amber-700">
                          {result.wastage}%
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-3">Detalhamento por Painel</h4>
                      <div className="space-y-2">
                        {Object.values(result.edgeLengthByPanel).map(({ panel, edgeLength }) => (
                          <div key={panel.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="font-medium text-sm">
                                  {panel.description} ({panel.quantity}x)
                                </h5>
                                <p className="text-xs text-gray-500">
                                  {panel.width}mm × {panel.height}mm
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">
                                  {(edgeLength / 1000).toFixed(2)} m
                                </p>
                                <div className="flex text-xs space-x-1">
                                  {panel.edgeTop && <span className="bg-blue-100 px-1 rounded">Sup</span>}
                                  {panel.edgeBottom && <span className="bg-blue-100 px-1 rounded">Inf</span>}
                                  {panel.edgeLeft && <span className="bg-blue-100 px-1 rounded">Esq</span>}
                                  {panel.edgeRight && <span className="bg-blue-100 px-1 rounded">Dir</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center text-blue-700">
                        <CheckCircle className="h-4 w-4 mr-1" /> Dicas
                      </h4>
                      <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                        <li>Adicione 10% extra para compensar erros de corte</li>
                        <li>Verifique a largura da fita compatível com a espessura da chapa</li>
                        <li>Compre um pouco mais para ter reserva</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calculator className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Sem Resultados</h3>
                    <p className="text-gray-500 text-sm">
                      Adicione seus painéis e clique em "Calcular" para ver a quantidade de fita de borda necessária.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EdgeCalculator;
