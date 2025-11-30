import jsPDF from 'jspdf';

interface PDFBudgetData {
  projectName: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  totalMateriais: number;
  totalMaoObra: number;
  lucro: number;
  precoFinal: number;
  items: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
  createdAt: string;
}

export const generateBudgetPDF = (data: PDFBudgetData): Blob => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // primary color
  doc.text('PromobConverter Pro', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Orçamento Profissional', 105, 30, { align: 'center' });
  
  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, 190, 35);
  
  // Project Info
  let yPos = 45;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Projeto:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.projectName, 45, yPos);
  
  yPos += 10;
  if (data.clientName) {
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientName, 45, yPos);
    yPos += 10;
  }
  
  if (data.clientEmail) {
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientEmail, 45, yPos);
    yPos += 10;
  }
  
  if (data.clientPhone) {
    doc.setFont('helvetica', 'bold');
    doc.text('Telefone:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientPhone, 45, yPos);
    yPos += 10;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('Data:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(data.createdAt).toLocaleDateString('pt-BR'), 45, yPos);
  
  // Items Section
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Itens do Orçamento', 20, yPos);
  doc.line(20, yPos + 2, 190, yPos + 2);
  
  yPos += 10;
  doc.setFontSize(10);
  
  // Table header
  doc.setFillColor(59, 130, 246);
  doc.rect(20, yPos, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('Item', 25, yPos + 5);
  doc.text('Qtd', 120, yPos + 5);
  doc.text('Valor', 160, yPos + 5, { align: 'right' });
  
  yPos += 10;
  doc.setTextColor(0, 0, 0);
  
  // Items
  data.items.forEach((item, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    const bgColor: [number, number, number] = index % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.rect(20, yPos - 3, 170, 8, 'F');
    
    doc.text(item.name, 25, yPos + 2);
    doc.text((item.quantity || 1).toString(), 120, yPos + 2);
    doc.text(`R$ ${item.price.toFixed(2)}`, 185, yPos + 2, { align: 'right' });
    
    yPos += 8;
  });
  
  // Summary
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(120, yPos, 190, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.text('Total Materiais:', 120, yPos);
  doc.text(`R$ ${data.totalMateriais.toFixed(2)}`, 185, yPos, { align: 'right' });
  
  yPos += 8;
  doc.text('Total Mão de Obra:', 120, yPos);
  doc.text(`R$ ${data.totalMaoObra.toFixed(2)}`, 185, yPos, { align: 'right' });
  
  yPos += 8;
  doc.text('Lucro:', 120, yPos);
  doc.text(`R$ ${data.lucro.toFixed(2)}`, 185, yPos, { align: 'right' });
  
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Valor Final:', 120, yPos);
  doc.setTextColor(22, 163, 74); // green
  doc.text(`R$ ${data.precoFinal.toFixed(2)}`, 185, yPos, { align: 'right' });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Gerado por PromobConverter Pro - Página ${i} de ${pageCount}`,
      105,
      285,
      { align: 'center' }
    );
  }
  
  return doc.output('blob');
};

interface PDFMaterialsData {
  projectName: string;
  materials: Array<{
    name: string;
    quantity: number;
    unit: string;
    category: string;
  }>;
  createdAt: string;
}

export const generateMaterialsPDF = (data: PDFMaterialsData): Blob => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('PromobConverter Pro', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Lista de Materiais (BOM)', 105, 30, { align: 'center' });
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, 190, 35);
  
  // Project Info
  let yPos = 45;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Projeto:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.projectName, 45, yPos);
  
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Data:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(data.createdAt).toLocaleDateString('pt-BR'), 45, yPos);
  
  // Materials by category
  yPos += 15;
  const categories = [...new Set(data.materials.map(m => m.category))];
  
  categories.forEach(category => {
    const categoryMaterials = data.materials.filter(m => m.category === category);
    
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(category, 20, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 10;
    doc.setFontSize(10);
    
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.rect(20, yPos, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Material', 25, yPos + 5);
    doc.text('Quantidade', 130, yPos + 5);
    doc.text('Unidade', 170, yPos + 5);
    
    yPos += 10;
    doc.setTextColor(0, 0, 0);
    
    categoryMaterials.forEach((material, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const bgColor: [number, number, number] = index % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.rect(20, yPos - 3, 170, 8, 'F');
      
      doc.text(material.name, 25, yPos + 2);
      doc.text(material.quantity.toString(), 130, yPos + 2);
      doc.text(material.unit, 170, yPos + 2);
      
      yPos += 8;
    });
    
    yPos += 10;
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Gerado por PromobConverter Pro - Página ${i} de ${pageCount}`,
      105,
      285,
      { align: 'center' }
    );
  }
  
  return doc.output('blob');
};
