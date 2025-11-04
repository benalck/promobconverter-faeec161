
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useMonthlyCredits() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const checkAndAddMonthlyCredits = useCallback(async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    
    setIsProcessing(true);
    
    try {
      // Check if user has received credits this month
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const firstDayOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      
      // Check if there's a monthly credit entry for this month
      const { data: existingCredits, error: checkError } = await supabase
        .from('credit_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('amount', 0) // Monthly free credits have amount = 0
        .eq('credits', 10) // And they add 10 credits
        .gte('purchase_date', firstDayOfMonth.toISOString())
        .lt('purchase_date', firstDayOfNextMonth.toISOString())
        .limit(1);
        
      if (checkError) {
        console.error('Error checking monthly credits:', checkError);
        return false;
      }
      
      // If user hasn't received credits this month, call the function to add them
      if (!existingCredits || existingCredits.length === 0) {
        // Call the RPC function that will add credits to just this user
        const { error: rpcError } = await supabase.rpc(
          'add_monthly_credits_for_user',
          { user_id: userId }
        );
        
        if (rpcError) {
          console.error('Error adding monthly credits:', rpcError);
          return false;
        }
        
        toast({
          title: "Créditos mensais adicionados",
          description: "Você recebeu 10 créditos gratuitos deste mês!",
          variant: "default",
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in checkAndAddMonthlyCredits:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);
  
  return {
    isProcessing,
    checkAndAddMonthlyCredits
  };
}
