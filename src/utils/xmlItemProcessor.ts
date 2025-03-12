
import { escapeHtml } from "./xmlConverter";
import { extractItemPropertiesFromXML } from "./xmlExtractors";

/**
 * Processa os elementos de item do XML e retorna o conteúdo CSV
 */
export const processItemElements = (itemElements: NodeListOf<Element>, csvContent: string): string => {
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
    const itemId = mainModule.getAttribute("ITEMID") || mainModule.getAttribute("ID") || uniqueId; // Extraindo o ITEMID
    
    // Se encontrarmos "Especial" na descrição, substituímos por "Sarafo Frontal Passante"
    const processedDescription = description.includes("Especial") ? "Sarafo Frontal Passante" : description;
    
    // Se for um tamponamento, processar diretamente
    if (group === "Tamponamentos") {
      const componentProps = extractItemPropertiesFromXML(mainModule);
      
      csvContent += `<tr>
        <td>${rowCount}</td>
        <td class="module-cell">${processedDescription}</td>
        <td></td>
        <td>${family}</td>
        <td class="piece-desc">${itemId} - ${processedDescription}</td>
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
    
    const moduleDescription = `(${itemId}) - ${processedDescription} - L.${width}mm x A.${height}mm x P.${depth}mm`;
    
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
      const componentProps = extractItemPropertiesFromXML(component);
      const componentWidth = component.getAttribute("WIDTH") || "";
      const componentDepth = component.getAttribute("DEPTH") || "";
      const componentDesc = component.getAttribute("DESCRIPTION") || "";
      const componentRepetition = component.getAttribute("REPETITION") || "1";
      const componentObs = component.getAttribute("OBSERVATIONS") || "";
      const componentItemId = component.getAttribute("ITEMID") || component.getAttribute("ID") || uniqueId; // Extraindo o ITEMID do componente
      
      // Substituir "Especial" por "Sarafo Frontal Passante" também nos componentes
      const processedComponentDesc = componentDesc.includes("Especial") ? "Sarafo Frontal Passante" : componentDesc;
      
      csvContent += `<tr>
        <td>${rowCount}</td>
        ${isFirstRow ? `<td class="module-cell" ${totalRows > 1 ? `rowspan="${totalRows}"` : ""}>${moduleDescription}</td>` : ""}
        <td></td>
        <td>${family}</td>
        <td class="piece-desc">${componentItemId} - ${processedComponentDesc}</td>
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
