import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { image, prompt, style, strength } = await req.json();

    if (!image || !prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: image and prompt" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Construct final prompt
    const styleDescriptions: Record<string, string> = {
      moderno: "modern, contemporary, clean lines, minimalist furniture",
      minimalista: "minimalist, simple, clean, neutral colors, essential furniture only",
      industrial: "industrial, exposed brick, metal elements, concrete, raw materials",
      rustico: "rustic, wooden elements, warm tones, natural materials, cozy",
      classico: "classic, elegant, traditional furniture, refined details",
    };

    const styleDesc = styleDescriptions[style] || "modern";
    const finalPrompt = `${prompt}. Interior design, high quality render, stylish furniture, realistic materials, cohesive lighting, ${styleDesc} style, professional architectural visualization, photorealistic`;

    console.log("Generating interior render with RoomDreamer v2");
    console.log("Prompt:", finalPrompt);
    console.log("Strength:", strength || 0.5);

    // Call Replicate API
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({
        version: "roomdreamer/roomdreamer-v2:0f61bf9c95ac9071ec29862d68e8c3afdbb91d67be2e5a8a5c3e9eb6dfcb61f4",
        input: {
          image: image,
          prompt: finalPrompt,
          strength: Number(strength) || 0.5,
          negative_prompt: "lowres, blurry, distorted, floating furniture, deformed geometry, wrong proportions, ugly, watermark, bad quality, deformed",
          num_inference_steps: 20,
          guidance_scale: 7.5,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Replicate API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to generate render with AI" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prediction = await response.json();
    console.log("Prediction response:", prediction);

    // Wait for completion if not already completed
    let finalPrediction = prediction;
    if (prediction.status !== "succeeded" && prediction.status !== "failed") {
      // Poll for completion
      const maxAttempts = 60; // 60 seconds max
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusResponse = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {
            headers: {
              Authorization: `Token ${REPLICATE_API_TOKEN}`,
            },
          }
        );

        finalPrediction = await statusResponse.json();
        console.log(`Polling attempt ${i + 1}: status = ${finalPrediction.status}`);

        if (finalPrediction.status === "succeeded" || finalPrediction.status === "failed") {
          break;
        }
      }
    }

    if (finalPrediction.status !== "succeeded") {
      console.error("Prediction failed:", finalPrediction);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: finalPrediction.error || "Render generation failed" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const outputUrl = Array.isArray(finalPrediction.output) 
      ? finalPrediction.output[0] 
      : finalPrediction.output;

    if (!outputUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No output image URL received" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Save to history
    const { error: insertError } = await supabase
      .from("interior_render_history")
      .insert({
        user_id: user.id,
        input_image_url: null, // We're using base64, not storing input
        output_image_url: outputUrl,
        prompt: prompt,
        style: style,
        strength: Number(strength) || 0.5,
      });

    if (insertError) {
      console.error("Error saving to history:", insertError);
      // Don't fail the request, just log the error
    }

    console.log("Render generated successfully:", outputUrl);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: outputUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-render-interior function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});