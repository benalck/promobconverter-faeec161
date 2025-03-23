
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
import { extractPiecesFromXml, calculateEdgeLength, calculateSheetTypes } from "@/utils/extractPiecesFromXml";

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

interface SheetType {
  material: string;
  color: string;
  thickness: string;
  count: number;
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

  const [pieces, setPieces] = useState<Piece[]>([]);
  const [sheet, setSheet] = useState<Sheet>({ width: 2750, height: 1830 });
  const [cutResult, setCutResult] = useState<OptimizationResult | null>(null);
  const [showCutOptimizer, setShowCutOptimizer] = useState(false);
  
  const [edgeCalculation, setEdgeCalculation] = useState<{
    edgeBottom: number;
    edgeTop: number;
    edgeLeft: number;
    edgeRight: number;
    totalEdge: number;
  } | null>(null);
  const [showEdgeCalculation, setShowEdgeCalculation] = useState(false);

  const [sheetTypes, setSheetTypes] = useState<SheetType[]>([]);

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

  const processXmlForAdvancedFeatures = useCallback(async (fileContent: string) => {
    try {
      const extractedPieces = extractPiecesFromXml(fileContent);
      setPieces(extractedPieces);
      
      const types = calculateSheetTypes(extractedPieces);
      setSheetTypes(types);
      
      const edgeResults = calculateEdgeLength(fileContent);
      setEdgeCalculation(edgeResults);
      
      setShowCutOptimizer(extractedPieces.length > 0);
      setShowEdgeCalculation(edgeResults.totalEdge > 0);
      
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
    setConversionSuccess(false);
    
    try {
      const content = await readFileAsText(file);
      setXmlContent(content);
      
      await processXmlForAdvancedFeatures(content);
    } catch (error) {
      console.error("Erro ao ler o arquivo:", error);
    }
  }, [readFileAsText, processXmlForAdvancedFeatures]);

  const calculateCutOptimization = useCallback(() => {
    if (pieces.length === 0) {
      toast({
        title: "Nenhuma peça disponível",
        description: "Não foi possível extrair peças do arquivo XML.",
        variant: "destructive",
      });
      return;
    }

    const expandedPieces = pieces.flatMap(piece => 
      Array(piece.quantity).fill(0).map((_, i) => ({
        id: piece.id * 100 + i,
        description: piece.description,
        width: piece.width,
        height: piece.height
      }))
    );
    
    expandedPieces.sort((a, b) => b.height - a.height);
    
    const distribution: OptimizationResult['pieceDistribution'] = [];
    let currentSheet = 0;
    let usedArea = 0;
    let totalSheetArea = 0;
    
    while (expandedPieces.length > 0) {
      distribution[currentSheet] = distribution[currentSheet] || { sheetIndex: currentSheet, pieces: [] };
      totalSheetArea += sheet.width * sheet.height;
      
      const grid = Array(Math.ceil(sheet.height / 10)).fill(0).map(() => Array(Math.ceil(sheet.width / 10)).fill(false));
      
      let placedAnyPiece = false;
      
      for (let i = 0; i < expandedPieces.length; i++) {
        const piece = expandedPieces[i];
        
        let placed = false;
        for (let y = 0; y <= sheet.height - piece.height; y += 10) {
          for (let x = 0; x <= sheet.width - piece.width; x += 10) {
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
              for (let py = 0; py < Math.ceil(piece.height / 10); py++) {
                for (let px = 0; px < Math.ceil(piece.width / 10); px++) {
                  if (grid[Math.floor(y / 10) + py] && grid[Math.floor(y / 10) + py][Math.floor(x / 10) + px] !== undefined) {
                    grid[Math.floor(y / 10) + py][Math.floor(x / 10) + px] = true;
                  }
                }
              }
              
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
        
        if (placed) {
          expandedPieces.splice(i, 1);
          i--;
        }
      }
      
      if (!placedAnyPiece) {
        currentSheet++;
      }
    }
    
    const totalArea = (currentSheet + 1) * sheet.width * sheet.height;
    const unusedArea = totalArea - usedArea;
    const wastePercentage = (unusedArea / totalArea) * 100;
    
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
    
    const startTime = Date.now();
    let success = false;
    let errorMsg = '';
    let fileSize = xmlFile.size;

    try {
      const xmlContent = await readFileAsText(xmlFile);
      const csvString = convertXMLToCSV(xmlContent);
      const htmlPrefix = generateHtmlPrefix();
      const htmlSuffix = generateHtmlSuffix();

      const blob = new Blob([htmlPrefix + csvString + htmlSuffix], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${outputFileName}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      success = true;
      setConversionSuccess(true);

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
                
                {sheetTypes.length > 0 && (
                  <div className="mt-2 p-2 bg-white rounded border border-blue-200 mb-3">
                    <p className="text-xs text-gray-600 mb-1 font-medium">Chapas Necessárias</p>
                    <div className="max-h-32 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left p-1 font-medium text-gray-600">Material</th>
                            <th className="text-left p-1 font-medium text-gray-600">Cor</th>
                            <th className="text-left p-1 font-medium text-gray-600">Espessura</th>
                            <th className="text-right p-1 font-medium text-gray-600">Qtd.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sheetTypes.map((type, index) => (
                            <tr key={index} className="border-b border-gray-50">
                              <td className="p-1 text-gray-700">{type.material}</td>
                              <td className="p-1 text-gray-700">{type.color}</td>
                              <td className="p-1 text-gray-700">{type.thickness}</td>
                              <td className="p-1 text-right text-blue-600 font-medium">{type.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
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
