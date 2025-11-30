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

    // Verificar usuário
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { xmlData, projectName, config } = await req.json();

    if (!xmlData || !projectName) {
      throw new Error('Missing required fields: xmlData and projectName');
    }

    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    
    const xmlObj = parser.parse(xmlData);

    // Extrair peças do XML (ajustar conforme estrutura real do Promob)
    let pieces: any[] = [];
    
    // Tentar diferentes estruturas possíveis do XML
    if (xmlObj?.Projeto?.Pecas?.Peca) {
      pieces = Array.isArray(xmlObj.Projeto.Pecas.Peca) 
        ? xmlObj.Projeto.Pecas.Peca 
        : [xmlObj.Projeto.Pecas.Peca];
    } else if (xmlObj?.projeto?.pecas?.peca) {
      pieces = Array.isArray(xmlObj.projeto.pecas.peca)
        ? xmlObj.projeto.pecas.peca
        : [xmlObj.projeto.pecas.peca];
    }

    // Calcular estimativas
    const sheetCost = config?.sheetCost || 120;
    const laborCostPerHour = config?.laborCostPerHour || 35;
    const markup = config?.markup || 1.7;

    // Estimar quantidade de chapas (baseado em área total)
    let totalArea = 0;
    const sheetArea = 2.75 * 1.85; // chapa padrão em m²
    
    pieces.forEach((piece: any) => {
      const width = parseFloat(piece["@_largura"] || piece["@_width"] || piece.largura || 0) / 1000;
      const height = parseFloat(piece["@_altura"] || piece["@_height"] || piece.altura || 0) / 1000;
      const qty = parseInt(piece["@_quantidade"] || piece["@_qty"] || piece.quantidade || 1);
      
      if (width > 0 && height > 0) {
        totalArea += (width * height * qty);
      }
    });

    const estimatedSheets = Math.ceil(totalArea / sheetArea);
    
    // Calcular custos
    const materialCost = estimatedSheets * sheetCost;
    const hardwareCost = materialCost * 0.15; // 15% para ferragens
    const edgeBandingCost = pieces.length * 5; // R$ 5 por peça (média)
    
    const totalMateriais = materialCost + hardwareCost + edgeBandingCost;
    
    // Estimar horas de mão de obra (1.5h por chapa + 0.5h por peça)
    const laborHours = (estimatedSheets * 1.5) + (pieces.length * 0.5);
    const totalMaoObra = laborHours * laborCostPerHour;
    
    // Calcular preço final
    const subtotal = totalMateriais + totalMaoObra;
    const precoFinal = subtotal * markup;
    const lucro = precoFinal - subtotal;

    // Montar itens detalhados
    const itens = [
      { name: `Chapas MDF (${estimatedSheets} un)`, price: materialCost },
      { name: 'Ferragens', price: hardwareCost },
      { name: 'Fita de Borda', price: edgeBandingCost },
      { name: `Mão de Obra (${laborHours.toFixed(1)}h)`, price: totalMaoObra },
    ];

    // Salvar no histórico
    const { error: insertError } = await supabase
      .from('budget_history')
      .insert({
        user_id: user.id,
        project_name: projectName,
        xml_data: xmlObj,
        total_materials: totalMateriais,
        total_labor: totalMaoObra,
        profit: lucro,
        final_price: precoFinal,
        items: itens,
        config: config,
      });

    if (insertError) {
      console.error('Error saving to budget_history:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        budget: {
          totalMateriais,
          totalMaoObra,
          lucro,
          precoFinal,
          itens,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in calculate-budget:', error);
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
