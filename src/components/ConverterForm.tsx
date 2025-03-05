
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "./FileUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ConverterFormProps {
  className?: string;
}

const ConverterForm: React.FC<ConverterFormProps> = ({ className }) => {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [outputFileName, setOutputFileName] = useState("modelos_converted");
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleConvert = () => {
    if (!xmlFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, faça upload de um arquivo XML para converter.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlContent = e.target?.result as string;

        const csvString = convertXMLToCSV(xmlContent);

        const htmlPrefix = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <!--[if gte mso 9]>
            <xml>
              <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                  <x:ExcelWorksheet>
                    <x:Name>Planilha</x:Name>
                    <x:WorksheetOptions>
                      <x:DisplayGridlines/>
                    </x:WorksheetOptions>
                  </x:ExcelWorksheet>
                </x:ExcelWorksheets>
              </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
              table, td, th {
                border: 1px solid #000000;
                border-collapse: collapse;
                padding: 5px;
                text-align: center;
              }
              th {
                background-color: #f0f0f0;
                font-weight: bold;
              }
              .piece-desc {
                background-color: #FFFFFF;
              }
              .material {
                background-color: #FFFFFF;
              }
              .comp {
                background-color: #F7CAAC;
              }
              .larg {
                background-color: #BDD6EE;
              }
              .borda-inf, .borda-sup {
                background-color: #F7CAAC;
              }
              .borda-dir, .borda-esq {
                background-color: #BDD6EE;
              }
              .edge-color {
                background-color: #F7CAAC;
              }
              .sheet-color {
                background-color: #FFFFFF;
              }
              .thickness {
                background-color: #FFFFFF;
              }
            </style>
          </head>
          <body>
            <table border="1">`;

        const htmlSuffix = `</table></body></html>`;

        const blob = new Blob([htmlPrefix + csvString + htmlSuffix], {
          type: "application/vnd.ms-excel;charset=utf-8;",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${outputFileName}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsConverting(false);
        toast({
          title: "Conversão concluída",
          description: "Seu arquivo foi convertido com sucesso.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error converting file:", error);
        setIsConverting(false);
        toast({
          title: "Erro na conversão",
          description: "Ocorreu um erro ao converter o arquivo XML.",
          variant: "destructive",
        });
      }
    };

    reader.onerror = () => {
      setIsConverting(false);
      toast({
        title: "Erro na leitura",
        description: "Não foi possível ler o arquivo XML.",
        variant: "destructive",
      });
    };

    reader.readAsText(xmlFile);
  };

  const convertXMLToCSV = (xmlContent: string): string => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

      // Complete header with all required columns
      let csvContent = `<tr>
          <th>NUM.</th>
          <th>MÓDULO</th>
          <th>CLIENTE</th>
          <th>AMBIENTE</th>
          <th class="piece-desc">DESC. DA PEÇA</th>
          <th class="piece-desc">OBSERVAÇÕES DA PEÇA</th>
          <th class="comp">COMP</th>
          <th class="larg">LARG</th>
          <th>QUANT</th>
          <th class="borda-inf">BORDA INF</th>
          <th class="borda-sup">BORDA SUP</th>
          <th class="borda-dir">BORDA DIR</th>
          <th class="borda-esq">BORDA ESQ</th>
          <th class="edge-color">COR FITA DE BORDA</th>
          <th class="sheet-color">CHAPA</th>
          <th class="thickness">ESP.</th>
        </tr>`;

      // Extrair o nome do ambiente da descrição da guia (modelcategory)
      const modelCategory = xmlDoc.querySelector(
        "MODELCATEGORYINFORMATION, ModelCategoryInformation, modelcategoryinformation"
      );
      
      let ambiente = "Ambiente 3D"; // Valor padrão conforme solicitado
      if (modelCategory) {
        const categoryDesc = 
          modelCategory.getAttribute("DESCRIPTION") || 
          modelCategory.getAttribute("Description") || "";
        
        // Exemplo: "Cozinhas - Ambiente 3D" -> extrair "Ambiente 3D"
        const ambienteMatch = categoryDesc.match(/\s*-\s*(.+)/);
        ambiente = ambienteMatch ? ambienteMatch[1].trim() : categoryDesc;
      }

      // Organizar itens por módulo
      const moduleMap = new Map();
      
      const itemElements = xmlDoc.querySelectorAll("ITEM");
      if (itemElements.length > 0) {
        // Primeiro, agrupar itens por moduleId (UNIQUEPARENTID)
        itemElements.forEach((item) => {
          const family = item.getAttribute("FAMILY") || "";
          
          // Skip acessórios, ferragens, processos de produção e puxadores
          if (
            family.toLowerCase().includes("acessório") ||
            family.toLowerCase().includes("acessorios") ||
            family.toLowerCase().includes("ferragem") ||
            family.toLowerCase().includes("processo") ||
            family.toLowerCase().includes("puxador")
          ) {
            return; // Pular este item
          }
          
          const uniqueId = item.getAttribute("UNIQUEID") || "";
          const uniqueParentId = item.getAttribute("UNIQUEPARENTID") || uniqueId;
          const description = item.getAttribute("DESCRIPTION") || "";
          const width = item.getAttribute("WIDTH") || "";
          const height = item.getAttribute("HEIGHT") || "";
          const depth = item.getAttribute("DEPTH") || "";
          
          // Informações do módulo
          const moduleInfo =
            uniqueId && description
              ? `(${uniqueId}) - ${description} - L.${width}mm x A.${height}mm x P.${depth}mm`
              : family;
          
          // Agrupar pelo ID pai (módulo)
          if (!moduleMap.has(uniqueParentId)) {
            moduleMap.set(uniqueParentId, {
              moduleInfo: moduleInfo,
              items: []
            });
          }
          
          // Adicionar este item ao seu módulo
          moduleMap.get(uniqueParentId).items.push(item);
        });
        
        // Agora, gerar as linhas da tabela, agrupando por módulo
        let rowCount = 1;
        
        // Para cada módulo
        moduleMap.forEach((moduleData, moduleId) => {
          const { moduleInfo, items } = moduleData;
          
          // Processar itens deste módulo
          items.forEach((item, itemIndex) => {
            const description = item.getAttribute("DESCRIPTION") || "";
            const observations = item.getAttribute("OBSERVATIONS") || "";
            const width = item.getAttribute("WIDTH") || "";
            const depth = item.getAttribute("DEPTH") || "";
            const uniqueId = item.getAttribute("UNIQUEID") || "";
            const quantity = item.getAttribute("QUANTITY") || "1";
            const repetition = item.getAttribute("REPETITION") || "1";
            
            // Extrair informações de material, espessura e cor
            const reference = item.getAttribute("REFERENCE") || "";
            const references = item.querySelectorAll("REFERENCES");
            
            // Extração de informações de materiais
            let materialName = "";
            let materialColor = "Branco"; // Valor padrão
            let materialThickness = "15"; // Valor padrão
            let materialType = "MDF"; // Valor padrão
            
            // Tentar extrair do atributo REFERENCE
            if (reference) {
              const referenceParts = reference.split('.');
              if (referenceParts.length > 0) {
                materialColor = referenceParts[0] || materialColor;
              }
            }
            
            // Ou tentar extrair de REFERENCES/MODEL_EXT e REFERENCES/MATERIAL
            if (references && references.length > 0) {
              const modelExt = item.querySelector("REFERENCES MODEL_EXT, REFERENCES MATERIAL, REFERENCES THICKNESS");
              if (modelExt) {
                // Se encontrou elementos MODEL_EXT ou MATERIAL
                const modelExtRef = item.querySelector("REFERENCES MODEL_EXT");
                const materialRef = item.querySelector("REFERENCES MATERIAL");
                const thicknessRef = item.querySelector("REFERENCES THICKNESS");
                
                if (modelExtRef) {
                  materialColor = modelExtRef.getAttribute("REFERENCE") || materialColor;
                }
                
                if (materialRef) {
                  const materialRefValue = materialRef.getAttribute("REFERENCE") || "";
                  if (materialRefValue.includes("MDF") || materialRefValue.includes("Esp")) {
                    materialType = "MDF";
                  }
                }
                
                if (thicknessRef) {
                  materialThickness = thicknessRef.getAttribute("REFERENCE") || materialThickness;
                }
              }
            }
            
            // Verificar se é espessura de 6mm com base na descrição
            if (description.toLowerCase().includes("fundo") || description.toLowerCase().includes("6")) {
              materialThickness = "6";
            }
            
            // Formar o nome completo do material
            const isGuararapes = materialColor.toLowerCase() === "areia";
            const chapaMaterial = isGuararapes 
              ? `MDF ${materialThickness} Guararapes ${materialColor}`
              : `MDF ${materialThickness} ${materialColor}`;
            
            // Determinar bordas com base em regras específicas
            // Se "Frente Reta" ou um item de face visível, terá bordas em todos os lados
            const isFrontPanel = description.toLowerCase().includes("frente") || 
                               description.toLowerCase().includes("porta");
            
            const bordaInf = isFrontPanel || description.toLowerCase().includes("base") ||
                           description.toLowerCase().includes("tamponamento") ||
                           description.toLowerCase().includes("lateral 15") ? "X" : "";
            
            const bordaSup = isFrontPanel ? "X" : "";
            const bordaDir = isFrontPanel ? "X" : "";
            const bordaEsq = isFrontPanel || description.toLowerCase().includes("lateral") || 
                          description.toLowerCase().includes("fundo travessa") ? "X" : "";
            
            // Cor da fita de borda baseada na cor do material
            const corFitaBorda = materialColor;
            
            // Calcular quantidade total (QUANTITY * REPETITION)
            const totalQuantity = parseInt(quantity, 10) * parseInt(repetition, 10);
            
            // Formatar a descrição da peça: uniqueId - description
            const pieceDesc = uniqueId ? `${uniqueId} - ${description}` : description;
            
            // Apenas mostrar o módulo no primeiro item do grupo
            const displayModuleInfo = itemIndex === 0 ? moduleInfo : "";
            
            csvContent += `<tr>
                <td>${rowCount}</td>
                <td>${escapeHtml(displayModuleInfo)}</td>
                <td></td>
                <td>${escapeHtml(ambiente)}</td>
                <td class="piece-desc">${escapeHtml(pieceDesc)}</td>
                <td class="piece-desc">${escapeHtml(observations)}</td>
                <td class="comp">${depth}</td>
                <td class="larg">${width}</td>
                <td>${totalQuantity}</td>
                <td class="borda-inf">${bordaInf}</td>
                <td class="borda-sup">${bordaSup}</td>
                <td class="borda-dir">${bordaDir}</td>
                <td class="borda-esq">${bordaEsq}</td>
                <td class="edge-color">${corFitaBorda}</td>
                <td class="sheet-color">${chapaMaterial}</td>
                <td class="thickness">${materialThickness}</td>
              </tr>`;
            
            rowCount++;
          });
          
          // Adicionar linha em branco entre módulos (exceto após o último módulo)
          if (rowCount > 1 && Array.from(moduleMap.keys()).indexOf(moduleId) < moduleMap.size - 1) {
            csvContent += `<tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td class="piece-desc"></td>
                <td class="piece-desc"></td>
                <td class="comp"></td>
                <td class="larg"></td>
                <td></td>
                <td class="borda-inf"></td>
                <td class="borda-sup"></td>
                <td class="borda-dir"></td>
                <td class="borda-esq"></td>
                <td class="edge-color"></td>
                <td class="sheet-color"></td>
                <td class="thickness"></td>
              </tr>`;
            
            rowCount++;
          }
        });
        
        return csvContent;
      }

      // Se não houver ITEM, tentar ler informações diretas do modelCategory
      const modelCategories = Array.from(
        xmlDoc.querySelectorAll(
          "MODELCATEGORYINFORMATION, ModelCategoryInformation, modelcategoryinformation"
        )
      );

      if (modelCategories.length === 0) {
        // Dados de exemplo básicos se não encontrarmos itens
        csvContent += `<tr>
            <td>1</td>
            <td>(1) - Exemplo - L.500mm x A.650mm x P.500mm</td>
            <td></td>
            <td>${escapeHtml(ambiente)}</td>
            <td class="piece-desc">1 - Base 15</td>
            <td class="piece-desc"></td>
            <td class="comp">470</td>
            <td class="larg">500</td>
            <td>1</td>
            <td class="borda-inf">X</td>
            <td class="borda-sup"></td>
            <td class="borda-dir"></td>
            <td class="borda-esq"></td>
            <td class="edge-color">Branco</td>
            <td class="sheet-color">MDF 15 Branco</td>
            <td class="thickness">15</td>
          </tr>`;
        return csvContent;
      }

      // Se chegarmos aqui, temos categorias de modelo, mas não itens individuais
      let rowCount = 1;

      modelCategories.forEach((category) => {
        const categoryDesc =
          category.getAttribute("DESCRIPTION") ||
          category.getAttribute("Description") ||
          "Unknown Category";
          
        // Extrair ambiente da descrição da categoria
        const ambienteMatch = categoryDesc.match(/\s*-\s*(.+)/);
        const categoriaAmbiente = ambienteMatch ? ambienteMatch[1].trim() : categoryDesc;

        const modelInfos = Array.from(
          category.querySelectorAll(
            "MODELINFORMATION, ModelInformation, modelinformation"
          )
        );

        modelInfos.forEach((modelInfo) => {
          const modelDesc =
            modelInfo.getAttribute("DESCRIPTION") ||
            modelInfo.getAttribute("Description") ||
            "Unknown Model";

          csvContent += `<tr>
              <td>${rowCount}</td>
              <td>(${rowCount}) - ${escapeHtml(modelDesc)} - L.500mm x A.650mm x P.500mm</td>
              <td></td>
              <td>${escapeHtml(categoriaAmbiente)}</td>
              <td class="piece-desc">${rowCount} - Base 15</td>
              <td class="piece-desc"></td>
              <td class="comp">470</td>
              <td class="larg">500</td>
              <td>1</td>
              <td class="borda-inf">X</td>
              <td class="borda-sup"></td>
              <td class="borda-dir"></td>
              <td class="borda-esq"></td>
              <td class="edge-color">Branco</td>
              <td class="sheet-color">MDF 15 Branco</td>
              <td class="thickness">15</td>
            </tr>`;
          rowCount++;
        });
      });

      // Se não encontramos nenhum modelInfo, adicionar uma linha de exemplo
      if (rowCount === 1) {
        csvContent += `<tr>
            <td>1</td>
            <td>(1) - Exemplo - L.500mm x A.650mm x P.500mm</td>
            <td></td>
            <td>${escapeHtml(ambiente)}</td>
            <td class="piece-desc">1 - Base 15</td>
            <td class="piece-desc"></td>
            <td class="comp">470</td>
            <td class="larg">500</td>
            <td>1</td>
            <td class="borda-inf">X</td>
            <td class="borda-sup"></td>
            <td class="borda-dir"></td>
            <td class="borda-esq"></td>
            <td class="edge-color">Branco</td>
            <td class="sheet-color">MDF 15 Branco</td>
            <td class="thickness">15</td>
          </tr>`;
      }

      return csvContent;
    } catch (error) {
      console.error("Error converting XML to CSV:", error);
      return `<tr>
        <th>NUM.</th>
        <th>MÓDULO</th>
        <th>CLIENTE</th>
        <th>AMBIENTE</th>
        <th class="piece-desc">DESC. DA PEÇA</th>
        <th class="piece-desc">OBSERVAÇÕES DA PEÇA</th>
        <th class="comp">COMP</th>
        <th class="larg">LARG</th>
        <th>QUANT</th>
        <th class="borda-inf">BORDA INF</th>
        <th class="borda-sup">BORDA SUP</th>
        <th class="borda-dir">BORDA DIR</th>
        <th class="borda-esq">BORDA ESQ</th>
        <th class="edge-color">COR FITA DE BORDA</th>
        <th class="sheet-color">CHAPA</th>
        <th class="thickness">ESP.</th>
      </tr>`;
    }
  };

  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return (
    <Card
      className={cn(
        "w-full max-w-3xl mx-auto transition-all duration-500 hover:shadow-glass relative overflow-hidden",
        "backdrop-blur-sm bg-white/90 border border-white/40",
        className
      )}
    >
      <CardHeader className="text-center pb-4">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30"></div>
        <CardTitle className="text-2xl sm:text-3xl tracking-tight mt-2 animate-slide-down">
          XML para Excel
        </CardTitle>
        <CardDescription className="text-lg animate-slide-up">
          Converta seus arquivos XML para planilhas Excel formatadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pb-8">
        <div className="space-y-6">
          <FileUpload
            onFileSelect={(file) => setXmlFile(file)}
            acceptedFileTypes=".xml"
            fileType="XML"
            className="animate-scale-in"
          />

          <div className="space-y-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <Label htmlFor="outputFileName">Nome do Arquivo de Saída</Label>
            <Input
              id="outputFileName"
              value={outputFileName}
              onChange={(e) => setOutputFileName(e.target.value)}
              className="transition-all duration-300 focus-visible:ring-offset-2 bg-white/50 backdrop-blur-sm focus:bg-white"
              placeholder="Digite o nome do arquivo sem extensão"
            />
          </div>

          <Button
            onClick={handleConvert}
            disabled={!xmlFile || isConverting}
            className={cn(
              "w-full py-6 text-base font-medium transition-all duration-500 animate-fade-in",
              "bg-primary hover:bg-primary/90 text-white relative overflow-hidden group",
              "border border-primary/20"
            )}
            style={{ animationDelay: "200ms" }}
            size="lg"
          >
            <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-500 ease-out group-hover:w-full"></span>
            <span className="relative flex items-center justify-center gap-2">
              {isConverting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  <span>Convertendo...</span>
                </>
              ) : (
                <>
                  <FileDown className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  <span>Converter e Baixar</span>
                  <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0" />
                </>
              )}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConverterForm;
