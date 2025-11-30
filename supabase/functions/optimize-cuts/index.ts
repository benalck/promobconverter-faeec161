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

    // Dimensões padrão da chapa
    const SHEET_WIDTH = 2750; // mm
    const SHEET_HEIGHT = 1850; // mm
    const SHEET_AREA = SHEET_WIDTH * SHEET_HEIGHT;

    // Agrupar peças por espessura
    const piecesByThickness: { [key: string]: any[] } = {};
    
    pieces.forEach((piece: any) => {
      const width = parseFloat(piece["@_largura"] || piece["@_width"] || piece.largura || 0);
      const height = parseFloat(piece["@_altura"] || piece["@_height"] || piece.altura || 0);
      const thickness = piece["@_espessura"] || piece["@_thickness"] || piece.espessura || "18";
      const qty = parseInt(piece["@_quantidade"] || piece["@_qty"] || piece.quantidade || 1);
      
      if (width > 0 && height > 0) {
        if (!piecesByThickness[thickness]) {
          piecesByThickness[thickness] = [];
        }
        
        for (let i = 0; i < qty; i++) {
          piecesByThickness[thickness].push({
            id: `${piece["@_id"] || piece.id || 'P'}_${i}`,
            width,
            height,
            area: width * height,
          });
        }
      }
    });

    // Otimização simples: First Fit Decreasing Height (FFDH)
    const layouts: any[] = [];
    let totalSheets = 0;
    let totalUsedArea = 0;
    let totalWasteArea = 0;

    Object.entries(piecesByThickness).forEach(([thickness, piecesArray]) => {
      // Ordenar peças por altura decrescente
      piecesArray.sort((a, b) => b.height - a.height);

      let currentSheet: any = null;
      let currentY = 0;
      let currentRowHeight = 0;
      let currentX = 0;

      piecesArray.forEach((piece) => {
        // Se não há chapa atual ou a peça não cabe, criar nova chapa
        if (!currentSheet || currentX + piece.width > SHEET_WIDTH) {
          // Tentar próxima linha
          if (currentSheet && currentY + currentRowHeight + piece.height <= SHEET_HEIGHT) {
            currentY += currentRowHeight;
            currentX = 0;
            currentRowHeight = piece.height;
          } else {
            // Finalizar chapa atual e criar nova
            if (currentSheet) {
              const usedArea = currentSheet.pieces.reduce((sum: number, p: any) => sum + p.area, 0);
              totalUsedArea += usedArea;
              totalWasteArea += (SHEET_AREA - usedArea);
              layouts.push(currentSheet);
            }
            
            totalSheets++;
            currentSheet = {
              sheetIndex: totalSheets,
              thickness,
              pieces: [],
            };
            currentX = 0;
            currentY = 0;
            currentRowHeight = piece.height;
          }
        }

        // Adicionar peça à chapa atual
        currentSheet.pieces.push({
          id: piece.id,
          width: piece.width,
          height: piece.height,
          area: piece.area,
          x: currentX,
          y: currentY,
        });

        currentX += piece.width;
        currentRowHeight = Math.max(currentRowHeight, piece.height);
      });

      // Finalizar última chapa
      if (currentSheet && currentSheet.pieces.length > 0) {
        const usedArea = currentSheet.pieces.reduce((sum: number, p: any) => sum + p.area, 0);
        totalUsedArea += usedArea;
        totalWasteArea += (SHEET_AREA - usedArea);
        layouts.push(currentSheet);
      }
    });

    const wastePercentage = totalSheets > 0 
      ? ((totalWasteArea / (totalSheets * SHEET_AREA)) * 100).toFixed(2)
      : 0;

    // Salvar no histórico
    const { error: insertError } = await supabase
      .from('cut_optimizer_history')
      .insert({
        user_id: user.id,
        project_name: projectName,
        xml_data: xmlObj,
        total_sheets: totalSheets,
        waste_percentage: parseFloat(wastePercentage as string),
        layout_data: layouts,
      });

    if (insertError) {
      console.error('Error saving to cut_optimizer_history:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalSheets,
        wastePercentage: parseFloat(wastePercentage as string),
        layouts,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in optimize-cuts:', error);
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
