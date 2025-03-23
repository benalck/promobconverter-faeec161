
import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowRight, CheckCircle, Scissors, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "./FileUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { convertXMLToCSV } from "@/utils/xmlParser";
import { generateHtmlPrefix, generateHtmlSuffix } from "@/utils/xmlConverter";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import BannedMessage from "./BannedMessage";
import { useTrackConversion } from "@/hooks/useTrackConversion";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertCircle } from "lucide-react";
import { extractPiecesFromXml, calculateEdgeLength } from "@/utils/extractPiecesFromXml";

// Interfaces para a funcionalidade de otimização de corte
interface Piece {
  id: number;
  description: string;
  width: number;
  height: number;
  quantity: number;
}

interface Sheet {
  width: number;
  height: number;
}

interface OptimizationResult {
  wastePercentage: number;
  usedSheets: number;
  unusedArea: number;
  totalArea: number;
  pieceDistribution: {
    sheetIndex: number;
    pieces: {
      id: number;
      description: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }[];
  }[];
}

interface ConverterFormProps {
  className?: string;
}

const ConverterForm: React.FC<ConverterFormProps> = ({ className }) => {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [xmlContent, setXmlContent] = useState<string>("");
  const [outputFileName, setOutputFileName] = useState("plano_de_corte_promob");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackConversion, trackToolUsage } = useTrackConversion();
  const isMobile = useIsMobile();

  // Estados para a otimização de corte
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [sheet, setSheet] = useState<Sheet>({ width: 2750, height: 1830 });
  const [cutResult, setCutResult] = useState<OptimizationResult | null>(null);
  const [showCutOptimizer, setShowCutOptimizer] = useState(false);
  
  // Estados para o cálculo de fita de borda
  const [edgeCalculation, setEdgeCalculation] = useState<{
    edgeBottom: number;
    edgeTop: number;
    edgeLeft: number;
    edgeRight: number;
    totalEdge: number;
  } | null>(null);
  const [showEdgeCalculation, setShowEdgeCalculation] = useState(false);

  // Função auxiliar para ler arquivo como texto - usando useCallback para melhor performance
  const readFileAsText = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          resolve(e.target.result);
        } else {
          reject(new Error("Falha ao ler o arquivo como texto"));
        }
      };
      reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
      reader.readAsText(file);
    });
  }, []);

  // Função para extrair e processar os dados avançados do arquivo XML
  const processXmlForAdvancedFeatures = useCallback(async (fileContent: string) => {
    try {
      // Extrair peças para o otimizador de corte
      const extractedPieces = extractPiecesFromXml(fileContent);
      setPieces(extractedPieces);
      
      // Calcular comprimento da fita de borda
      const edgeResults = calculateEdgeLength(fileContent);
      setEdgeCalculation(edgeResults);
      
      // Mostrar as funcionalidades extras se houver dados válidos
      setShowCutOptimizer(extractedPieces.length > 0);
      setShowEdgeCalculation(edgeResults.totalEdge > 0);
      
      // Registrar uso de ferramentas
      await Promise.all([
        trackToolUsage("cut_optimizer"),
        trackToolUsage("edge_calculator")
      ]);
      
    } catch (error) {
      console.error("Erro ao processar dados avançados do XML:", error);
    }
  }, [trackToolUsage]);

  if (user?.isBanned) {
    return <BannedMessage />;
  }

  const handleFileSelect = useCallback(async (file: File) => {
    setXmlFile(file);
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setOutputFileName(fileName);
    // Reset conversion status when a new file is selected
    setConversionSuccess(false);
    
    try {
      // Ler o conteúdo do arquivo para processamento
      const content = await readFileAsText(file);
      setXmlContent(content);
      
      // Processar dados para recursos avançados
      await processXmlForAdvancedFeatures(content);
    } catch (error) {
      console.error("Erro ao ler o arquivo:", error);
    }
  }, [readFileAsText, processXmlForAdvancedFeatures]);

  // Função para calcular a otimização de corte
  const calculateCutOptimization = useCallback(() => {
    if (pieces.length === 0) {
      toast({
        title: "Nenhuma peça disponível",
        description: "Não foi possível extrair peças do arquivo XML.",
        variant: "destructive",
      });
      return;
    }

    // Simular algoritmo de otimização (simplificado)
    // Expand pieces based on quantity
    const expandedPieces = pieces.flatMap(piece => 
      Array(piece.quantity).fill(0).map((_, i) => ({
        id: piece.id * 100 + i,
        description: piece.description,
        width: piece.width,
        height: piece.height
      }))
    );
    
    // Sort pieces by height (descending)
    expandedPieces.sort((a, b) => b.height - a.height);
    
    const distribution: OptimizationResult['pieceDistribution'] = [];
    let currentSheet = 0;
    let usedArea = 0;
    let totalSheetArea = 0;
    
    // Simple algorithm: place pieces from left to right, top to bottom
    while (expandedPieces.length > 0) {
      distribution[currentSheet] = distribution[currentSheet] || { sheetIndex: currentSheet, pieces: [] };
      totalSheetArea += sheet.width * sheet.height;
      
      // Create a simple grid to track used space
      const grid = Array(Math.ceil(sheet.height / 10)).fill(0).map(() => Array(Math.ceil(sheet.width / 10)).fill(false));
      
      // Place each piece
      let placedAnyPiece = false;
      
      for (let i = 0; i < expandedPieces.length; i++) {
        const piece = expandedPieces[i];
        
        // Find a spot for this piece
        let placed = false;
        for (let y = 0; y <= sheet.height - piece.height; y += 10) {
          for (let x = 0; x <= sheet.width - piece.width; x += 10) {
            // Check if this spot is available
            let canPlace = true;
            for (let py = 0; py < Math.ceil(piece.height / 10); py++) {
              for (let px = 0; px < Math.ceil(piece.width / 10); px++) {
                if (grid[Math.floor(y / 10) + py]?.[Math.floor(x / 10) + px]) {
                  canPlace = false;
                  break;
                }
              }
              if (!canPlace) break;
            }
            
            if (canPlace) {
              // Mark this area as used
              for (let py = 0; py < Math.ceil(piece.height / 10); py++) {
                for (let px = 0; px < Math.ceil(piece.width / 10); px++) {
                  if (grid[Math.floor(y / 10) + py] && grid[Math.floor(y / 10) + py][Math.floor(x / 10) + px] !== undefined) {
                    grid[Math.floor(y / 10) + py][Math.floor(x / 10) + px] = true;
                  }
                }
              }
              
              // Add this piece to the current sheet
              distribution[currentSheet].pieces.push({
                id: piece.id,
                description: piece.description,
                x: x,
                y: y,
                width: piece.width,
                height: piece.height
              });
              
              usedArea += piece.width * piece.height;
              placed = true;
              placedAnyPiece = true;
              break;
            }
          }
          if (placed) break;
        }
        
        // If we placed the piece, remove it from the list
        if (placed) {
          expandedPieces.splice(i, 1);
          i--; // Adjust index after removal
        }
      }
      
      // If we couldn't place any more pieces on this sheet, move to the next one
      if (!placedAnyPiece) {
        currentSheet++;
      }
    }
    
    const totalArea = (currentSheet + 1) * sheet.width * sheet.height;
    const unusedArea = totalArea - usedArea;
    const wastePercentage = (unusedArea / totalArea) * 100;
    
    // Set the results
    setCutResult({
      wastePercentage: Math.round(wastePercentage * 100) / 100,
      usedSheets: currentSheet + 1,
      unusedArea: Math.round(unusedArea),
      totalArea: Math.round(totalArea),
      pieceDistribution: distribution
    });
    
    toast({
      title: "Otimização de corte calculada",
      description: `Foram identificadas ${pieces.length} peças. Plano de corte otimizado com ${currentSheet + 1} chapas e ${Math.round(wastePercentage)}% de desperdício.`,
      variant: "default",
    });
  }, [pieces, sheet, toast]);

  const handleConvert = useCallback(async () => {
    if (!xmlFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, faça upload de um arquivo XML para converter.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Usuário não autenticado",
        description: "Você precisa estar logado para converter arquivos.",
        variant: "destructive",
      });
      navigate("/register");
      return;
    }

    setIsConverting(true);
    setConversionSuccess(false);
    
    // Variáveis para registrar a conversão
    const startTime = Date.now();
    let success = false;
    let errorMsg = '';
    let fileSize = xmlFile.size;

    try {
      // 1. Converter o arquivo
      const xmlContent = await readFileAsText(xmlFile);
      const csvString = convertXMLToCSV(xmlContent);
      const htmlPrefix = generateHtmlPrefix();
      const htmlSuffix = generateHtmlSuffix();

      // 2. Criar e baixar o arquivo Excel
      const blob = new Blob([htmlPrefix + csvString + htmlSuffix], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${outputFileName}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Marcar como sucesso
      success = true;
      setConversionSuccess(true);

      // Mostrar sucesso
      toast({
        title: "Conversão concluída",
        description: "Seu arquivo foi convertido com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro durante a conversão:", error);
      success = false;
      errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
      
      toast({
        title: "Erro na conversão",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar o arquivo XML.",
        variant: "destructive",
      });
    } finally {
      // Calcular tempo de conversão
      const endTime = Date.now();
      const conversionTime = endTime - startTime;
      
      console.log('Registrando dados de conversão:', {
        inputFormat: 'XML',
        outputFormat: 'Excel',
        fileSize,
        conversionTime,
        success,
        errorMessage: errorMsg
      });
      
      // Registrar a conversão no banco de dados usando o hook
      try {
        const result = await trackConversion({
          inputFormat: 'XML',
          outputFormat: 'Excel',
          fileSize,
          conversionTime,
          success,
          errorMessage: errorMsg
        });
        
        console.log('Resultado do registro de conversão:', result);
      } catch (trackError) {
        console.error('Erro ao registrar a conversão:', trackError);
      }
      
      setIsConverting(false);
    }
  }, [xmlFile, outputFileName, user, navigate, readFileAsText, toast, trackConversion]);

  return (
    <>
      <Card className={cn("w-full border border-gray-200 shadow-lg", className)}>
        <CardHeader className={cn(
          "rounded-t-lg border-b border-gray-100",
          isMobile ? "px-4 py-4" : "bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6"
        )}>
          <CardTitle className={cn(
            "text-blue-700",
            isMobile ? "text-lg" : "text-xl"
          )}>
            Conversor Promob
          </CardTitle>
          <CardDescription className="text-indigo-600 text-sm sm:text-base">
            Transforme arquivos XML Promob em planos de corte Excel com formatação profissional em segundos
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(
          isMobile ? "p-4 space-y-4" : "pt-6 px-6 space-y-5"
        )}>
          <div className="space-y-4 sm:space-y-5">
            <FileUpload
              onFileSelect={handleFileSelect}
              accept=".xml"
              isDisabled={isConverting}
              maxSize={200}
            />

            <div>
              <Label htmlFor="output-name" className="text-sm font-medium text-gray-700">
                Nome do arquivo de saída
              </Label>
              <Input
                id="output-name"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                disabled={isConverting}
              />
            </div>

            {conversionSuccess && !isConverting && (
              <div className="rounded-md bg-green-50 p-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-sm text-green-700">Conversão realizada com sucesso!</p>
              </div>
            )}

            {/* Informações da otimização de corte (exibidas automaticamente se disponíveis) */}
            {showCutOptimizer && pieces.length > 0 && (
              <div className="mt-4 p-4 border border-blue-100 rounded-md bg-blue-50">
                <div className="flex items-center mb-2">
                  <Scissors className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-sm font-medium text-blue-700">Otimização de Corte Automática</h3>
                </div>
                <p className="text-xs text-blue-600 mb-2">
                  Identificamos {pieces.length} peças para corte no seu arquivo XML.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 bg-white rounded border border-blue-200">
                    <p className="text-xs text-gray-600">Dimensão da Chapa</p>
                    <p className="text-sm font-medium">{sheet.width} x {sheet.height} mm</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-blue-200">
                    <p className="text-xs text-gray-600">Total de Peças</p>
                    <p className="text-sm font-medium">
                      {pieces.reduce((sum, piece) => sum + piece.quantity, 0)} peças
                    </p>
                  </div>
                </div>
                
                {cutResult && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-xs text-gray-600">Chapas Necessárias</p>
                      <p className="text-sm font-medium text-green-700">{cutResult.usedSheets}</p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded border border-amber-200">
                      <p className="text-xs text-gray-600">Desperdício</p>
                      <p className="text-sm font-medium text-amber-700">{cutResult.wastePercentage}%</p>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={calculateCutOptimization} 
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-xs"
                  size="sm"
                  variant="secondary"
                >
                  {cutResult ? "Recalcular Otimização" : "Calcular Otimização de Corte"}
                </Button>
              </div>
            )}
            
            {/* Informações do cálculo de fita de borda (exibidas automaticamente se disponíveis) */}
            {showEdgeCalculation && edgeCalculation && edgeCalculation.totalEdge > 0 && (
              <div className="mt-4 p-4 border border-emerald-100 rounded-md bg-emerald-50">
                <div className="flex items-center mb-2">
                  <Ruler className="h-5 w-5 text-emerald-500 mr-2" />
                  <h3 className="text-sm font-medium text-emerald-700">Cálculo de Fita de Borda</h3>
                </div>
                <p className="text-xs text-emerald-600 mb-3">
                  Calculamos automaticamente a quantidade de fita de borda necessária:
                </p>
                
                <div className="bg-white p-3 rounded-md border border-emerald-200">
                  <div className="flex justify-between text-xs border-b border-gray-100 pb-1 mb-1">
                    <span className="text-gray-600">Borda Inferior:</span>
                    <span className="font-medium">{edgeCalculation.edgeBottom} metros</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-gray-100 pb-1 mb-1">
                    <span className="text-gray-600">Borda Superior:</span>
                    <span className="font-medium">{edgeCalculation.edgeTop} metros</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-gray-100 pb-1 mb-1">
                    <span className="text-gray-600">Borda Esquerda:</span>
                    <span className="font-medium">{edgeCalculation.edgeLeft} metros</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-gray-100 pb-1 mb-1">
                    <span className="text-gray-600">Borda Direita:</span>
                    <span className="font-medium">{edgeCalculation.edgeRight} metros</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium mt-2 pt-1 border-t border-gray-200">
                    <span className="text-emerald-700">Total de Fita:</span>
                    <span className="text-emerald-700">{edgeCalculation.totalEdge} metros</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className={cn(
                "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-300 group relative overflow-hidden",
                isMobile ? "text-sm" : "",
                conversionSuccess && !isConverting ? "from-green-600 to-green-500 hover:from-green-700 hover:to-green-600" : ""
              )}
              onClick={handleConvert}
              disabled={isConverting || !xmlFile}
            >
              <span className="flex items-center justify-center">
                {isConverting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    {conversionSuccess ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Converter Novamente</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Converter Agora</span>
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0" />
                      </>
                    )}
                  </>
                )}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ConverterForm;
