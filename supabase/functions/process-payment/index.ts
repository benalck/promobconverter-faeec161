
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
    const { sessionId } = await req.json();
    
    console.log("Processing payment for session:", sessionId);
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing session ID" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session || session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { userId, planId, credits } = session.metadata || {};
    
    if (!userId || !planId || !credits) {
      return new Response(
        JSON.stringify({ error: "Missing metadata in session" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Add credits to user profile
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    // Get current user credits
    const userResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=credits`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    );
    
    if (!userResponse.ok) {
      throw new Error("Failed to fetch user profile");
    }
    
    const users = await userResponse.json();
    
    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const currentCredits = users[0].credits || 0;
    const newCredits = currentCredits + parseInt(credits, 10);
    
    // Update user credits
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
      {
        method: "PATCH",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          credits: newCredits,
        }),
      }
    );
    
    if (!updateResponse.ok) {
      throw new Error("Failed to update user credits");
    }
    
    // Record the purchase
    const purchaseResponse = await fetch(
      `${supabaseUrl}/rest/v1/credit_purchases`,
      {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          user_id: userId,
          plan_id: planId,
          amount: session.amount_total ? session.amount_total / 100 : null,
          credits: parseInt(credits, 10),
          expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      }
    );
    
    if (!purchaseResponse.ok) {
      throw new Error("Failed to record purchase");
    }

    console.log("Payment processed successfully, credits added:", {
      userId,
      planId,
      credits,
      newTotalCredits: newCredits,
    });

    return new Response(
      JSON.stringify({
        success: true,
        credits: newCredits,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
