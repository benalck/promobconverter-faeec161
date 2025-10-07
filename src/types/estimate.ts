// Types para o sistema de orçamentos

export interface Supplier {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  name: string;
  type: string;
  thickness_mm: number;
  width_mm: number;
  height_mm: number;
  color?: string;
  finish?: string;
  price_per_sqm: number;
  yield_factor: number;
  supplier_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Edgeband {
  id: string;
  name: string;
  thickness_mm: number;
  width_mm: number;
  color?: string;
  material?: string;
  price_per_meter: number;
  supplier_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  type: string;
  unit: string;
  price_per_unit: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Estimate {
  id: string;
  user_id: string;
  name: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'in_production';
  version: number;
  
  profit_margin_percent: number;
  tax_percent: number;
  discount_percent: number;
  
  material_cost: number;
  edgeband_cost: number;
  service_cost: number;
  subtotal: number;
  total: number;
  
  pieces_data?: any;
  calculation_data?: any;
  notes?: string;
  valid_until?: string;
  
  created_at: string;
  updated_at: string;
  approved_at?: string;
  sent_at?: string;
}

export interface EstimateMaterial {
  id: string;
  estimate_id: string;
  material_id?: string;
  material_name: string;
  material_type?: string;
  thickness_mm?: number;
  quantity: number;
  area_sqm: number;
  waste_percent: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface EstimateEdgeband {
  id: string;
  estimate_id: string;
  edgeband_id?: string;
  edgeband_name: string;
  thickness_mm?: number;
  length_meters: number;
  price_per_meter: number;
  total_price: number;
  created_at: string;
}

export interface EstimateService {
  id: string;
  estimate_id: string;
  service_id?: string;
  service_name: string;
  service_type?: string;
  unit?: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  created_at: string;
}

export interface EstimateCalculation {
  materials: EstimateMaterial[];
  edgebands: EstimateEdgeband[];
  services: EstimateService[];
  summary: {
    total_pieces: number;
    total_sheets: number;
    total_area_sqm: number;
    total_edgeband_meters: number;
    avg_waste_percent: number;
  };
}
