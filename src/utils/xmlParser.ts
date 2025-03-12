import { escapeHtml, shouldIncludeItemInOutput } from "./xmlConverter";

/**
 * Converts XML content to CSV format for Excel
 */
export const convertXMLToCSV = (xmlContent: string): string => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    let csvContent = generateTableHeader();

    const itemElements = xmlDoc.querySelectorAll("ITEM");

    if (itemElements.length > 0) {
      csvContent = processItemElements(itemElements, csvContent);
      return csvContent;
    }

    return csvContent + "</table>";
  } catch (error) {
    console.error("Error converting XML to CSV:", error);
    return getDefaultTableHeader();
  }
};

const generateTableHeader = (): string => {
  return `<tr>
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
};

const processItemElements = (itemElements: NodeListOf<Element>, csvContent: string): string => {
  let rowCount = 1;
  const moduleMap = new Map();
  
  // Primeiro, organizar os módulos e seus componentes
  const mainModules = Array.from(itemElements).filter(item => {
    const component = item.getAttribute("COMPONENT") || "N";
    const uniqueParentId = item.getAttribute("UNIQUEPARENTID") || "";
    const group = item.getAttribute("GROUP") || "";
    return component === "N" || uniqueParentId === "-1" || uniqueParentId === "-2" || group === "Tamponamentos";
  });
  
  mainModules.forEach(mainModule => {
    const uniqueId = mainModule.getAttribute("UNIQUEID") || "";
    const group = mainModule.getAttribute("GROUP") || "";
    if (!uniqueId) return;
    
    moduleMap.set(uniqueId, {
      mainModule,
      components: []
    });
    
    // Se for um tamponamento, não precisa buscar componentes
    if (group === "Tamponamentos") return;
    
    Array.from(itemElements).forEach(item => {
      const uniqueParentId = item.getAttribute("UNIQUEPARENTID") || "";
      const component = item.getAttribute("COMPONENT") || "Y";
      
      if (component === "Y" && uniqueParentId === uniqueId) {
        const moduleInfo = moduleMap.get(uniqueId);
        if (moduleInfo) {
          moduleInfo.components.push(item);
        }
      }
    });
  });
  
  moduleMap.forEach((moduleInfo, uniqueId) => {
    const { mainModule, components } = moduleInfo;
    
    const description = mainModule.getAttribute("DESCRIPTION") || "";
    const width = mainModule.getAttribute("WIDTH") || "";
    const height = mainModule.getAttribute("HEIGHT") || "";
    const depth = mainModule.getAttribute("DEPTH") || "";
    const family = mainModule.getAttribute("FAMILY") || "Ambiente";
    const group = mainModule.getAttribute("GROUP") || "";
    const reference = mainModule.getAttribute("REFERENCE") || "";
    const repetition = mainModule.getAttribute("REPETITION") || "1";
    const observations = mainModule.getAttribute("OBSERVATIONS") || "";
    
    // Se for um tamponamento, processar diretamente
    if (group === "Tamponamentos") {
      const componentProps = extractItemPropertiesFromReference(reference);
      
      csvContent += `<tr>
        <td>${rowCount}</td>
        <td class="module-cell">${description}</td>
        <td></td>
        <td>${family}</td>
        <td class="piece-desc">${uniqueId} - ${description}</td>
        <td class="piece-desc">${escapeHtml(observations)}</td>
        <td class="comp">${width}</td>
        <td class="larg">${depth}</td>
        <td>${repetition}</td>
        <td class="borda-inf">${componentProps.edgeBottom}</td>
        <td class="borda-sup">${componentProps.edgeTop}</td>
        <td class="borda-dir">${componentProps.edgeRight}</td>
        <td class="borda-esq">${componentProps.edgeLeft}</td>
        <td class="edge-color">${componentProps.edgeColor}</td>
        <td class="material">${componentProps.material} ${componentProps.color}</td>
        <td class="material">${componentProps.thickness}</td>
      </tr>`;
      
      rowCount++;
      return;
    }
    
    const moduleDescription = `(${uniqueId}) - ${description} - L.${width}mm x A.${height}mm x P.${depth}mm`;
    
    // Calcular número total de linhas para este módulo
    const validComponents = components.filter(comp => {
      const desc = comp.getAttribute("DESCRIPTION") || "";
      return !desc.toLowerCase().includes("armário") && 
             !desc.toLowerCase().includes("caixa") &&
             !desc.toLowerCase().includes("gaveteiro") &&
             !desc.toLowerCase().includes("dispenseiro");
    });
    
    const totalRows = validComponents.length;
    let isFirstRow = true;
    
    // Processar os componentes
    validComponents.forEach(component => {
      const componentProps = extractItemProperties(component);
      const componentWidth = component.getAttribute("WIDTH") || "";
      const componentDepth = component.getAttribute("DEPTH") || "";
      const componentDesc = component.getAttribute("DESCRIPTION") || "";
      const componentRepetition = component.getAttribute("REPETITION") || "1";
      const componentObs = component.getAttribute("OBSERVATIONS") || "";
      
      csvContent += `<tr>
        <td>${rowCount}</td>
        ${isFirstRow ? `<td class="module-cell" ${totalRows > 1 ? `rowspan="${totalRows}"` : ""}>${moduleDescription}</td>` : ""}
        <td></td>
        <td>${family}</td>
        <td class="piece-desc">${uniqueId} - ${componentDesc}</td>
        <td class="piece-desc">${escapeHtml(componentObs)}</td>
        <td class="comp">${componentWidth}</td>
        <td class="larg">${componentDepth}</td>
        <td>${componentRepetition}</td>
        <td class="borda-inf">${componentProps.edgeBottom}</td>
        <td class="borda-sup">${componentProps.edgeTop}</td>
        <td class="borda-dir">${componentProps.edgeRight}</td>
        <td class="borda-esq">${componentProps.edgeLeft}</td>
        <td class="edge-color">${componentProps.edgeColor}</td>
        <td class="material">${componentProps.material} ${componentProps.color}</td>
        <td class="material">${componentProps.thickness}</td>
      </tr>`;
      
      rowCount++;
      isFirstRow = false;
    });
  });
  
  return csvContent;
};

const extractItemProperties = (item: Element) => {
  let material = "MDF";
  let color = "Branco";
  let thickness = "15";
  let edgeColor = "";
  let edgeBottom = "0";
  let edgeTop = "0";
  let edgeRight = "0";
  let edgeLeft = "0";
  
  const referencesElement = item.querySelector("REFERENCES");
  
  if (referencesElement) {
    const materialElement = referencesElement.querySelector("MATERIAL");
    const modelElement = referencesElement.querySelector("MODEL");
    const thicknessElement = referencesElement.querySelector("THICKNESS");
    const modelDescriptionFita = referencesElement.querySelector("MODEL_DESCRIPTION_FITA");
    
    // Material
    if (materialElement) {
      material = materialElement.getAttribute("REFERENCE") || material;
    }
    
    // Cor
    if (modelElement) {
      color = modelElement.getAttribute("REFERENCE") || color;
    }
    
    // Espessura
    if (thicknessElement) {
      thickness = thicknessElement.getAttribute("REFERENCE") || thickness;
    }

    // Cor da Fita de Borda
    if (modelDescriptionFita) {
      edgeColor = modelDescriptionFita.getAttribute("REFERENCE") || color;
    }
    
    // Fitas de Borda
    const edgeBottom1 = referencesElement.querySelector("FITA_BORDA_1");
    const edgeTop2 = referencesElement.querySelector("FITA_BORDA_2");
    const edgeRight3 = referencesElement.querySelector("FITA_BORDA_3");
    const edgeLeft4 = referencesElement.querySelector("FITA_BORDA_4");
    
    if (edgeBottom1) {
      const value = edgeBottom1.getAttribute("REFERENCE");
      edgeBottom = value === "0" ? "" : "X";
    }
    
    if (edgeTop2) {
      const value = edgeTop2.getAttribute("REFERENCE");
      edgeTop = value === "0" ? "" : "X";
    }
    
    if (edgeRight3) {
      const value = edgeRight3.getAttribute("REFERENCE");
      edgeRight = value === "0" ? "" : "X";
    }
    
    if (edgeLeft4) {
      const value = edgeLeft4.getAttribute("REFERENCE");
      edgeLeft = value === "0" ? "" : "X";
    }
  }
  
  return {
    material,
    color,
    thickness,
    edgeColor,
    edgeBottom,
    edgeTop,
    edgeRight,
    edgeLeft
  };
};

// Nova função para extrair propriedades da string de referência
const extractItemPropertiesFromReference = (reference: string) => {
  const defaultProps = {
    material: "MDF",
    color: "Branco",
    thickness: "15",
    edgeColor: "Branco",
    edgeBottom: "",
    edgeTop: "",
    edgeRight: "",
    edgeLeft: ""
  };

  if (!reference) return defaultProps;

  // Formato esperado: "1.0155.15.Guararapes.Areia.MDF"
  const parts = reference.split(".");
  if (parts.length >= 6) {
    return {
      material: parts[5] || defaultProps.material,
      color: parts[4] || defaultProps.color,
      thickness: parts[2] || defaultProps.thickness,
      edgeColor: parts[4] || defaultProps.color, // Usando a mesma cor do material para a fita
      edgeBottom: parts[0] === "1" ? "X" : "",
      edgeTop: parts[0] === "1" ? "X" : "",
      edgeRight: parts[0] === "1" ? "X" : "",
      edgeLeft: parts[0] === "1" ? "X" : ""
    };
  }

  return defaultProps;
};

/**
 * Create chapa material string
 */
const createChapaMaterial = (material: string, finalColor: string, thickness: string): string => {
  if (finalColor && material && thickness) {
    return `${escapeHtml(material)} ${escapeHtml(thickness)} ${escapeHtml(finalColor)}`;
  } else if (finalColor && material) {
    return `${escapeHtml(material)} ${escapeHtml(finalColor)}`;
  } else if (finalColor || material) {
    return `${escapeHtml(finalColor || material)}`;
  } else {
    return "N/A";
  }
};

/**
 * Get default table header for error cases
 */
const getDefaultTableHeader = (): string => {
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
};

/**
 * Get default example row
 */
const getDefaultExampleRow = (): string => {
  const defaultEnvironment = "Ambiente";
  return `<tr>
      <td>1</td>
      <td class="module-cell">Cozinhas</td>
      <td>Cliente Exemplo</td>
      <td>${escapeHtml(defaultEnvironment)}</td>
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
};
