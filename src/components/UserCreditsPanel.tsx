import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface UserCreditsPanelProps {
  className?: string;
}

const UserCreditsPanel: React.FC<UserCreditsPanelProps> = ({ className }) => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshCredits = async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      // Buscar os créditos diretamente do banco de dados
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (!data) {
        throw new Error('Perfil não encontrado');
      }
      
      // Atualizar localmente
      setUser({
        ...user,
        credits: data.credits || 0
      });
      
      toast({
        title: "Créditos atualizados",
        description: `Seus créditos foram sincronizados com sucesso: ${data.credits} créditos disponíveis.`,
      });
    } catch (error) {
      console.error("Erro ao atualizar créditos:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar seus créditos. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Seus Créditos</CardTitle>
          <CardDescription>Créditos disponíveis para conversão</CardDescription>
        </div>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">{user?.credits || 0}</div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefreshCredits}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCreditsPanel; 