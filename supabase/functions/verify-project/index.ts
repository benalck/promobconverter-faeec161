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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
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

    // Preparar resumo do projeto para análise
    const projectSummary = {
      totalPieces: pieces.length,
      pieces: pieces.slice(0, 20).map((p: any) => ({
        width: parseFloat(p["@_largura"] || p["@_width"] || p.largura || 0),
        height: parseFloat(p["@_altura"] || p["@_height"] || p.altura || 0),
        thickness: p["@_espessura"] || p["@_thickness"] || p.espessura || "18",
        material: p["@_material"] || p.material || "MDF",
        quantity: parseInt(p["@_quantidade"] || p["@_qty"] || p.quantidade || 1),
      })),
    };

    let issues: any[] = [];
    let suggestions: any[] = [];
    let summary = '';

    // Se tiver API key do Lovable AI, usar IA para análise
    if (lovableApiKey) {
      try {
        const prompt = `Você é um especialista em marcenaria e projetos de móveis planejados.

Analise este resumo de projeto:
- Total de peças: ${projectSummary.totalPieces}
- Amostra de peças (primeiras 20):
${JSON.stringify(projectSummary.pieces, null, 2)}

Identifique:
1. Problemas críticos (medidas incoerentes, peças muito grandes/pequenas)
2. Avisos (espessuras inconsistentes, proporções estranhas)
3. Sugestões de melhoria

Responda em formato JSON:
{
  "issues": [
    {"type": "error|warning", "message": "descrição do problema"}
  ],
  "suggestions": ["sugestão 1", "sugestão 2"],
  "summary": "resumo geral da análise"
}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Você é um especialista em marcenaria. Sempre responda em JSON válido.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || '{}';
          
          // Tentar extrair JSON da resposta
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            issues = analysis.issues || [];
            suggestions = analysis.suggestions || [];
            summary = analysis.summary || 'Análise concluída';
          }
        }
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
        // Continuar com análise manual se IA falhar
      }
    }

    // Análise manual de fallback (sempre executar para complementar IA)
    const manualIssues: any[] = [];

    pieces.forEach((piece: any, index: number) => {
      const width = parseFloat(piece["@_largura"] || piece["@_width"] || piece.largura || 0);
      const height = parseFloat(piece["@_altura"] || piece["@_height"] || piece.altura || 0);
      const thickness = parseFloat(piece["@_espessura"] || piece["@_thickness"] || piece.espessura || 18);

      // Verificar medidas muito grandes
      if (height > 2200) {
        manualIssues.push({
          type: 'warning',
          message: `Peça ${index + 1}: Altura ${height}mm pode ser excessiva. Considere reduzir para 2100mm ou menos.`
        });
      }

      if (width > 900) {
        manualIssues.push({
          type: 'warning',
          message: `Peça ${index + 1}: Largura ${width}mm pode ser muito grande. Verifique se está correto.`
        });
      }

      // Verificar medidas muito pequenas
      if (width < 100 || height < 100) {
        manualIssues.push({
          type: 'warning',
          message: `Peça ${index + 1}: Dimensões muito pequenas (${width}x${height}mm). Verifique se está correto.`
        });
      }

      // Verificar espessuras incomuns
      if (![6, 9, 12, 15, 18, 25].includes(thickness)) {
        manualIssues.push({
          type: 'info',
          message: `Peça ${index + 1}: Espessura ${thickness}mm não é padrão. Confirme disponibilidade.`
        });
      }
    });

    // Combinar análises (IA + manual)
    const allIssues = [...issues, ...manualIssues];

    if (!summary && manualIssues.length === 0) {
      summary = 'Projeto bem estruturado, sem problemas críticos detectados.';
    } else if (!summary) {
      summary = `Projeto analisado. Encontrados ${allIssues.length} pontos de atenção.`;
    }

    // Salvar no histórico
    const { error: insertError } = await supabase
      .from('project_verification_history')
      .insert({
        user_id: user.id,
        project_name: projectName,
        xml_data: xmlObj,
        issues_found: allIssues,
        suggestions: suggestions,
      });

    if (insertError) {
      console.error('Error saving to project_verification_history:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        issues: allIssues,
        suggestions,
        summary,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in verify-project:', error);
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
