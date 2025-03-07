
import { escapeHtml, shouldIncludeItemInOutput } from "./xmlConverter";

/**
 * Convert XML content to CSV formatted string with HTML
 */
export const convertXMLToCSV = (xmlContent: string): string => {
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

    const itemElements = xmlDoc.querySelectorAll("ITEM");

    if (itemElements.length > 0) {
      csvContent = processItemElements(itemElements, csvContent);
      return csvContent;
    }

    // Process model categories if no items found
    csvContent = processModelCategories(xmlDoc, csvContent);
    return csvContent;
  } catch (error) {
    console.error("Error converting XML to CSV:", error);
    return getDefaultTableHeader();
  }
};

/**
 * Process item elements from XML
 */
const processItemElements = (itemElements: NodeListOf<Element>, csvContent: string): string => {
  let rowCount = 1;
  
  const moduleMap = new Map();
  
  const mainModules = Array.from(itemElements).filter(item => {
    const component = item.getAttribute("COMPONENT") || "N";
    const uniqueParentId = item.getAttribute("UNIQUEPARENTID") || "";
    return component === "N" || uniqueParentId === "-1" || uniqueParentId === "-2";
  });
  
  mainModules.forEach(mainModule => {
    const uniqueId = mainModule.getAttribute("UNIQUEID") || "";
    if (!uniqueId) return;
    
    moduleMap.set(uniqueId, {
      mainModule,
      components: []
    });
    
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
    
    const moduleDescription = `(${uniqueId}) - ${description} - L.${width}mm x A.${height}mm x P.${depth}mm`;
    
    const piecesList = [];
    
    if (shouldIncludeItemInOutput(mainModule)) {
      piecesList.push({
        item: mainModule,
        description: `${uniqueId} - ${mainModule.getAttribute("DESCRIPTION") || ""}`
      });
    }
    
    components.forEach(component => {
      if (shouldIncludeItemInOutput(component)) {
        piecesList.push({
          item: component,
          description: `${uniqueId} - ${component.getAttribute("DESCRIPTION") || ""}`
        });
      }
    });
    
    if (piecesList.length === 0) return;
    
    const piecesText = piecesList.map(piece => piece.description).join("<br>");
    
    const mainItem = piecesList[0].item;
    
    const { 
      material, 
      finalColor, 
      thickness, 
      edgeColor, 
      edgeBottom, 
      edgeTop, 
      edgeRight, 
      edgeLeft 
    } = extractItemProperties(mainItem);
    
    const chapaMaterial = createChapaMaterial(material, finalColor, thickness);
    
    const quantity = mainItem.getAttribute("QUANTITY") || "1";
    const repetition = mainItem.getAttribute("REPETITION") || "1";
    const totalQuantity = parseInt(quantity, 10) * parseInt(repetition, 10);
    
    const observations = mainItem.getAttribute("OBSERVATIONS") || "";
    
    csvContent += `<tr>
        <td>${rowCount}</td>
        <td class="module-cell">${moduleDescription}</td>
        <td>Cliente</td>
        <td>${escapeHtml(family)}</td>
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
};

/**
 * Process model categories from XML
 */
const processModelCategories = (xmlDoc: Document, csvContent: string): string => {
  const modelCategories = Array.from(
    xmlDoc.querySelectorAll(
      "MODELCATEGORYINFORMATION, ModelCategoryInformation, modelcategoryinformation"
    )
  );

  if (modelCategories.length === 0) {
    return csvContent + getDefaultExampleRow();
  }

  let rowCount = 1;

  modelCategories.forEach((category) => {
    const categoryDesc =
      category.getAttribute("DESCRIPTION") ||
      category.getAttribute("Description") ||
      "Unknown Category";
      
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
          <td class="module-cell">Cozinhas</td>
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
    return csvContent + getDefaultExampleRow();
  }

  return csvContent;
};

/**
 * Extract properties from an item element
 */
const extractItemProperties = (item: Element) => {
  let material = "";
  let color = "";
  let thickness = "";
  let modelExt = "";
  let edgeColor = "";
  let edgeBottom = "";
  let edgeTop = "";
  let edgeRight = "";
  let edgeLeft = "";
  
  const referencesElement = item.querySelector("REFERENCES");
  
  if (referencesElement) {
    const materialElement = referencesElement.querySelector("MATERIAL");
    const modelExtElement = referencesElement.querySelector("MODEL_EXT");
    const modelElement = referencesElement.querySelector("MODEL");
    const thicknessElement = referencesElement.querySelector("THICKNESS");
    const fitaBordaElement = referencesElement.querySelector("MODEL_DESCRIPTION_FITA");
    
    if (materialElement) {
      material = materialElement.getAttribute("REFERENCE") || "";
    }
    
    if (modelExtElement) {
      modelExt = modelExtElement.getAttribute("REFERENCE") || "";
    } else if (modelElement) {
      color = modelElement.getAttribute("REFERENCE") || "";
    }
    
    if (thicknessElement) {
      thickness = thicknessElement.getAttribute("REFERENCE") || "";
    }
    
    if (fitaBordaElement) {
      edgeColor = fitaBordaElement.getAttribute("REFERENCE") || "";
    } else {
      edgeColor = modelExt || color;
    }
    
    const edgeBottom1 = referencesElement.querySelector("FITA_BORDA_1");
    const edgeTop2 = referencesElement.querySelector("FITA_BORDA_2");
    const edgeRight3 = referencesElement.querySelector("FITA_BORDA_3");
    const edgeLeft4 = referencesElement.querySelector("FITA_BORDA_4");
    
    if (edgeBottom1 && edgeBottom1.getAttribute("REFERENCE") === "1") {
      edgeBottom = "X";
    }
    
    if (edgeTop2 && edgeTop2.getAttribute("REFERENCE") === "1") {
      edgeTop = "X";
    }
    
    if (edgeRight3 && edgeRight3.getAttribute("REFERENCE") === "1") {
      edgeRight = "X";
    }
    
    if (edgeLeft4 && edgeLeft4.getAttribute("REFERENCE") === "1") {
      edgeLeft = "X";
    }
  }
  
  const finalColor = modelExt || color;
  
  return {
    material,
    finalColor,
    thickness,
    edgeColor,
    edgeBottom,
    edgeTop,
    edgeRight,
    edgeLeft
  };
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
