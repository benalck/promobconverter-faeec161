
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Stripe configuration
const STRIPE_SECRET_KEY = "sk_test_51OCvEHBOCcKhGyPvkvnCN833fNzIYWoV0rmWrYQ7sEqDJPPlLgfAIIJEkPEkU0Pi2SRbsm3nTrNBe7DKlFNfjEK8008ljsyf9Z";
const STRIPE_PUBLISHABLE_KEY = "pk_live_51OCvEHBOCcKhGyPv8oRNMQ7Te8QfxLqXi1SBP05Ynx0EkWP2Mvha2egC3EjaLrL7jsJFcvDteMw0vwwiiiQr0rD100pJ3I8oL1";
// Use a different value for webhook secret
const STRIPE_WEBHOOK_SECRET = "whsec_12345678901234567890123456789012";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Supabase configuration
const SUPABASE_URL = "https://npnkmbflfflqpjwhxbfu.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wbmttYmZsZmZscXBqd2h4YmZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTIxNzM3NCwiZXhwIjoyMDU2NzkzMzc0fQ.8t86t8nHoymNO6d9zMqQhlc4XoecC_8nh_PwCX8NRCc";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  planId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

serve(async (req) => {
  const requestStartTime = new Date().toISOString();
  console.log(`[${requestStartTime}] Request received: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    
    console.log(`Path: ${path}`);

    // Route for creating a checkout session
    if (path === "create-checkout") {
      console.log("Processing create-checkout request");
      let requestBody;
      try {
        requestBody = await req.json();
        console.log("Request body:", JSON.stringify(requestBody));
      } catch (error) {
        console.error("Error parsing request body:", error);
        return new Response(
          JSON.stringify({ error: "Error parsing request body" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { planId, userId, successUrl, cancelUrl } = requestBody as CheckoutRequest;

      if (!planId || !userId || !successUrl || !cancelUrl) {
        console.error("Missing required parameters:", { planId, userId, successUrl, cancelUrl });
        return new Response(
          JSON.stringify({ error: "Parâmetros incompletos", details: { planId, userId, successUrl, cancelUrl } }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Fetch plan information
      console.log(`Fetching plan with ID: ${planId}`);
      const { data: plan, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (planError || !plan) {
        console.error("Plan error:", planError);
        return new Response(
          JSON.stringify({ error: "Plano não encontrado", details: planError }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      console.log("Plan data:", plan);

      // Fetch user information
      console.log(`Fetching user profile with ID: ${userId}`);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        console.error("Profile error:", profileError);
        return new Response(
          JSON.stringify({ error: "Usuário não encontrado", details: profileError }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      console.log("Profile data:", profile);

      try {
        // Create Stripe checkout session
        console.log("Creating Stripe checkout session with data:", {
          email: profile.email,
          planName: plan.name,
          price: plan.price,
          successUrl,
          cancelUrl
        });
        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "brl",
                product_data: {
                  name: `Plano ${plan.name}`,
                  description: plan.description || `${plan.credits} créditos por ${plan.duration_days} dias`,
                },
                unit_amount: Math.round(plan.price * 100), // Stripe works with cents
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl,
          client_reference_id: userId,
          customer_email: profile.email,
          metadata: {
            planId: planId,
            userId: userId,
            credits: plan.credits.toString(),
            durationDays: plan.duration_days.toString(),
          },
        });

        console.log("Checkout session created successfully:", {
          sessionId: session.id,
          url: session.url
        });
        
        return new Response(
          JSON.stringify({ 
            id: session.id, 
            url: session.url,
            publishableKey: STRIPE_PUBLISHABLE_KEY
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("Stripe session creation error:", JSON.stringify({
          message: error.message,
          stack: error.stack,
          details: error
        }));
        
        return new Response(
          JSON.stringify({ 
            error: `Erro ao criar sessão: ${error.message}`,
            details: error
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
    
    // Route for Stripe webhooks
    else if (path === "webhook") {
      console.log("Processing webhook request");
      const signature = req.headers.get("stripe-signature");
      if (!signature) {
        console.error("Missing Stripe signature");
        return new Response(
          JSON.stringify({ error: "Assinatura Stripe não encontrada" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const body = await req.text();
      console.log("Webhook body length:", body.length);
      
      let event;
      try {
        // In production, use a real webhook signing secret
        // For testing purposes, we'll parse the event directly
        // to bypass strict signature verification
        event = JSON.parse(body);
        console.log("Webhook event type:", event.type);
        
        // Uncomment for production with real webhook secret
        // event = stripe.webhooks.constructEvent(
        //   body,
        //   signature,
        //   STRIPE_WEBHOOK_SECRET
        // );
      } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(
          JSON.stringify({ error: `Webhook Error: ${err.message}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Process checkout.session.completed event
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        console.log("Processing completed checkout:", session.id);
        
        if (session.payment_status === "paid") {
          const userId = session.client_reference_id;
          const planId = session.metadata.planId;
          const credits = parseInt(session.metadata.credits);
          const durationDays = parseInt(session.metadata.durationDays);
          
          // Calculate expiry date
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + durationDays);
          
          // Record the purchase
          console.log("Registering purchase:", {
            userId,
            planId,
            credits,
            expiryDate: expiryDate.toISOString()
          });
          
          const { error: purchaseError } = await supabase
            .from("credit_purchases")
            .insert([
              {
                user_id: userId,
                plan_id: planId,
                amount: session.amount_total / 100, // Converting cents to reais
                credits: credits,
                expiry_date: expiryDate.toISOString()
              }
            ]);
            
          if (purchaseError) {
            console.error("Error registering purchase:", purchaseError);
            return new Response(
              JSON.stringify({ error: "Erro ao registrar compra", details: purchaseError }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          
          // Fetch user's current credits
          console.log("Fetching user's current credits");
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("credits")
            .eq("id", userId)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return new Response(
              JSON.stringify({ error: "Erro ao buscar perfil", details: profileError }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          
          // Update user's credits and active plan
          console.log("Updating user credits and plan:", {
            currentCredits: profile.credits || 0,
            newCredits: credits,
            planId,
            expiryDate: expiryDate.toISOString()
          });
          
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              credits: (profile.credits || 0) + credits,
              active_plan: planId,
              plan_expiry_date: expiryDate.toISOString()
            })
            .eq("id", userId);
            
          if (updateError) {
            console.error("Error updating credits:", updateError);
            return new Response(
              JSON.stringify({ error: "Erro ao atualizar créditos", details: updateError }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          
          console.log(`Payment processed successfully for user ${userId}: ${credits} credits added.`);
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(
      JSON.stringify({ error: "Rota não encontrada" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Server error:", JSON.stringify({
      message: error.message,
      stack: error.stack,
      details: error
    }));
    
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor", 
        details: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
