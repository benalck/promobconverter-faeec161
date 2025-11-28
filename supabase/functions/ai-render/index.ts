import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
    if (!REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN não está configurado");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { image, prompt, style } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Prompt é obrigatório" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Construir prompt final com base no estilo
    let finalPrompt = prompt;
    
    switch (style) {
      case "fotorrealista":
        finalPrompt = `${prompt}, fotorrealista, alta qualidade, iluminação profissional, detalhes realistas, 8k`;
        break;
      case "render-arquitetonico":
        finalPrompt = `${prompt}, render arquitetônico profissional, vista detalhada, iluminação natural, materiais realistas`;
        break;
      case "aquarela":
        finalPrompt = `${prompt}, estilo aquarela artística, pinceladas suaves, cores vibrantes`;
        break;
      case "conceitual":
        finalPrompt = `${prompt}, arte conceitual, estilo artístico, criativo`;
        break;
      default:
        finalPrompt = `${prompt}, alta qualidade`;
    }

    console.log("Gerando render com Replicate, prompt:", finalPrompt);

    // Preparar input para o Replicate
    const replicateInput: any = {
      prompt: finalPrompt,
      go_fast: true,
      num_outputs: 1,
      aspect_ratio: "1:1",
      output_format: "webp",
      output_quality: 80,
      num_inference_steps: 4,
    };

    // Se houver imagem base, adicionar ao input
    if (image) {
      replicateInput.image = image;
      replicateInput.prompt_strength = 0.8; // Força do prompt quando há imagem base
    }

    // Chamar API do Replicate
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637", // black-forest-labs/flux-schnell
        input: replicateInput,
      }),
    });

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error("Erro na API do Replicate:", replicateResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro ao gerar render: ${replicateResponse.status}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const prediction = await replicateResponse.json();
    console.log("Prediction inicial:", prediction.id, prediction.status);

    // Fazer polling até a predição estar completa
    let finalPrediction = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 60 tentativas = ~2 minutos

    while (
      finalPrediction.status !== "succeeded" && 
      finalPrediction.status !== "failed" &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Aguardar 2 segundos
      
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            "Authorization": `Token ${REPLICATE_API_TOKEN}`,
          },
        }
      );

      finalPrediction = await statusResponse.json();
      console.log("Status da prediction:", finalPrediction.status);
      attempts++;
    }

    if (finalPrediction.status === "failed") {
      console.error("Render falhou:", finalPrediction.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Falha ao gerar render com IA" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (finalPrediction.status !== "succeeded") {
      console.error("Timeout ao gerar render");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Timeout ao gerar render. Tente novamente." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Extrair URL da imagem gerada
    const imageUrl = finalPrediction.output?.[0];
    
    if (!imageUrl) {
      console.error("URL da imagem não encontrada na resposta");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Imagem não gerada corretamente" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Obter user_id do token de autenticação
    const authHeader = req.headers.get("authorization");
    let userId = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Salvar no histórico se houver usuário autenticado
    let renderId = null;
    if (userId) {
      const { data: renderData, error: renderError } = await supabase
        .from("render_history")
        .insert({
          user_id: userId,
          prompt: prompt,
          style: style,
          output_image_url: imageUrl,
        })
        .select()
        .single();

      if (renderError) {
        console.error("Erro ao salvar no histórico:", renderError);
      } else {
        renderId = renderData?.id;
      }
    }

    console.log("Render gerado com sucesso:", imageUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: imageUrl,
        renderId: renderId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Erro na função ai-render:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});