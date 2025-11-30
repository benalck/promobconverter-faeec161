import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { XMLParser } from "npm:fast-xml-parser@4.3.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { xmlData, projectName } = await req.json();

    if (!xmlData || !projectName) {
      throw new Error('Missing required fields: xmlData and projectName');
    }

    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    
    const xmlObj = parser.parse(xmlData);

    // Extrair peças
    let pieces: any[] = [];
    
    if (xmlObj?.Projeto?.Pecas?.Peca) {
      pieces = Array.isArray(xmlObj.Projeto.Pecas.Peca) 
        ? xmlObj.Projeto.Pecas.Peca 
        : [xmlObj.Projeto.Pecas.Peca];
    } else if (xmlObj?.projeto?.pecas?.peca) {
      pieces = Array.isArray(xmlObj.projeto.pecas.peca)
        ? xmlObj.projeto.pecas.peca
        : [xmlObj.projeto.pecas.peca];
    }

    // Agrupar materiais
    const materialsMap: { [key: string]: any } = {};

    // 1. Chapas agrupadas por material/espessura/cor
    pieces.forEach((piece: any) => {
      const material = piece["@_material"] || piece.material || "MDF";
      const thickness = piece["@_espessura"] || piece["@_thickness"] || piece.espessura || "18";
      const color = piece["@_cor"] || piece["@_color"] || piece.cor || "Branco";
      const qty = parseInt(piece["@_quantidade"] || piece["@_qty"] || piece.quantidade || 1);
      
      const width = parseFloat(piece["@_largura"] || piece["@_width"] || piece.largura || 0) / 1000; // em metros
      const height = parseFloat(piece["@_altura"] || piece["@_height"] || piece.altura || 0) / 1000;
      
      const area = width * height * qty;
      
      const key = `CHAPA_${material}_${thickness}_${color}`;
      
      if (!materialsMap[key]) {
        materialsMap[key] = {
          name: `${material} ${color} ${thickness}mm`,
          quantity: 0,
          unit: 'm²',
          category: 'Chapa',
          area: 0,
        };
      }
      
      materialsMap[key].area += area;
    });

    // Converter área em chapas (considerando chapa padrão 2.75 x 1.85m = 5.0875 m²)
    const SHEET_AREA = 2.75 * 1.85;
    Object.values(materialsMap).forEach((mat: any) => {
      if (mat.category === 'Chapa') {
        mat.quantity = Math.ceil(mat.area / SHEET_AREA);
        mat.unit = 'chapa';
      }
    });

    // 2. Fita de borda (estimativa: perímetro das peças com borda)
    let totalEdgeBanding = 0;
    
    pieces.forEach((piece: any) => {
      const width = parseFloat(piece["@_largura"] || piece["@_width"] || piece.largura || 0) / 1000;
      const height = parseFloat(piece["@_altura"] || piece["@_height"] || piece.altura || 0) / 1000;
      const qty = parseInt(piece["@_quantidade"] || piece["@_qty"] || piece.quantidade || 1);
      
      // Assumir que cada peça tem borda em pelo menos 2 lados (média)
      const edgeLength = (width + height) * 2 * qty * 0.7; // 70% das peças têm borda
      totalEdgeBanding += edgeLength;
    });

    if (totalEdgeBanding > 0) {
      materialsMap['FITA_BORDA'] = {
        name: 'Fita de Borda PVC',
        quantity: Math.ceil(totalEdgeBanding),
        unit: 'metros',
        category: 'Acabamento',
      };
    }

    // 3. Ferragens (estimativa básica)
    const totalPieces = pieces.reduce((sum, p) => {
      return sum + parseInt(p["@_quantidade"] || p["@_qty"] || p.quantidade || 1);
    }, 0);

    // Dobradiças (assumir 1 dobradiça a cada 3 peças de porta)
    const hinges = Math.ceil(totalPieces / 3);
    if (hinges > 0) {
      materialsMap['DOBRADICA'] = {
        name: 'Dobradiça 35mm',
        quantity: hinges,
        unit: 'unidade',
        category: 'Ferragem',
      };
    }

    // Parafusos (assumir 20 parafusos por projeto base + 5 por peça)
    const screws = 20 + (totalPieces * 5);
    materialsMap['PARAFUSO'] = {
      name: 'Parafusos Diversos',
      quantity: screws,
      unit: 'unidade',
      category: 'Ferragem',
    };

    // Puxadores (assumir 1 puxador a cada 4 peças)
    const handles = Math.ceil(totalPieces / 4);
    if (handles > 0) {
      materialsMap['PUXADOR'] = {
        name: 'Puxador',
        quantity: handles,
        unit: 'unidade',
        category: 'Ferragem',
      };
    }

    const materials = Object.values(materialsMap);

    // Salvar no histórico
    const { error: insertError } = await supabase
      .from('materials_bom_history')
      .insert({
        user_id: user.id,
        project_name: projectName,
        xml_data: xmlObj,
        materials_list: materials,
      });

    if (insertError) {
      console.error('Error saving to materials_bom_history:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        materials,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in generate-bom:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
