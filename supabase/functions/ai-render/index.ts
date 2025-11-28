import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, prompt, style } = await req.json();

    if (!image || !prompt) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Imagem e prompt são obrigatórios",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Iniciando geração de render IA...");
    console.log("Estilo selecionado:", style);
    console.log("Prompt:", prompt);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY não configurada");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Chave de API não configurada",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Construir prompt final baseado no estilo
    let stylePrompt = "";
    switch (style) {
      case "fotorrealista":
        stylePrompt = "Photorealistic render, ultra-realistic details, professional photography lighting, 8K quality. ";
        break;
      case "render-arquitetonico":
        stylePrompt = "Professional architectural rendering, clean lines, perfect perspective, architectural visualization style. ";
        break;
      case "aquarela":
        stylePrompt = "Watercolor painting style, soft colors, artistic brush strokes, artistic interpretation. ";
        break;
      case "conceitual":
        stylePrompt = "Conceptual art style, creative interpretation, artistic vision, modern design aesthetic. ";
        break;
      default:
        stylePrompt = "High quality architectural render. ";
    }

    const finalPrompt = `${stylePrompt}${prompt}. Based on the provided reference image, create a detailed and professional render maintaining the original composition and structure.`;

    console.log("Prompt final:", finalPrompt);

    // Chamar Lovable AI Gateway para edição de imagem
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: finalPrompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: image,
                },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Erro na API de IA:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Limite de requisições excedido. Tente novamente em alguns minutos.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Créditos insuficientes. Por favor, adicione créditos ao seu workspace Lovable AI.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: "Erro ao gerar render com IA",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiData = await aiResponse.json();
    console.log("Resposta da IA recebida");

    const generatedImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("URL da imagem não encontrada na resposta");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Não foi possível extrair a imagem gerada",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Render gerado com sucesso");

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: generatedImageUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro no processamento:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
