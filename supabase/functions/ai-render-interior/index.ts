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
      throw new Error("REPLICATE_API_TOKEN is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const body = await req.json();
    const { image, prompt, style } = body;

    if (!image || !prompt || !style) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: image, prompt, and style are required",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Construir prompt final
    const finalPrompt = `${prompt}. Style: ${style}. High quality interior render, realistic lighting, correct proportions, detailed furniture, photorealistic materials.`;
    
    const negativePrompt = "lowres, watermark, banner, logo, contactinfo, text, deformed, blurry, blur, out of focus, surreal, extra limbs, extra furniture, ugly, overlapping objects, distorted furniture, impossible layout, broken geometry, floating furniture, furniture merging with walls or windows, warped walls, poor lighting, artifacts, cut-off furniture";

    console.log("Gerando render de interiores com Replicate, prompt:", finalPrompt);

    // Criar prediction no Replicate
    const predictionResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait",
      },
      body: JSON.stringify({
        version: "4836eb257a4fb8b87bac9eacbef9292ee8e1a497398ab96207067403a4be2daf",
        input: {
          image: image,
          prompt: finalPrompt,
          negative_prompt: negativePrompt,
          num_inference_steps: 50,
          guidance_scale: 7.5,
        },
      }),
    });

    if (!predictionResponse.ok) {
      const errorText = await predictionResponse.text();
      console.error("Erro do Replicate:", predictionResponse.status, errorText);
      throw new Error(`Replicate API error: ${predictionResponse.status}`);
    }

    const prediction = await predictionResponse.json();
    console.log("Prediction inicial:", prediction.id, prediction.status);

    // Aguardar resultado (polling)
    let finalPrediction = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 60 tentativas, ~60 segundos

    while (
      finalPrediction.status !== "succeeded" &&
      finalPrediction.status !== "failed" &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            "Authorization": `Token ${REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error("Failed to check prediction status");
      }

      finalPrediction = await statusResponse.json();
      console.log("Status da prediction:", finalPrediction.status);
      attempts++;
    }

    if (finalPrediction.status === "failed") {
      throw new Error("Render generation failed");
    }

    if (finalPrediction.status !== "succeeded") {
      throw new Error("Render generation timed out");
    }

    const outputImageUrl = finalPrediction.output?.[0];
    if (!outputImageUrl) {
      throw new Error("No output image in prediction result");
    }

    console.log("Render gerado com sucesso:", outputImageUrl);

    // Salvar no histórico
    const { error: dbError } = await supabase
      .from("interior_render_history")
      .insert({
        user_id: user.id,
        prompt: prompt,
        style: style,
        input_image_url: image,
        output_image_url: outputImageUrl,
      });

    if (dbError) {
      console.error("Erro ao salvar no histórico:", dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: outputImageUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});