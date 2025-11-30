import * as XLSX from 'xlsx';

interface Material {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

export const exportMaterialsToExcel = (materials: Material[], projectName: string) => {
  // Group by category
  const categories = [...new Set(materials.map(m => m.category))];
  
  const wb = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['Lista de Materiais - ' + projectName],
    ['Data de Geração', new Date().toLocaleDateString('pt-BR')],
    [],
    ['Categoria', 'Material', 'Quantidade', 'Unidade'],
  ];
  
  materials.forEach(material => {
    summaryData.push([
      material.category,
      material.name,
      material.quantity.toString(),
      material.unit,
    ]);
  });
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  summarySheet['!cols'] = [
    { wch: 20 },
    { wch: 40 },
    { wch: 15 },
    { wch: 10 },
  ];
  
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumo');
  
  // Category sheets
  categories.forEach(category => {
    const categoryMaterials = materials.filter(m => m.category === category);
    const categoryData = [
      [category],
      [],
      ['Material', 'Quantidade', 'Unidade'],
    ];
    
    categoryMaterials.forEach(material => {
      categoryData.push([
        material.name,
        material.quantity.toString(),
        material.unit,
      ]);
    });
    
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    categorySheet['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 10 }];
    
    // Sanitize sheet name (max 31 chars, no special chars)
    const sheetName = category.substring(0, 31).replace(/[:\\/?*\[\]]/g, '');
    XLSX.utils.book_append_sheet(wb, categorySheet, sheetName);
  });
  
  // Generate file
  XLSX.writeFile(wb, `${projectName}_materiais.xlsx`);
};

interface CutLayout {
  sheetIndex: number;
  pieces: Array<{
    id: string;
    name?: string;
    width: number;
    height: number;
    x: number;
    y: number;
  }>;
}

export const exportCutsToExcel = (
  layouts: CutLayout[],
  projectName: string,
  totalSheets: number,
  wastePercentage: number
) => {
  const wb = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['Otimização de Cortes - ' + projectName],
    ['Data de Geração', new Date().toLocaleDateString('pt-BR')],
    [],
    ['Total de Chapas', totalSheets],
    ['Desperdício', `${wastePercentage.toFixed(2)}%`],
    [],
    ['Chapa', 'Peças', 'Utilização'],
  ];
  
  layouts.forEach(layout => {
    summaryData.push([
      `Chapa ${layout.sheetIndex}`,
      layout.pieces.length,
      `${((layout.pieces.length / 20) * 100).toFixed(1)}%`, // approximate
    ]);
  });
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumo');
  
  // Detail sheets for each board
  layouts.forEach(layout => {
    const sheetData = [
      [`Chapa ${layout.sheetIndex}`],
      [],
      ['Peça', 'Largura (mm)', 'Altura (mm)', 'Posição X', 'Posição Y'],
    ];
    
    layout.pieces.forEach(piece => {
      sheetData.push([
        piece.name || piece.id,
        piece.width.toString(),
        piece.height.toString(),
        piece.x.toString(),
        piece.y.toString(),
      ]);
    });
    
    const detailSheet = XLSX.utils.aoa_to_sheet(sheetData);
    detailSheet['!cols'] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
    ];
    
    XLSX.utils.book_append_sheet(wb, detailSheet, `Chapa ${layout.sheetIndex}`);
  });
  
  XLSX.writeFile(wb, `${projectName}_cortes.xlsx`);
};

export const exportToCSV = (data: any[], filename: string) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  XLSX.writeFile(wb, `${filename}.csv`, { bookType: 'csv' });
};
