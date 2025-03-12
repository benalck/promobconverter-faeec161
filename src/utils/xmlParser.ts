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

/**
 * Verifica se o grupo deve ser excluído
 */
const shouldExcludeGroup = (group: string, description: string, family: string): boolean => {
  // Grupos a serem excluídos
  const excludedGroups = [
    "acessório", "acessorios", "acessorio", "acess", 
    "ferragem", "ferragens", 
    "processo", "processos", "fabricação", "fabricacao"
  ];
  
  const lowercaseGroup = group.toLowerCase();
  const lowercaseFamily = family.toLowerCase();
  const lowercaseDescription = description.toLowerCase();
  
  // Verifica se o grupo, família ou descrição contém termos excluídos
  for (const term of excludedGroups) {
    if (
      lowercaseGroup.includes(term) || 
      lowercaseFamily.includes(term) || 
      lowercaseDescription.includes(term)
    ) {
      return true;
    }
  }
  
  return false;
};

/**
 * Gera a descrição do módulo no formato solicitado
 */
const createModuleDescription = (item: Element): string => {
  const uniqueId = item.getAttribute("UNIQUEID") || "";
  const description = item.getAttribute("DESCRIPTION") || "";
  const width = item.getAttribute("WIDTH") || "";
  const height = item.getAttribute("HEIGHT") || "";
  const depth = item.getAttribute("DEPTH") || "";
  
  return `(${uniqueId}) - ${description} - L.${width}mm x A.${height}mm x P.${depth}mm`;
};

const processItemElements = (itemElements: NodeListOf<Element>, csvContent: string): string => {
  let rowCount = 1;
  
  // Organizar os itens por tipo: módulos e componentes
  const mainItems = Array.from(itemElements).filter(item => {
    const component = item.getAttribute("COMPONENT") || "N";
    const uniqueParentId = item.getAttribute("UNIQUEPARENTID") || "";
    const group = item.getAttribute("GROUP") || "";
    const description = item.getAttribute("DESCRIPTION") || "";
    const family = item.getAttribute("FAMILY") || "";
    
    // Excluir grupos específicos
    if (shouldExcludeGroup(group, description, family)) {
      return false;
    }
    
    return component === "N" || uniqueParentId === "-1" || uniqueParentId === "-2" || group !== "";
  });
  
  // Processar cada item individualmente
  for (const item of mainItems) {
    const uniqueId = item.getAttribute("UNIQUEID") || "";
    const description = item.getAttribute("DESCRIPTION") || "";
    const width = item.getAttribute("WIDTH") || "";
    const height = item.getAttribute("HEIGHT") || "";
    const depth = item.getAttribute("DEPTH") || "";
    const family = item.getAttribute("FAMILY") || "Ambiente";
    const group = item.getAttribute("GROUP") || "";
    const reference = item.getAttribute("REFERENCE") || "";
    const repetition = item.getAttribute("REPETITION") || "1";
    const observations = item.getAttribute("OBSERVATIONS") || "";
    
    // Criar a descrição do módulo
    const moduleDescription = createModuleDescription(item);
    
    // If it's a tamponamento, process directly
    if (group === "Tamponamentos") {
      const componentProps = extractItemPropertiesFromReference(reference);
      
      csvContent += `<tr>
        <td>${rowCount}</td>
        <td class="module-cell">${moduleDescription}</td>
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
      continue;
    }
    
    // Get the components of this item
    const components = Array.from(itemElements).filter(comp => {
      const compParentId = comp.getAttribute("UNIQUEPARENTID") || "";
      const compComponent = comp.getAttribute("COMPONENT") || "Y";
      const compGroup = comp.getAttribute("GROUP") || "";
      const compDescription = comp.getAttribute("DESCRIPTION") || "";
      const compFamily = comp.getAttribute("FAMILY") || "";
      
      // Exclude components from specific groups
      if (shouldExcludeGroup(compGroup, compDescription, compFamily)) {
        return false;
      }
      
      return compComponent === "Y" && compParentId === uniqueId;
    });
    
    // Add components with module description only for the first component
    if (components.length > 0) {
      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        const componentProps = extractItemProperties(component);
        const componentWidth = component.getAttribute("WIDTH") || "";
        const componentDepth = component.getAttribute("DEPTH") || "";
        const componentDesc = component.getAttribute("DESCRIPTION") || "";
        const componentRepetition = component.getAttribute("REPETITION") || "1";
        const componentObs = component.getAttribute("OBSERVATIONS") || "";
        const componentUniqueId = component.getAttribute("UNIQUEID") || "";
        
        // Coluna MÓDULO apenas mostra a descrição para o primeiro componente
        const showModuleDescription = i === 0 ? moduleDescription : "";
        
        csvContent += `<tr>
          <td>${rowCount}</td>
          <td class="module-cell">${showModuleDescription}</td>
          <td></td>
          <td>${family}</td>
          <td class="piece-desc">${componentUniqueId} - ${componentDesc}</td>
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
      }
      
      // Linha vazia sem descrição na coluna MÓDULO
      csvContent += `<tr>
        <td>${rowCount}</td>
        <td></td>
        <td></td>
        <td>${family}</td>
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
        <td class="material"></td>
        <td class="material"></td>
      </tr>`;
      
      rowCount++;
    } else {
      // Se o item não tem componentes, adicionar como linha única
      const itemProps = extractItemProperties(item);
      
      csvContent += `<tr>
        <td>${rowCount}</td>
        <td class="module-cell">${moduleDescription}</td>
        <td></td>
        <td>${family}</td>
        <td class="piece-desc">${uniqueId} - ${description}</td>
        <td class="piece-desc">${escapeHtml(observations)}</td>
        <td class="comp">${width}</td>
        <td class="larg">${depth}</td>
        <td>${repetition}</td>
        <td class="borda-inf">${itemProps.edgeBottom}</td>
        <td class="borda-sup">${itemProps.edgeTop}</td>
        <td class="borda-dir">${itemProps.edgeRight}</td>
        <td class="borda-esq">${itemProps.edgeLeft}</td>
        <td class="edge-color">${itemProps.edgeColor}</td>
        <td class="material">${itemProps.material} ${itemProps.color}</td>
        <td class="material">${itemProps.thickness}</td>
      </tr>`;
      
      rowCount++;
      
      // Linha vazia sem descrição na coluna MÓDULO
      csvContent += `<tr>
        <td>${rowCount}</td>
        <td></td>
        <td></td>
        <td>${family}</td>
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
        <td class="material"></td>
        <td class="material"></td>
      </tr>`;
      
      rowCount++;
    }
  }
  
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
  
  const references = item.querySelector("REFERENCES");
  
  if (references) {
    // Material
    const materialElement = references.querySelector("MATERIAL");
    if (materialElement) {
      material = materialElement.getAttribute("REFERENCE") || material;
    }
    
    // Cor
    const modelElement = references.querySelector("MODEL");
    if (modelElement) {
      const modelRef = modelElement.getAttribute("REFERENCE") || "";
      if (modelRef) {
        const parts = modelRef.split(".");
        if (parts.length > 0) {
          // Last part is typically the color name
          const lastPart = parts[parts.length - 1];
          if (lastPart) {
            color = lastPart;
          }
        }
      }
    }
    
    // Model description for more readable color
    const modelDescriptionElement = references.querySelector("MODEL_DESCRIPTION");
    if (modelDescriptionElement) {
      const modelDescription = modelDescriptionElement.getAttribute("REFERENCE");
      if (modelDescription) {
        color = modelDescription;
      }
    }
    
    // Espessura
    const thicknessElement = references.querySelector("THICKNESS");
    if (thicknessElement) {
      thickness = thicknessElement.getAttribute("REFERENCE") || thickness;
    }

    // Cor da Fita de Borda
    const modelDescriptionFita = references.querySelector("MODEL_DESCRIPTION_FITA");
    if (modelDescriptionFita) {
      edgeColor = modelDescriptionFita.getAttribute("REFERENCE") || color;
    }
    
    // Fitas de Borda
    const edgeBottom1 = references.querySelector("FITA_BORDA_1");
    const edgeTop2 = references.querySelector("FITA_BORDA_2");
    const edgeRight3 = references.querySelector("FITA_BORDA_3");
    const edgeLeft4 = references.querySelector("FITA_BORDA_4");
    
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

// Função para extrair propriedades da string de referência
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

  // Formato esperado: "1.0155.15.Duratex.Areia.MDF"
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

