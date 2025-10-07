import { PieceData } from '@/components/OptimizationResults';
import { Material, Edgeband, Service, EstimateCalculation, EstimateMaterial, EstimateEdgeband, EstimateService } from '@/types/estimate';

interface CalculateEstimateParams {
  pieces: PieceData[];
  material: Material;
  edgeband: Edgeband;
  services: Service[];
  profitMargin: number;
  taxPercent: number;
  discountPercent: number;
}

interface EstimateResult extends EstimateCalculation {
  material_cost: number;
  edgeband_cost: number;
  service_cost: number;
  subtotal: number;
  total: number;
}

/**
 * Calcula orçamento completo baseado nas peças e preços
 */
export function calculateEstimate(params: CalculateEstimateParams): EstimateResult {
  const { pieces, material, edgeband, services, profitMargin, taxPercent, discountPercent } = params;

  // 1. Calcular materiais necessários
  const materialsResult = calculateMaterials(pieces, material);
  
  // 2. Calcular bordas necessárias
  const edgebandsResult = calculateEdgebands(pieces, edgeband);
  
  // 3. Calcular serviços
  const servicesResult = calculateServices(pieces, services);
  
  // 4. Calcular totais
  const materialCost = materialsResult.reduce((sum, m) => sum + m.total_price, 0);
  const edgebandCost = edgebandsResult.reduce((sum, e) => sum + e.total_price, 0);
  const serviceCost = servicesResult.reduce((sum, s) => sum + s.total_price, 0);
  
  const subtotalBeforeMargin = materialCost + edgebandCost + serviceCost;
  const subtotalWithMargin = subtotalBeforeMargin * (1 + profitMargin / 100);
  const subtotalWithTax = subtotalWithMargin * (1 + taxPercent / 100);
  const total = subtotalWithTax * (1 - discountPercent / 100);

  // 5. Calcular resumo
  const totalPieces = pieces.reduce((sum, p) => sum + p.quantity, 0);
  const totalSheets = materialsResult.reduce((sum, m) => sum + m.quantity, 0);
  const totalAreaSqm = materialsResult.reduce((sum, m) => sum + m.area_sqm, 0);
  const totalEdgebandMeters = edgebandsResult.reduce((sum, e) => sum + e.length_meters, 0);
  const avgWastePercent = materialsResult.reduce((sum, m) => sum + m.waste_percent, 0) / materialsResult.length || 0;

  return {
    materials: materialsResult,
    edgebands: edgebandsResult,
    services: servicesResult,
    summary: {
      total_pieces: totalPieces,
      total_sheets: totalSheets,
      total_area_sqm: Number(totalAreaSqm.toFixed(4)),
      total_edgeband_meters: Number(totalEdgebandMeters.toFixed(2)),
      avg_waste_percent: Number(avgWastePercent.toFixed(2)),
    },
    material_cost: Number(materialCost.toFixed(2)),
    edgeband_cost: Number(edgebandCost.toFixed(2)),
    service_cost: Number(serviceCost.toFixed(2)),
    subtotal: Number(subtotalWithMargin.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

/**
 * Calcula quantidade de chapas necessárias
 */
function calculateMaterials(pieces: PieceData[], material: Material): EstimateMaterial[] {
  // Calcular área total necessária
  let totalAreaMm2 = 0;
  
  pieces.forEach(piece => {
    const pieceArea = piece.width * piece.depth * piece.quantity;
    totalAreaMm2 += pieceArea;
  });

  // Converter para m²
  const totalAreaM2 = totalAreaMm2 / 1000000;
  
  // Calcular área da chapa padrão
  const sheetAreaM2 = (material.width_mm * material.height_mm) / 1000000;
  
  // Calcular número de chapas com fator de aproveitamento
  const wastePercent = ((1 - material.yield_factor) * 100);
  const effectiveAreaPerSheet = sheetAreaM2 * material.yield_factor;
  const numberOfSheets = Math.ceil(totalAreaM2 / effectiveAreaPerSheet);
  
  // Calcular preço
  const actualAreaUsed = numberOfSheets * sheetAreaM2;
  const totalPrice = actualAreaUsed * material.price_per_sqm;

  return [{
    id: '', // Will be set when saving to DB
    estimate_id: '',
    material_id: material.id,
    material_name: material.name,
    material_type: material.type,
    thickness_mm: material.thickness_mm,
    quantity: numberOfSheets,
    area_sqm: Number(actualAreaUsed.toFixed(4)),
    waste_percent: Number(wastePercent.toFixed(2)),
    unit_price: material.price_per_sqm,
    total_price: Number(totalPrice.toFixed(2)),
    created_at: new Date().toISOString(),
  }];
}

/**
 * Calcula metragem de bordas necessárias
 */
function calculateEdgebands(pieces: PieceData[], edgeband: Edgeband): EstimateEdgeband[] {
  let totalLengthMm = 0;

  pieces.forEach(piece => {
    let pieceLengthMm = 0;
    
    // Somar cada borda marcada
    if (piece.edgeTop === 'X') pieceLengthMm += piece.width;
    if (piece.edgeBottom === 'X') pieceLengthMm += piece.width;
    if (piece.edgeLeft === 'X') pieceLengthMm += piece.depth;
    if (piece.edgeRight === 'X') pieceLengthMm += piece.depth;
    
    totalLengthMm += pieceLengthMm * piece.quantity;
  });

  // Converter para metros
  const totalLengthMeters = totalLengthMm / 1000;
  
  // Calcular preço
  const totalPrice = totalLengthMeters * edgeband.price_per_meter;

  return [{
    id: '',
    estimate_id: '',
    edgeband_id: edgeband.id,
    edgeband_name: edgeband.name,
    thickness_mm: edgeband.thickness_mm,
    length_meters: Number(totalLengthMeters.toFixed(2)),
    price_per_meter: edgeband.price_per_meter,
    total_price: Number(totalPrice.toFixed(2)),
    created_at: new Date().toISOString(),
  }];
}

/**
 * Calcula custos de serviços
 */
function calculateServices(pieces: PieceData[], services: Service[]): EstimateService[] {
  const totalPieces = pieces.reduce((sum, p) => sum + p.quantity, 0);
  const result: EstimateService[] = [];

  services.forEach(service => {
    let quantity = 0;
    
    switch (service.type) {
      case 'corte':
        // Estimar 4 cortes por peça em média
        quantity = totalPieces * 4;
        break;
      case 'furacao':
        // Estimar 8 furos por peça em média (dobradiças, corrediças)
        quantity = totalPieces * 8;
        break;
      case 'usinagem':
        // Aplicação de borda: já calculado em edgebands, skip
        return;
      case 'montagem':
        quantity = totalPieces;
        break;
      case 'transporte':
        quantity = 1; // Um transporte por projeto
        break;
      default:
        quantity = totalPieces;
    }

    const totalPrice = quantity * service.price_per_unit;

    result.push({
      id: '',
      estimate_id: '',
      service_id: service.id,
      service_name: service.name,
      service_type: service.type,
      unit: service.unit,
      quantity: Number(quantity.toFixed(2)),
      price_per_unit: service.price_per_unit,
      total_price: Number(totalPrice.toFixed(2)),
      created_at: new Date().toISOString(),
    });
  });

  return result;
}

/**
 * Formata valor monetário para exibição
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Calcula simulação com material alternativo
 */
export function simulateAlternativeMaterial(
  params: CalculateEstimateParams,
  alternativeMaterial: Material
): EstimateResult {
  return calculateEstimate({
    ...params,
    material: alternativeMaterial,
  });
}
