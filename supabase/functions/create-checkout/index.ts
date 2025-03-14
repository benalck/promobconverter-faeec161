
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.4.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, userId, successUrl, cancelUrl } = await req.json();
    
    console.log("Received request to create checkout session:", { planId, userId, successUrl, cancelUrl });
    
    if (!planId || !userId || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch plan details from Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const planResponse = await fetch(
      `${supabaseUrl}/rest/v1/plans?id=eq.${planId}&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!planResponse.ok) {
      throw new Error("Failed to fetch plan details");
    }
    
    const plans = await planResponse.json();
    
    if (!plans || plans.length === 0) {
      return new Response(
        JSON.stringify({ error: "Plan not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const plan = plans[0];
    console.log("Found plan:", plan);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `${plan.name} - ${plan.credits} créditos`,
              description: plan.description || `Pacote de ${plan.credits} créditos para uso na plataforma`,
            },
            unit_amount: Math.round(plan.price * 100), // Stripe requires amounts in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&plan_id=${planId}`,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
        credits: plan.credits.toString(),
      },
    });

    console.log("Created checkout session:", session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
