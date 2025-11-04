import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/contexts/auth/types";
import { UserMetricsCollection } from "@/hooks/useUserMetrics";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { Mail } from "lucide-react";

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: string | null;
  users: User[];
  userMetrics: UserMetricsCollection;
  formatDate: (date: string) => string;
}

export function UserDetailsDialog({ 
  open, 
  onOpenChange, 
  selectedUser, 
  users, 
  userMetrics, 
  formatDate 
}: UserDetailsDialogProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleResetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Erro ao solicitar redefinição de senha:", error);
        sonnerToast.error("Erro ao enviar link", {
          description: "Se o e-mail estiver cadastrado, você receberá um link de redefinição.",
        });
      } else {
        sonnerToast.success("Link enviado!", {
          description: "Verifique a caixa de entrada (e spam) do usuário para o link de redefinição.",
        });
      }
    } catch (err) {
      console.error("Erro inesperado na redefinição de senha:", err);
      sonnerToast.error("Erro inesperado", {
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "max-w-[90vw] max-h-[80vh] p-4" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
        </DialogHeader>
        {selectedUser && (
          <ScrollArea className={isMobile ? "h-[calc(60vh-120px)]" : "max-h-[500px]"}>
            <div className="space-y-4 p-1">
              {(() => {
                const user = users.find(u => u.id === selectedUser);
                if (!user) return null;
                
                const metrics = userMetrics[user.id] || {
                  totalConversions: 0,
                  successfulConversions: 0,
                  failedConversions: 0,
                  averageConversionTime: 0,
                  lastConversion: '-'
                };
                
                return (
                  <>
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                      <div className="space-y-1">
                        <Label>ID do Usuário</Label>
                        <div className="text-sm truncate">{user.id}</div>
                      </div>
                      <div className="space-y-1">
                        <Label>Nome</Label>
                        <div className="text-sm">{user.name}</div>
                      </div>
                      <div className="space-y-1">
                        <Label>Email</Label>
                        <div className="text-sm">{user.email}</div>
                      </div>
                      <div className="space-y-1">
                        <Label>Telefone</Label>
                        <div className="text-sm">{user.phone || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label>Função</Label>
                        <div className="text-sm">{user.role === 'admin' ? 'Administrador' : user.role === 'ceo' ? 'CEO' : 'Usuário'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label>Status</Label>
                        <div className="text-sm">{user.isBanned ? 'Banido' : 'Ativo'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label>Créditos</Label>
                        <div className="text-sm">{user.credits}</div>
                      </div>
                      <div className="space-y-1">
                        <Label>Criado em</Label>
                        <div className="text-sm">{formatDate(user.createdAt)}</div>
                      </div>
                      <div className="space-y-1">
                        <Label>Último login</Label>
                        <div className="text-sm">{user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}</div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Estatísticas de Conversão</h3>
                      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                        <div className="space-y-1">
                          <Label>Total de Conversões</Label>
                          <div className="text-sm">{metrics.totalConversions}</div>
                        </div>
                        <div className="space-y-1">
                          <Label>Conversões com Sucesso</Label>
                          <div className="text-sm">{metrics.successfulConversions}</div>
                        </div>
                        <div className="space-y-1">
                          <Label>Conversões Falhas</Label>
                          <div className="text-sm">{metrics.failedConversions}</div>
                        </div>
                        <div className="space-y-1">
                          <Label>Taxa de Sucesso</Label>
                          <div className="text-sm">
                            {metrics.totalConversions > 0
                              ? ((metrics.successfulConversions / metrics.totalConversions) * 100).toFixed(1)
                              : 0}%
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>Tempo Médio de Conversão</Label>
                          <div className="text-sm">
                            {(metrics.averageConversionTime / 1000).toFixed(2)}s
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>Última Conversão</Label>
                          <div className="text-sm">
                            {metrics.lastConversion !== '-'
                              ? formatDate(metrics.lastConversion)
                              : 'Nunca converteu'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </ScrollArea>
        )}
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
          {selectedUser && users.find(u => u.id === selectedUser)?.email && (
            <Button 
              variant="outline" 
              onClick={() => handleResetPassword(users.find(u => u.id === selectedUser)!.email!)}
              className="w-full sm:w-auto"
            >
              <Mail className="h-4 w-4 mr-2" />
              Resetar Senha
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}