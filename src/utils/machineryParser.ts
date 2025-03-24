
/**
 * Utilities for parsing machinery operations from Promob XML files
 */

interface MachineryOperation {
  type: string;
  position: {
    x: number;
    y: number;
    z?: number;
  };
  dimensions: {
    diameter?: number;
    width?: number;
    height?: number;
    depth?: number;
  };
  description: string;
}

/**
 * Extract machinery operations from a piece element in the XML
 */
export const extractMachineryOperations = (pieceElement: Element): MachineryOperation[] => {
  if (!pieceElement) return [];
  
  const operations: MachineryOperation[] = [];
  
  // Get all machinery elements
  const machineryElements = pieceElement.querySelectorAll("MACHINERY, DRILLING, ROUTERING");
  
  machineryElements.forEach(element => {
    const type = element.tagName;
    const x = parseInt(element.getAttribute("XPOS") || "0", 10);
    const y = parseInt(element.getAttribute("YPOS") || "0", 10);
    const z = parseInt(element.getAttribute("ZPOS") || "0", 10);
    
    // Basic operation with position
    const operation: MachineryOperation = {
      type: element.getAttribute("TYPE") || type,
      position: { x, y, z },
      dimensions: {},
      description: element.getAttribute("DESCRIPTION") || ""
    };
    
    // Extract specific dimensions based on operation type
    if (type === "DRILLING") {
      operation.dimensions.diameter = parseInt(element.getAttribute("DIAMETER") || "0", 10);
      operation.dimensions.depth = parseInt(element.getAttribute("DEPTH") || "0", 10);
      operation.description = `Furo ${operation.dimensions.diameter}mm x ${operation.dimensions.depth}mm`;
    } else if (type === "ROUTERING") {
      operation.dimensions.width = parseInt(element.getAttribute("WIDTH") || "0", 10);
      operation.dimensions.height = parseInt(element.getAttribute("HEIGHT") || "0", 10);
      operation.dimensions.depth = parseInt(element.getAttribute("DEPTH") || "0", 10);
      operation.description = `Rasgo ${operation.dimensions.width}mm x ${operation.dimensions.height}mm x ${operation.dimensions.depth}mm`;
    } else {
      // Generic machinery element
      const description = element.getAttribute("DESCRIPTION");
      if (description) {
        operation.description = description;
      }
    }
    
    operations.push(operation);
  });
  
  return operations;
};

/**
 * Format machinery operations into HTML string for display
 */
export const formatMachineryHTML = (operations: MachineryOperation[]): string => {
  if (!operations || operations.length === 0) {
    return "<p>Nenhuma usinagem encontrada</p>";
  }
  
  let html = `
    <div class="machinery-container">
      <h3 class="text-base font-semibold mb-2">Usinagens</h3>
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-2 py-1">Tipo</th>
            <th class="border border-gray-300 px-2 py-1">Posição</th>
            <th class="border border-gray-300 px-2 py-1">Descrição</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  operations.forEach(op => {
    html += `
      <tr>
        <td class="border border-gray-300 px-2 py-1">${op.type}</td>
        <td class="border border-gray-300 px-2 py-1">X:${op.position.x} Y:${op.position.y} ${op.position.z ? `Z:${op.position.z}` : ''}</td>
        <td class="border border-gray-300 px-2 py-1">${op.description}</td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  return html;
};
