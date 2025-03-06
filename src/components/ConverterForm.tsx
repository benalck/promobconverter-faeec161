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

  const handleFileSelect = (file: File) => {
    setXmlFile(file);
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setOutputFileName(fileName);
  };

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
                text-align: left;
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

      let csvContent = `<tr>
          <th>NUM.</th>
          <th>MÓDULO</th>
          <th>CLIENTE</th>
          <th>AMBIENTE</th>
          <th class="piece-desc">DESC. DA PEÇA</th>
          <th class="piece-desc">OBSERVAÇÕES DA PEÇA</th>
          <th style="background-color: #F7CAAC;" class="comp">COMP</th>
          <th style="background-color: #BDD6EE;" class="larg">LARG</th>
          <th>QUANT</th>
          <th style="background-color: #F7CAAC;" class="borda-inf">BORDA INF</th>
          <th style="background-color: #F7CAAC;" class="borda-sup">BORDA SUP</th>
          <th style="background-color: #BDD6EE;" class="borda-dir">BORDA DIR</th>
          <th style="background-color: #BDD6EE;" class="borda-esq">BORDA ESQ</th>
          <th class="edge-color">COR FITA DE BORDA</th>
          <th class="material">CHAPA</th>
          <th class="material">ESP.</th>
        </tr>`;

      // Extrair o nome do ambiente da descrição da guia (modelcategory)
      const modelCategory = xmlDoc.querySelector(
        "MODELCATEGORYINFORMATION, ModelCategoryInformation, modelcategoryinformation"
      );
      
      let ambiente = "Ambiente 3D";
      if (modelCategory) {
        const categoryDesc = 
          modelCategory.getAttribute("DESCRIPTION") || 
          modelCategory.getAttribute("Description") || "";
        
        // Exemplo: "Cozinhas - Ambiente 3D" -> extrair "Ambiente 3D"
        const ambienteMatch = categoryDesc.match(/\s*-\s*(.+)/);
        ambiente = ambienteMatch ? ambienteMatch[1].trim() : categoryDesc;
      }

      const itemElements = xmlDoc.querySelectorAll("ITEM");

      if (itemElements.length > 0) {
        let rowCount = 1;
        
        // Primeiro passo: agrupar os itens por módulo (uniqueParentId)
        const moduleMap = new Map();
        
        // Identificar todos os módulos principais (COMPONENT="N" ou uniqueParentId="-1" ou "-2")
        const mainModules = Array.from(itemElements).filter(item => {
          const component = item.getAttribute("COMPONENT") || "N";
          const uniqueParentId = item.getAttribute("UNIQUEPARENTID") || "";
          return component === "N" || uniqueParentId === "-1" || uniqueParentId === "-2";
        });
        
        // Para cada módulo principal, encontrar todos os seus componentes
        mainModules.forEach(mainModule => {
          const uniqueId = mainModule.getAttribute("UNIQUEID") || "";
          if (!uniqueId) return;
          
          // Adicionar o módulo principal ao mapa
          moduleMap.set(uniqueId, {
            mainModule,
            components: []
          });
          
          // Encontrar todos os componentes deste módulo
          Array.from(itemElements).forEach(item => {
            const uniqueParentId = item.getAttribute("UNIQUEPARENTID") || "";
            const component = item.getAttribute("COMPONENT") || "N";
            
            if (component === "Y" && uniqueParentId === uniqueId) {
              // Este é um componente do módulo atual
              const moduleInfo = moduleMap.get(uniqueId);
              if (moduleInfo) {
                moduleInfo.components.push(item);
              }
            }
          });
        });
        
        // Agora, processamos cada módulo e seus componentes
        moduleMap.forEach((moduleInfo, uniqueId) => {
          const mainModule = moduleInfo.mainModule;
          const components = moduleInfo.components;
          
          // Obter informações do módulo principal
          const description = mainModule.getAttribute("DESCRIPTION") || "";
          const width = mainModule.getAttribute("WIDTH") || "";
          const height = mainModule.getAttribute("HEIGHT") || "";
          const depth = mainModule.getAttribute("DEPTH") || "";
          
          // Formar a descrição do módulo
          const moduleDescription = `(${uniqueId}) - ${description} - L.${width}mm x A.${height}mm x P.${depth}mm`;
          
          // Listar todas as peças deste módulo
          const piecesList = [];
          
          // Adicionar o módulo principal à lista se necessário
          if (shouldIncludeItemInOutput(mainModule)) {
            piecesList.push({
              item: mainModule,
              description: `${uniqueId} - ${mainModule.getAttribute("DESCRIPTION") || ""}`
            });
          }
          
          // Adicionar todos os componentes à lista
          components.forEach(component => {
            if (shouldIncludeItemInOutput(component)) {
              piecesList.push({
                item: component,
                description: `${uniqueId} - ${component.getAttribute("DESCRIPTION") || ""}`
              });
            }
          });
          
          // Se não houver peças, pular este módulo
          if (piecesList.length === 0) return;
          
          // Criar uma string com todas as peças para mostrar no plano de corte
          const piecesText = piecesList.map(piece => piece.description).join("<br>");
          
          // Adicionar linha para o módulo principal com todas as peças listadas
          const mainItem = piecesList[0].item;
          
          // Obter informações de material, cor e espessura do módulo principal
          let material = "";
          let color = "";
          let thickness = "";
          let modelExt = "";
          
          const referencesElements = mainItem.querySelectorAll(
            "REFERENCES > COMPLETE, REFERENCES > MATERIAL, REFERENCES > MODEL, REFERENCES > MODEL_DESCRIPTION, REFERENCES > MODEL_EXT, REFERENCES > THICKNESS"
          );
          
          referencesElements.forEach((ref) => {
            const tagName = ref.tagName;
            const referenceValue = ref.getAttribute("REFERENCE") || "";
            
            if (tagName === "MATERIAL") {
              material = referenceValue;
            } else if (tagName === "MODEL" || tagName === "MODEL_DESCRIPTION") {
              color = referenceValue;
            } else if (tagName === "MODEL_EXT") {
              modelExt = referenceValue;
            } else if (tagName === "THICKNESS") {
              thickness = referenceValue;
            }
          });
          
          // Usar MODEL_EXT se estiver disponível, senão usar color
          const finalColor = modelExt || color;
          
          // Formatar a informação da chapa: "Material Thickness Color"
          const chapaMaterial = (() => {
            if (finalColor && material && thickness) {
              return `${escapeHtml(material)} ${escapeHtml(thickness)} ${escapeHtml(finalColor)}`;
            } else if (finalColor && material) {
              return `${escapeHtml(material)} ${escapeHtml(finalColor)}`;
            } else if (finalColor || material) {
              return `${escapeHtml(finalColor || material)}`;
            } else {
              return "N/A";
            }
          })();
          
          // Verificar bordas
          let edgeBottom = "";
          let edgeTop = "";
          let edgeRight = "";
          let edgeLeft = "";
          
          const edgeElements = mainItem.querySelectorAll(
            "REFERENCES > FITA_BORDA_1, REFERENCES > FITA_BORDA_2, REFERENCES > FITA_BORDA_3, REFERENCES > FITA_BORDA_4"
          );
          
          edgeElements.forEach((edge) => {
            const tagName = edge.tagName;
            const value = edge.getAttribute("REFERENCE") || "0";
            
            if (tagName === "FITA_BORDA_1") {
              edgeBottom = value === "1" ? "X" : "";
            } else if (tagName === "FITA_BORDA_2") {
              edgeTop = value === "1" ? "X" : "";
            } else if (tagName === "FITA_BORDA_3") {
              edgeRight = value === "1" ? "X" : "";
            } else if (tagName === "FITA_BORDA_4") {
              edgeLeft = value === "1" ? "X" : "";
            }
          });
          
          let edgeColor = finalColor || color;
          const edgeColorElement = mainItem.querySelector(
            "REFERENCES > MODEL_DESCRIPTION_FITA"
          );
          if (edgeColorElement) {
            edgeColor = edgeColorElement.getAttribute("REFERENCE") || edgeColor;
          }
          
          // Calcular a quantidade total de componentes neste módulo
          const quantity = mainItem.getAttribute("QUANTITY") || "1";
          const repetition = mainItem.getAttribute("REPETITION") || "1";
          const totalQuantity = parseInt(quantity, 10) * parseInt(repetition, 10);
          
          // Obter as observações (se houver)
          const observations = mainItem.getAttribute("OBSERVATIONS") || "";
          
          // Adicionar linha para o módulo com os componentes listados na descrição
          csvContent += `<tr>
              <td>${rowCount}</td>
              <td>${moduleDescription}</td>
              <td>Cliente</td>
              <td>${escapeHtml(ambiente)}</td>
              <td class="piece-desc">${piecesText}</td>
              <td class="piece-desc">${escapeHtml(observations)}</td>
              <td class="comp">${depth}</td>
              <td class="larg">${width}</td>
              <td>${totalQuantity}</td>
              <td class="borda-inf">${edgeBottom}</td>
              <td class="borda-sup">${edgeTop}</td>
              <td class="borda-dir">${edgeRight}</td>
              <td class="borda-esq">${edgeLeft}</td>
              <td class="edge-color">${escapeHtml(edgeColor)}</td>
              <td class="material">${chapaMaterial}</td>
              <td class="material">${thickness}</td>
            </tr>`;
          
          rowCount++;
        });

        return csvContent;
      }

      const modelCategories = Array.from(
        xmlDoc.querySelectorAll(
          "MODELCATEGORYINFORMATION, ModelCategoryInformation, modelcategoryinformation"
        )
      );

      if (modelCategories.length === 0) {
        csvContent += `<tr>
            <td>1</td>
            <td>Cozinhas</td>
            <td>Cliente Exemplo</td>
            <td>${escapeHtml(ambiente)}</td>
            <td class="piece-desc">Exemplo Peça <strong>(Plano de corte: 2 peças)</strong></td>
            <td class="piece-desc">Observações Exemplo</td>
            <td class="comp">100</td>
            <td class="larg">50</td>
            <td>2</td>
            <td class="borda-inf">X</td>
            <td class="borda-sup"></td>
            <td class="borda-dir">X</td>
            <td class="borda-esq"></td>
            <td class="edge-color">Branco</td>
            <td class="material">Branco (MDF)</td>
            <td class="material">15</td>
          </tr>`;
        return csvContent;
      }

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
              <td>Cozinhas</td>
              <td>Cliente Exemplo</td>
              <td>${escapeHtml(categoriaAmbiente)}</td>
              <td class="piece-desc">${escapeHtml(modelDesc)} <strong>(Plano de corte: 2 peças)</strong></td>
              <td class="piece-desc">Observações Exemplo</td>
              <td class="comp">100</td>
              <td class="larg">50</td>
              <td>2</td>
              <td class="borda-inf">X</td>
              <td class="borda-sup"></td>
              <td class="borda-dir">X</td>
              <td class="borda-esq"></td>
              <td class="edge-color">Branco</td>
              <td class="material">Branco (MDF)</td>
              <td class="material">15</td>
            </tr>`;
          rowCount++;
        });
      });

      if (rowCount === 1) {
        csvContent += `<tr>
            <td>1</td>
            <td>Cozinhas</td>
            <td>Cliente Exemplo</td>
            <td>${escapeHtml(ambiente)}</td>
            <td class="piece-desc">Exemplo Peça <strong>(Plano de corte: 2 peças)</strong></td>
            <td class="piece-desc">Observações Exemplo</td>
            <td class="comp">100</td>
            <td class="larg">50</td>
            <td>2</td>
            <td class="borda-inf">X</td>
            <td class="borda-sup"></td>
            <td class="borda-dir">X</td>
            <td class="borda-esq"></td>
            <td class="edge-color">Branco</td>
            <td class="material">Branco (MDF)</td>
            <td class="material">15</td>
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
        <th style="background-color: #FDE1D3;" class="comp">COMP</th>
        <th style="background-color: #D3E4FD;" class="larg">LARG</th>
        <th>QUANT</th>
        <th style="background-color: #FDE1D3;" class="borda-inf">BORDA INF</th>
        <th style="background-color: #FDE1D3;" class="borda-sup">BORDA SUP</th>
        <th style="background-color: #D3E4FD;" class="borda-dir">BORDA DIR</th>
        <th style="background-color: #D3E4FD;" class="borda-esq">BORDA ESQ</th>
        <th class="edge-color">COR FITA DE BORDA</th>
        <th class="material">CHAPA</th>
        <th class="material">ESP.</th>
      </tr>`;
    }
  };
  
  // Função para determinar se um item deve ser incluído na saída
  // (Ignoramos acessórios, ferragens, etc.)
  const shouldIncludeItemInOutput = (item: Element): boolean => {
    const family = item.getAttribute("FAMILY") || "";
    
    // Skip accessories, hardware, production processes, and handles
    if (
      family.toLowerCase().includes("acessório") ||
      family.toLowerCase().includes("acessorios") ||
      family.toLowerCase().includes("ferragem") ||
      family.toLowerCase().includes("processo") ||
      family.toLowerCase().includes("puxador")
    ) {
      return false;
    }
    
    return true;
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
            onFileSelect={handleFileSelect}
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
