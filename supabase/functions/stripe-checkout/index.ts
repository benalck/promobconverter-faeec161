
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Inicializar Stripe com a chave privada
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
  // Lidar com requisições CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Rota para criar uma sessão de checkout
    if (path === "create-checkout") {
      const { planId, userId, successUrl, cancelUrl }: CheckoutRequest = await req.json();

      if (!planId || !userId || !successUrl || !cancelUrl) {
        return new Response(
          JSON.stringify({ error: "Parâmetros incompletos" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Buscar informações do plano
      const { data: plan, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (planError || !plan) {
        return new Response(
          JSON.stringify({ error: "Plano não encontrado" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Buscar informações do usuário
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", userId)
        .single();

      if (profileError) {
        return new Response(
          JSON.stringify({ error: "Usuário não encontrado" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Criar sessão de checkout do Stripe
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
              unit_amount: Math.round(plan.price * 100), // Stripe trabalha com centavos
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

      return new Response(
        JSON.stringify({ id: session.id, url: session.url }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Rota para webhooks do Stripe
    else if (path === "webhook") {
      const signature = req.headers.get("stripe-signature");
      if (!signature) {
        return new Response(
          JSON.stringify({ error: "Assinatura Stripe não encontrada" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Usar a chave de webhook fornecida
      const webhookSecret = "whsec_WWKyjHEh36klduEPE3IwxRA1khPne1jE";
      const body = await req.text();
      
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          webhookSecret
        );
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

      console.log(`Evento webhook recebido: ${event.type}`);

      // Processar evento checkout.session.completed
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        
        console.log(`Processando sessão de checkout completa: ${session.id}`);
        console.log(`Status do pagamento: ${session.payment_status}`);
        
        if (session.payment_status === "paid") {
          const userId = session.client_reference_id;
          const planId = session.metadata.planId;
          const credits = parseInt(session.metadata.credits);
          const durationDays = parseInt(session.metadata.durationDays);
          
          console.log(`Créditos a adicionar: ${credits} para o usuário: ${userId}`);
          
          // Calcular data de expiração
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + durationDays);
          
          // Registrar a compra
          const { error: purchaseError } = await supabase
            .from("credit_purchases")
            .insert([
              {
                user_id: userId,
                plan_id: planId,
                amount: session.amount_total / 100, // Convertendo centavos para reais
                credits: credits,
                expiry_date: expiryDate.toISOString()
              }
            ]);
            
          if (purchaseError) {
            console.error("Erro ao registrar compra:", purchaseError);
            return new Response(
              JSON.stringify({ error: "Erro ao registrar compra" }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          
          // Buscar créditos atuais do usuário
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("credits")
            .eq("id", userId)
            .single();
            
          if (profileError) {
            console.error("Erro ao buscar perfil:", profileError);
            return new Response(
              JSON.stringify({ error: "Erro ao buscar perfil" }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          
          // Atualizar os créditos e o plano ativo do usuário
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              credits: (profile.credits || 0) + credits,
              active_plan: planId,
              plan_expiry_date: expiryDate.toISOString()
            })
            .eq("id", userId);
            
          if (updateError) {
            console.error("Erro ao atualizar créditos:", updateError);
            return new Response(
              JSON.stringify({ error: "Erro ao atualizar créditos" }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          
          console.log(`Pagamento processado com sucesso para o usuário ${userId}: ${credits} créditos adicionados.`);
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
    console.error("Erro no servidor:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
