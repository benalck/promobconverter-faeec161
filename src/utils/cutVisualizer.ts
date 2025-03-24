
/**
 * Utilities for visualizing cut plans
 */

interface Piece {
  id: string;
  width: number;
  height: number;
  quantity: number;
  edges: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
  material: string;
  color: string;
  thickness: string;
}

interface SheetStats {
  material: string;
  color: string;
  thickness: string;
  totalArea: number;
  quantity: number;
}

/**
 * Calculate sheet statistics from a list of pieces
 */
export const calculateSheetStats = (pieces: Piece[]): SheetStats[] => {
  const sheetMap = new Map<string, SheetStats>();
  
  pieces.forEach(piece => {
    const key = `${piece.material}-${piece.color}-${piece.thickness}`;
    const pieceArea = (piece.width * piece.height * piece.quantity) / 1000000; // Convert to m²
    
    if (sheetMap.has(key)) {
      const stats = sheetMap.get(key)!;
      stats.totalArea += pieceArea;
      // Assuming standard sheet size of 2.75m x 1.83m = 5.0325m²
      stats.quantity = Math.ceil(stats.totalArea / 5.0325);
    } else {
      sheetMap.set(key, {
        material: piece.material,
        color: piece.color,
        thickness: piece.thickness,
        totalArea: pieceArea,
        quantity: Math.ceil(pieceArea / 5.0325)
      });
    }
  });
  
  return Array.from(sheetMap.values());
};

/**
 * Generate HTML for sheet statistics table
 */
export const generateSheetStatsHTML = (stats: SheetStats[]): string => {
  if (!stats || stats.length === 0) {
    return "<p>Nenhuma estatística de chapa disponível</p>";
  }
  
  let html = `
    <div class="sheet-stats-container mt-4">
      <h3 class="text-base font-semibold mb-2">Chapas Necessárias</h3>
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-2 py-1">Material</th>
            <th class="border border-gray-300 px-2 py-1">Cor</th>
            <th class="border border-gray-300 px-2 py-1">Espessura</th>
            <th class="border border-gray-300 px-2 py-1">Área Total (m²)</th>
            <th class="border border-gray-300 px-2 py-1">Chapas Necessárias</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  stats.forEach(stat => {
    html += `
      <tr>
        <td class="border border-gray-300 px-2 py-1">${stat.material}</td>
        <td class="border border-gray-300 px-2 py-1">${stat.color}</td>
        <td class="border border-gray-300 px-2 py-1">${stat.thickness}</td>
        <td class="border border-gray-300 px-2 py-1">${stat.totalArea.toFixed(2)}</td>
        <td class="border border-gray-300 px-2 py-1">${stat.quantity}</td>
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

/**
 * Generate basic SVG visual representation of the cut plan
 */
export const generateCutVisualization = (pieces: Piece[]): string => {
  if (!pieces || pieces.length === 0) {
    return "";
  }
  
  // Group pieces by material/color/thickness for visualization
  const piecesByMaterial = new Map<string, Piece[]>();
  
  pieces.forEach(piece => {
    const key = `${piece.material}-${piece.color}-${piece.thickness}`;
    if (!piecesByMaterial.has(key)) {
      piecesByMaterial.set(key, []);
    }
    piecesByMaterial.get(key)!.push(piece);
  });
  
  let html = `
    <div class="cut-visualization-container mt-6">
      <h3 class="text-base font-semibold mb-2">Visualização de Cortes</h3>
  `;
  
  piecesByMaterial.forEach((materialPieces, key) => {
    const [material, color, thickness] = key.split('-');
    
    html += `
      <div class="material-section mb-4">
        <h4 class="text-sm font-medium mb-2">${material} ${color} ${thickness}</h4>
        <div class="bg-gray-100 p-2 border border-gray-300" style="height: 400px; overflow: auto;">
          <svg width="800" height="600" viewBox="0 0 800 600" class="cut-svg">
            <rect x="0" y="0" width="800" height="600" fill="#f8f8f8" stroke="#ccc" stroke-width="2" />
            <!-- Sheet representation (standard 2750mm x 1830mm) -->
            <rect x="50" y="50" width="700" height="500" fill="#fff" stroke="#888" stroke-width="2" />
    `;
    
    // Simple algorithm to place pieces on the sheet (very basic - just for visualization)
    let currentX = 60;
    let currentY = 60;
    let rowHeight = 0;
    
    materialPieces.forEach((piece, index) => {
      // Scale down the piece dimensions for visualization
      const pieceWidth = piece.width / 10;
      const pieceHeight = piece.height / 10;
      
      // Check if we need to move to the next row
      if (currentX + pieceWidth > 740) {
        currentX = 60;
        currentY += rowHeight + 10;
        rowHeight = 0;
      }
      
      // Skip if out of bounds
      if (currentY + pieceHeight > 540) {
        return;
      }
      
      // Draw the piece
      html += `
        <g>
          <rect 
            x="${currentX}" 
            y="${currentY}" 
            width="${pieceWidth}" 
            height="${pieceHeight}" 
            fill="#d1e7ff" 
            stroke="#0066cc" 
            stroke-width="1"
          />
          <text 
            x="${currentX + pieceWidth/2}" 
            y="${currentY + pieceHeight/2}" 
            text-anchor="middle" 
            dominant-baseline="middle"
            font-size="10"
            fill="#333"
          >${piece.id}</text>
        </g>
      `;
      
      // Update position for next piece
      currentX += pieceWidth + 10;
      rowHeight = Math.max(rowHeight, pieceHeight);
    });
    
    html += `
          </svg>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  
  return html;
};
