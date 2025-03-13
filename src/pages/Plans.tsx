
import React from "react";
import { AlertCircle } from "lucide-react";
import { usePlans } from "@/hooks/usePlans";
import PlanCard from "@/components/plans/PlanCard";
import CustomCreditsCard from "@/components/plans/CustomCreditsCard";
import UserCreditsInfo from "@/components/plans/UserCreditsInfo";

export default function Plans() {
  const {
    plans,
    loading,
    customCredits,
    setCustomCredits,
    isUpdatingCredits,
    formatCurrency,
    handleBuyCredits,
    user
  } = usePlans();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Comprar Créditos</h1>
        <p className="text-lg text-gray-600">
          Adicione mais créditos à sua conta
        </p>
      </div>
      
      {user && <UserCreditsInfo user={user} />}
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="mb-12">
            <CustomCreditsCard
              customCredits={customCredits}
              setCustomCredits={setCustomCredits}
              formatCurrency={formatCurrency}
              isUpdatingCredits={isUpdatingCredits}
              onBuyCredits={handleBuyCredits}
              disabled={!user}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <PlanCard 
                key={plan.id} 
                {...plan} 
                formatCurrency={formatCurrency}
                isPremium={plan.name === 'Profissional'}
              />
            ))}
          </div>
        </>
      )}
      
      <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex gap-4">
          <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Informação sobre pagamentos</h3>
            <p className="text-sm text-gray-600">
              Esse é um sistema de demonstração. Em um ambiente de produção, aqui seria integrado um sistema de pagamento real como Stripe, PayPal ou mercado pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
