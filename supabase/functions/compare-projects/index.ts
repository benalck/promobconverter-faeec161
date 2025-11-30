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

    const { xmlA, xmlB, projectName } = await req.json();

    if (!xmlA || !xmlB) {
      throw new Error('Missing required fields: xmlA and xmlB');
    }

    // Parse XMLs
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    
    const xmlObjA = parser.parse(xmlA);
    const xmlObjB = parser.parse(xmlB);

    // Extrair peças de ambos XMLs
    const extractPieces = (xmlObj: any): any[] => {
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

      return pieces.map((p: any) => ({
        id: p["@_id"] || p.id,
        name: p["@_nome"] || p["@_name"] || p.nome || p.name || 'Peça',
        width: parseFloat(p["@_largura"] || p["@_width"] || p.largura || 0),
        height: parseFloat(p["@_altura"] || p["@_height"] || p.altura || 0),
        thickness: p["@_espessura"] || p["@_thickness"] || p.espessura || "18",
        material: p["@_material"] || p.material || "MDF",
        quantity: parseInt(p["@_quantidade"] || p["@_qty"] || p.quantidade || 1),
      }));
    };

    const piecesA = extractPieces(xmlObjA);
    const piecesB = extractPieces(xmlObjB);

    // Comparar peças
    const differences: any[] = [];

    // Criar mapa de peças A por ID
    const mapA = new Map(piecesA.map(p => [p.id || `${p.name}_${p.width}_${p.height}`, p]));
    const mapB = new Map(piecesB.map(p => [p.id || `${p.name}_${p.width}_${p.height}`, p]));

    // Verificar peças removidas
    mapA.forEach((pieceA, key) => {
      if (!mapB.has(key)) {
        differences.push({
          type: 'removed',
          item: pieceA.name,
          before: `${pieceA.width}x${pieceA.height}mm (${pieceA.thickness}mm)`,
          after: 'Removida',
          impact: `Peça removida do projeto`,
        });
      }
    });

    // Verificar peças adicionadas
    mapB.forEach((pieceB, key) => {
      if (!mapA.has(key)) {
        differences.push({
          type: 'added',
          item: pieceB.name,
          before: 'Não existia',
          after: `${pieceB.width}x${pieceB.height}mm (${pieceB.thickness}mm)`,
          impact: `Nova peça adicionada`,
        });
      }
    });

    // Verificar peças modificadas
    mapA.forEach((pieceA, key) => {
      const pieceB = mapB.get(key);
      if (pieceB) {
        // Comparar dimensões
        if (pieceA.width !== pieceB.width || pieceA.height !== pieceB.height) {
          const widthDiff = pieceB.width - pieceA.width;
          const heightDiff = pieceB.height - pieceA.height;
          
          let impact = '';
          if (widthDiff !== 0) impact += `${widthDiff > 0 ? '+' : ''}${widthDiff}mm largura`;
          if (heightDiff !== 0) {
            if (impact) impact += ', ';
            impact += `${heightDiff > 0 ? '+' : ''}${heightDiff}mm altura`;
          }

          differences.push({
            type: 'modified',
            item: pieceA.name,
            before: `${pieceA.width}x${pieceA.height}mm`,
            after: `${pieceB.width}x${pieceB.height}mm`,
            impact: impact,
          });
        }

        // Comparar espessura
        if (pieceA.thickness !== pieceB.thickness) {
          differences.push({
            type: 'modified',
            item: pieceA.name,
            before: `Espessura ${pieceA.thickness}mm`,
            after: `Espessura ${pieceB.thickness}mm`,
            impact: `Mudança de espessura`,
          });
        }

        // Comparar quantidade
        if (pieceA.quantity !== pieceB.quantity) {
          const qtyDiff = pieceB.quantity - pieceA.quantity;
          differences.push({
            type: 'modified',
            item: pieceA.name,
            before: `${pieceA.quantity} unidade(s)`,
            after: `${pieceB.quantity} unidade(s)`,
            impact: `${qtyDiff > 0 ? '+' : ''}${qtyDiff} unidade(s)`,
          });
        }
      }
    });

    // Calcular estatísticas
    const stats = {
      totalPiecesA: piecesA.length,
      totalPiecesB: piecesB.length,
      pieceDifference: piecesB.length - piecesA.length,
      modificationsCount: differences.length,
      addedCount: differences.filter(d => d.type === 'added').length,
      removedCount: differences.filter(d => d.type === 'removed').length,
      modifiedCount: differences.filter(d => d.type === 'modified').length,
    };

    // Salvar no histórico
    const { error: insertError } = await supabase
      .from('project_comparison_history')
      .insert({
        user_id: user.id,
        project_name_v1: projectName || 'Versão A',
        project_name_v2: projectName ? `${projectName} - Versão B` : 'Versão B',
        xml_data_v1: xmlObjA,
        xml_data_v2: xmlObjB,
        differences: differences,
      });

    if (insertError) {
      console.error('Error saving to project_comparison_history:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        differences,
        stats,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in compare-projects:', error);
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
