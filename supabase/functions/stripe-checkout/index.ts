
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@12.18.0";

// Inicializa o cliente Stripe com a chave secreta
const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
if (!stripeKey) {
  console.error("STRIPE_SECRET_KEY não está configurada");
}

const stripe = new Stripe(stripeKey || "", {
  apiVersion: "2023-10-16",
});

// Inicializa o cliente Supabase com a URL e a chave de serviço
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl) {
  console.error("SUPABASE_URL não está configurada");
}

if (!supabaseKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY não está configurada");
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Stripe checkout function initialized with keys:", {
  stripeKeyExists: !!stripeKey,
  supabaseUrlExists: !!supabaseUrl,
  supabaseKeyExists: !!supabaseKey,
});

serve(async (req) => {
  // Trata requisições OPTIONS (preflight CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Verificar se as chaves de API estão definidas
    if (!stripeKey || !supabaseUrl || !supabaseKey) {
      console.error("API keys missing:", {
        stripeKeyExists: !!stripeKey,
        supabaseUrlExists: !!supabaseUrl,
        supabaseKeyExists: !!supabaseKey,
      });
      return new Response(
        JSON.stringify({ 
          error: "Configuração da API incompleta", 
          details: {
            stripeKeyExists: !!stripeKey,
            supabaseUrlExists: !!supabaseUrl,
            supabaseKeyExists: !!supabaseKey,
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Para webhooks do Stripe
    if (req.method === "POST" && req.url.includes("/webhook")) {
      const signature = req.headers.get("stripe-signature");
      
      if (!signature) {
        return new Response(
          JSON.stringify({ error: "No Stripe signature found" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      if (!webhookSecret) {
        console.error("Webhook secret is not set");
        return new Response(
          JSON.stringify({ error: "Webhook secret is not configured" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const body = await req.text();

      try {
        const event = stripe.webhooks.constructEvent(
          body,
          signature,
          webhookSecret
        );

        console.log(`Webhook received: ${event.type}`);

        if (event.type === "checkout.session.completed") {
          const session = event.data.object;
          console.log("Checkout session completed:", session);

          // Extrair os dados dos metadados da sessão
          const userId = session.metadata.userId;
          const planId = session.metadata.planId;
          const credits = parseInt(session.metadata.credits);
          const durationDays = parseInt(session.metadata.durationDays);
          const amount = session.amount_total / 100; // Converte de centavos para reais

          // Calcular a data de expiração
          const currentDate = new Date();
          const expiryDate = new Date(
            currentDate.setDate(currentDate.getDate() + durationDays)
          );

          console.log(`Crediting ${credits} credits to user ${userId} for plan ${planId}`);

          // Registrar a compra de créditos
          const { error: purchaseError } = await supabase
            .from("credit_purchases")
            .insert({
              user_id: userId,
              plan_id: planId,
              amount: amount,
              credits: credits,
              expiry_date: expiryDate.toISOString(),
            });

          if (purchaseError) {
            console.error("Error recording purchase:", purchaseError);
            return new Response(
              JSON.stringify({ error: "Error recording purchase" }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          // Atualizar os créditos do usuário
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("credits, active_plan, plan_expiry_date")
            .eq("id", userId)
            .single();

          if (profileError) {
            console.error("Error fetching user profile:", profileError);
            return new Response(
              JSON.stringify({ error: "Error fetching user profile" }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          const currentCredits = profileData?.credits || 0;
          const newCredits = currentCredits + credits;

          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              credits: newCredits,
              active_plan: planId,
              plan_expiry_date: expiryDate.toISOString(),
            })
            .eq("id", userId);

          if (updateError) {
            console.error("Error updating user credits:", updateError);
            return new Response(
              JSON.stringify({ error: "Error updating user credits" }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          console.log(`Updated user ${userId} with ${newCredits} credits`);
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Error verifying webhook signature:", err);
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Para criar uma sessão de checkout
    if (req.method === "POST" && req.url.includes("/create-checkout-session")) {
      const { planId, userId, successUrl, cancelUrl } = await req.json();

      // Verificar se o plano existe
      const { data: plan, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (planError || !plan) {
        console.error("Error fetching plan:", planError);
        return new Response(
          JSON.stringify({ error: "Plan not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log(`Creating checkout session for plan: ${plan.name}, user: ${userId}`);

      try {
        // Criar uma sessão de checkout do Stripe
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "brl",
                product_data: {
                  name: plan.name,
                  description: plan.description || `Plano ${plan.name} - ${plan.credits} créditos`,
                },
                unit_amount: Math.round(plan.price * 100), // Converte para centavos
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            userId: userId,
            planId: planId,
            credits: plan.credits.toString(),
            durationDays: plan.duration_days.toString(),
          },
        });

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
          JSON.stringify({ error: "Failed to create checkout session", details: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Se a rota não for reconhecida
    return new Response(
      JSON.stringify({ error: "Endpoint not found" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
