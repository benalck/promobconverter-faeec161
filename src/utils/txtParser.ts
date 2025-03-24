
/**
 * Parse TXT files from woodworking software into structured data
 */

interface TXTPiece {
  id: string;
  description: string;
  material: string;
  width: number;
  height: number;
  quantity: number;
  edgeTop: string;
  edgeBottom: string;
  edgeLeft: string;
  edgeRight: string;
  thickness: string;
  color: string;
}

/**
 * Convert TXT content to HTML format compatible with Excel
 */
export const convertTXTToHTML = (txtContent: string): string => {
  try {
    if (!txtContent || typeof txtContent !== 'string') {
      throw new Error("Conteúdo TXT inválido ou vazio");
    }
    
    // Detect format type
    if (txtContent.includes("|")) {
      return parsePipeDelimitedFormat(txtContent);
    } else if (txtContent.includes(";")) {
      return parseSemicolonDelimitedFormat(txtContent);
    } else if (txtContent.trim().startsWith("PEÇA") || txtContent.trim().startsWith("PECA")) {
      return parseKeyValuePairFormat(txtContent);
    } else {
      throw new Error("Formato do arquivo TXT não reconhecido. Suportamos formatos delimitados por | ou ; e formato chave/valor.");
    }
  } catch (error) {
    console.error("Erro durante a conversão TXT para HTML:", error);
    if (error instanceof Error) {
      throw new Error(`Falha na conversão: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido durante a conversão do arquivo");
  }
};

/**
 * Parse pipe-delimited format (common in some cut optimization software)
 */
const parsePipeDelimitedFormat = (txtContent: string): string => {
  const lines = txtContent.split('\n').filter(line => line.trim() !== '');
  
  // Identify header line
  const headerLine = lines[0];
  const headers = headerLine.split('|').map(h => h.trim());
  
  let csvContent = `<tr>
    <th>NUM.</th>
    <th>MÓDULO</th>
    <th>AMBIENTE</th>
    <th class="piece-desc">DESC. DA PEÇA</th>
    <th style="background-color: #F7CAAC;" class="comp">COMP</th>
    <th style="background-color: #BDD6EE;" class="larg">LARG</th>
    <th>QUANT</th>
    <th style="background-color: #F7CAAC;" class="borda-inf">BORDA INF</th>
    <th style="background-color: #F7CAAC;" class="borda-sup">BORDA SUP</th>
    <th style="background-color: #BDD6EE;" class="borda-dir">BORDA DIR</th>
    <th style="background-color: #BDD6EE;" class="borda-esq">BORDA ESQ</th>
    <th class="material">CHAPA</th>
    <th class="material">ESP.</th>
  </tr>`;
  
  // Map column indexes based on headers
  const descIndex = headers.findIndex(h => h.toLowerCase().includes('desc'));
  const widthIndex = headers.findIndex(h => h.toLowerCase().includes('larg') || h.toLowerCase().includes('width'));
  const heightIndex = headers.findIndex(h => h.toLowerCase().includes('alt') || h.toLowerCase().includes('comp') || h.toLowerCase().includes('height'));
  const quantityIndex = headers.findIndex(h => h.toLowerCase().includes('qtd') || h.toLowerCase().includes('quant'));
  const materialIndex = headers.findIndex(h => h.toLowerCase().includes('material') || h.toLowerCase().includes('chapa'));
  const thicknessIndex = headers.findIndex(h => h.toLowerCase().includes('esp') || h.toLowerCase().includes('thick'));
  const colorIndex = headers.findIndex(h => h.toLowerCase().includes('cor') || h.toLowerCase().includes('color'));
  
  // Process data lines
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split('|').map(c => c.trim());
    if (columns.length < 3) continue; // Skip invalid lines
    
    const description = columns[descIndex] || `Peça ${i}`;
    const width = columns[widthIndex] || '0';
    const height = columns[heightIndex] || '0';
    const quantity = columns[quantityIndex] || '1';
    const material = columns[materialIndex] || 'MDF';
    const thickness = columns[thicknessIndex] || '15mm';
    const color = columns[colorIndex] || 'Branco';
    
    csvContent += `<tr>
      <td>${i}</td>
      <td class="module-cell"></td>
      <td>Ambiente</td>
      <td class="piece-desc">${description}</td>
      <td class="comp">${height}</td>
      <td class="larg">${width}</td>
      <td>${quantity}</td>
      <td class="borda-inf"></td>
      <td class="borda-sup"></td>
      <td class="borda-dir"></td>
      <td class="borda-esq"></td>
      <td class="material">${material} ${color}</td>
      <td class="material">${thickness}</td>
    </tr>`;
  }
  
  return csvContent;
};

/**
 * Parse semicolon-delimited format (common in European software)
 */
const parseSemicolonDelimitedFormat = (txtContent: string): string => {
  const lines = txtContent.split('\n').filter(line => line.trim() !== '');
  
  // Identify header line
  const headerLine = lines[0];
  const headers = headerLine.split(';').map(h => h.trim());
  
  let csvContent = `<tr>
    <th>NUM.</th>
    <th>MÓDULO</th>
    <th>AMBIENTE</th>
    <th class="piece-desc">DESC. DA PEÇA</th>
    <th style="background-color: #F7CAAC;" class="comp">COMP</th>
    <th style="background-color: #BDD6EE;" class="larg">LARG</th>
    <th>QUANT</th>
    <th style="background-color: #F7CAAC;" class="borda-inf">BORDA INF</th>
    <th style="background-color: #F7CAAC;" class="borda-sup">BORDA SUP</th>
    <th style="background-color: #BDD6EE;" class="borda-dir">BORDA DIR</th>
    <th style="background-color: #BDD6EE;" class="borda-esq">BORDA ESQ</th>
    <th class="material">CHAPA</th>
    <th class="material">ESP.</th>
  </tr>`;
  
  // Map column indexes based on headers
  const descIndex = headers.findIndex(h => h.toLowerCase().includes('desc') || h.toLowerCase().includes('nome'));
  const widthIndex = headers.findIndex(h => h.toLowerCase().includes('larg') || h.toLowerCase().includes('width'));
  const heightIndex = headers.findIndex(h => h.toLowerCase().includes('alt') || h.toLowerCase().includes('comp') || h.toLowerCase().includes('height'));
  const quantityIndex = headers.findIndex(h => h.toLowerCase().includes('qtd') || h.toLowerCase().includes('quant'));
  const materialIndex = headers.findIndex(h => h.toLowerCase().includes('material') || h.toLowerCase().includes('chapa'));
  const thicknessIndex = headers.findIndex(h => h.toLowerCase().includes('esp') || h.toLowerCase().includes('thick'));
  const colorIndex = headers.findIndex(h => h.toLowerCase().includes('cor') || h.toLowerCase().includes('color'));
  
  // Process data lines
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(';').map(c => c.trim());
    if (columns.length < 3) continue; // Skip invalid lines
    
    const description = columns[descIndex] || `Peça ${i}`;
    const width = columns[widthIndex] || '0';
    const height = columns[heightIndex] || '0';
    const quantity = columns[quantityIndex] || '1';
    const material = columns[materialIndex] || 'MDF';
    const thickness = columns[thicknessIndex] || '15mm';
    const color = columns[colorIndex] || 'Branco';
    
    csvContent += `<tr>
      <td>${i}</td>
      <td class="module-cell"></td>
      <td>Ambiente</td>
      <td class="piece-desc">${description}</td>
      <td class="comp">${height}</td>
      <td class="larg">${width}</td>
      <td>${quantity}</td>
      <td class="borda-inf"></td>
      <td class="borda-sup"></td>
      <td class="borda-dir"></td>
      <td class="borda-esq"></td>
      <td class="material">${material} ${color}</td>
      <td class="material">${thickness}</td>
    </tr>`;
  }
  
  return csvContent;
};

/**
 * Parse key/value pair format (common in older software)
 */
const parseKeyValuePairFormat = (txtContent: string): string => {
  const lines = txtContent.split('\n').filter(line => line.trim() !== '');
  const pieces: TXTPiece[] = [];
  let currentPiece: Partial<TXTPiece> = {};
  
  // Process lines to extract pieces
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith("PEÇA") || line.startsWith("PECA")) {
      // Start of a new piece
      if (Object.keys(currentPiece).length > 0) {
        pieces.push(currentPiece as TXTPiece);
      }
      currentPiece = { id: line.split(' ')[1] || String(pieces.length + 1) };
    } else if (line.includes(':')) {
      // Key-value pair
      const [key, value] = line.split(':').map(part => part.trim());
      
      if (key.toLowerCase().includes('desc')) {
        currentPiece.description = value;
      } else if (key.toLowerCase().includes('material')) {
        currentPiece.material = value;
      } else if (key.toLowerCase().includes('larg')) {
        currentPiece.width = parseInt(value, 10);
      } else if (key.toLowerCase().includes('alt') || key.toLowerCase().includes('comp')) {
        currentPiece.height = parseInt(value, 10);
      } else if (key.toLowerCase().includes('quant')) {
        currentPiece.quantity = parseInt(value, 10);
      } else if (key.toLowerCase().includes('borda sup')) {
        currentPiece.edgeTop = value === '1' || value.toLowerCase() === 'sim' ? 'X' : '';
      } else if (key.toLowerCase().includes('borda inf')) {
        currentPiece.edgeBottom = value === '1' || value.toLowerCase() === 'sim' ? 'X' : '';
      } else if (key.toLowerCase().includes('borda esq')) {
        currentPiece.edgeLeft = value === '1' || value.toLowerCase() === 'sim' ? 'X' : '';
      } else if (key.toLowerCase().includes('borda dir')) {
        currentPiece.edgeRight = value === '1' || value.toLowerCase() === 'sim' ? 'X' : '';
      } else if (key.toLowerCase().includes('espessura')) {
        currentPiece.thickness = value.includes('mm') ? value : `${value}mm`;
      } else if (key.toLowerCase().includes('cor')) {
        currentPiece.color = value;
      }
    }
  }
  
  // Add the last piece if there is one
  if (Object.keys(currentPiece).length > 0) {
    pieces.push(currentPiece as TXTPiece);
  }
  
  // Generate HTML
  let csvContent = `<tr>
    <th>NUM.</th>
    <th>MÓDULO</th>
    <th>AMBIENTE</th>
    <th class="piece-desc">DESC. DA PEÇA</th>
    <th style="background-color: #F7CAAC;" class="comp">COMP</th>
    <th style="background-color: #BDD6EE;" class="larg">LARG</th>
    <th>QUANT</th>
    <th style="background-color: #F7CAAC;" class="borda-inf">BORDA INF</th>
    <th style="background-color: #F7CAAC;" class="borda-sup">BORDA SUP</th>
    <th style="background-color: #BDD6EE;" class="borda-dir">BORDA DIR</th>
    <th style="background-color: #BDD6EE;" class="borda-esq">BORDA ESQ</th>
    <th class="material">CHAPA</th>
    <th class="material">ESP.</th>
  </tr>`;
  
  pieces.forEach((piece, index) => {
    csvContent += `<tr>
      <td>${index + 1}</td>
      <td class="module-cell"></td>
      <td>Ambiente</td>
      <td class="piece-desc">${piece.description || `Peça ${piece.id}`}</td>
      <td class="comp">${piece.height || 0}</td>
      <td class="larg">${piece.width || 0}</td>
      <td>${piece.quantity || 1}</td>
      <td class="borda-inf">${piece.edgeBottom || ''}</td>
      <td class="borda-sup">${piece.edgeTop || ''}</td>
      <td class="borda-dir">${piece.edgeRight || ''}</td>
      <td class="borda-esq">${piece.edgeLeft || ''}</td>
      <td class="material">${piece.material || 'MDF'} ${piece.color || 'Branco'}</td>
      <td class="material">${piece.thickness || '15mm'}</td>
    </tr>`;
  });
  
  return csvContent;
};
