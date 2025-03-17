import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { CreditCard, Coins, Wallet, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";

const CREDITS_PACKAGES = [
  { id: 1, amount: 10, price: 19.9, label: "Pacote Básico" },
  { id: 2, amount: 50, price: 79.9, label: "Pacote Intermediário", popular: true },
  { id: 3, amount: 100, price: 129.9, label: "Pacote Premium" },
];

const SUBSCRIPTION_PLANS = [
  {
    id: 1,
    title: "Plano Basic",
    monthlyPrice: 49.9,
    yearlyPrice: 499.9,
    yearDiscount: "17%",
    credits: 200,
    features: [
      "200 créditos por mês",
      "Suporte por email",
      "Acesso a todas as ferramentas",
    ],
  },
  {
    id: 2,
    title: "Plano Pro",
    monthlyPrice: 79.9,
    yearlyPrice: 799.9,
    yearDiscount: "17%",
    credits: 500,
    popular: true,
    features: [
      "500 créditos por mês",
      "Suporte prioritário",
      "Acesso a ferramentas avançadas",
      "Relatórios de uso",
    ],
  },
  {
    id: 3,
    title: "Plano Enterprise",
    monthlyPrice: 129.9,
    yearlyPrice: 1299.9,
    yearDiscount: "17%",
    credits: 1000,
    features: [
      "1000 créditos por mês",
      "Suporte 24/7",
      "Ferramentas exclusivas",
      "API de integração",
      "Gerenciamento de múltiplos usuários",
    ],
  },
];

// Alterando de "yearly" para "annual" para compatibilidade com a integração do Stripe
type BillingInterval = "monthly" | "annual";

const Plans: React.FC = () => {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const { user, refreshUserCredits } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  // Verificar se há um parâmetro de sessão do Stripe na URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const sessionId = queryParams.get('session_id');
    
    if (sessionId) {
      // Limpar a URL para evitar reprocessamento
      window.history.replaceState({}, document.title, window.location.pathname);
      
      toast({
        title: "Pagamento processado",
        description: "Estamos verificando seu pagamento...",
        variant: "default",
      });
      
      // Em uma implementação real, você deve verificar o status da sessão no backend
      // Por enquanto, apenas atualize os créditos do usuário
      refreshUserCredits();
    }
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Escolha seu plano</h1>
      
      {/* Payment info section */}
      <div className="mx-auto max-w-3xl text-center mb-8 p-4 rounded-xl bg-blue-50 border border-blue-100">
        <div className="flex justify-center items-center gap-2 mb-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-primary">Pagamento seguro com Stripe</h3>
        </div>
        <p className="text-gray-700">
          Aceitamos pagamentos via <span className="font-medium">PIX</span>, 
          <span className="font-medium"> Cartão de Crédito</span> e
          <span className="font-medium"> Boleto Bancário</span>.
        </p>
      </div>

      {/* Credits packages */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-10">Créditos sob demanda</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto max-w-5xl">
          {CREDITS_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`flex flex-col h-full rounded-lg shadow-sm overflow-hidden transition duration-300 hover:shadow-md border ${
                pkg.popular
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-gray-200"
              }`}
            >
              {pkg.popular && (
                <div className="bg-primary text-white text-center text-sm font-medium py-1">
                  Mais Popular
                </div>
              )}
              <div className="flex flex-col flex-1 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {pkg.label}
                </h3>
                <div className="flex items-end mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    R$ {pkg.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-lg text-gray-700 mb-6">
                  <Coins className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {pkg.amount} créditos
                  </span>
                </div>
                <div className="mt-auto">
                  {user ? (
                    <StripeCheckoutButton
                      mode="credits"
                      amount={pkg.amount as 10 | 50 | 100}
                      className="w-full py-6 flex items-center justify-center gap-2 group"
                    >
                      <span>Comprar</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </StripeCheckoutButton>
                  ) : (
                    <Button
                      className="w-full py-6 flex items-center justify-center gap-2 group"
                      onClick={handleLoginRedirect}
                    >
                      <span>Entrar para comprar</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-6">Planos de assinatura</h2>
        <div className="flex justify-center items-center space-x-4 mb-10">
          <span
            className={`text-base font-medium ${
              billingInterval === "monthly" ? "text-gray-900" : "text-gray-500"
            }`}
          >
            Mensal
          </span>
          <button
            type="button"
            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none"
            role="switch"
            aria-checked={billingInterval === "annual"}
            onClick={() =>
              setBillingInterval(
                billingInterval === "monthly" ? "annual" : "monthly"
              )
            }
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                billingInterval === "annual"
                  ? "translate-x-5"
                  : "translate-x-0"
              }`}
            ></span>
          </button>
          <span
            className={`text-base font-medium ${
              billingInterval === "annual" ? "text-gray-900" : "text-gray-500"
            }`}
          >
            Anual <span className="text-green-600 text-sm">Economize 17%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto max-w-6xl">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col h-full rounded-lg shadow-sm overflow-hidden transition duration-300 hover:shadow-md border ${
                plan.popular
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="bg-primary text-white text-center text-sm font-medium py-1">
                  Mais Popular
                </div>
              )}
              <div className="flex flex-col flex-1 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {plan.title}
                </h3>
                <div className="flex items-end mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    R${" "}
                    {billingInterval === "monthly"
                      ? plan.monthlyPrice.toFixed(2)
                      : plan.yearlyPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1 pb-1">
                    /{billingInterval === "monthly" ? "mês" : "ano"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-lg text-gray-700 mb-6">
                  <Coins className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {plan.credits} créditos/mês
                  </span>
                </div>
                <Separator className="mb-6" />
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  {user ? (
                    <StripeCheckoutButton
                      mode="subscription"
                      planType={billingInterval}
                      className="w-full py-6 flex items-center justify-center gap-2 group"
                    >
                      <span>Assinar {billingInterval === "annual" ? "Anual" : "Mensal"}</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </StripeCheckoutButton>
                  ) : (
                    <Button
                      className="w-full py-6 flex items-center justify-center gap-2 group"
                      onClick={handleLoginRedirect}
                    >
                      <span>Entrar para assinar</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Plans;
