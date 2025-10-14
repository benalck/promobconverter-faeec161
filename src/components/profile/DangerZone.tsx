
import { useState } from "react";
import { User } from "@/contexts/auth/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DangerZoneProps {
  user: User;
}

export default function DangerZone({ user }: DangerZoneProps) {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteAccount = async () => {
    if (!password) {
      setError("Por favor, digite sua senha para confirmar.");
      return;
    }
    
    setError("");
    setIsDeleting(true);
    
    try {
      // First, verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password
      });
      
      if (signInError) {
        setError("Senha incorreta. Por favor, tente novamente.");
        setIsDeleting(false);
        return;
      }
      
      // Delete user data from profiles table
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
        
      if (deleteError) throw deleteError;
      
      // Delete user authentication account
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authDeleteError) throw authDeleteError;
      
      // Show success toast
      toast({
        title: "Conta excluída com sucesso",
        description: "Sua conta e todos os dados associados foram removidos.",
      });
      
      // Close dialog and sign out
      setIsOpen(false);
      await logout();
      
      // Redirect to home
      window.location.href = "/";
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erro ao excluir conta",
        description: "Não foi possível excluir sua conta. Por favor, entre em contato com o suporte.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/30">
      <CardHeader className="border-b border-destructive/30 bg-destructive/5 rounded-t-lg pb-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <CardTitle>Zona de Perigo</CardTitle>
        </div>
        <CardDescription className="text-destructive/80">
          Ações irreversíveis que afetam permanentemente sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="rounded-md border border-destructive/50 p-4 bg-destructive/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-sm font-semibold text-destructive">Excluir minha conta permanentemente</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                </p>
              </div>
              
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Conta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" /> 
                      Excluir Conta Permanentemente
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                      Você está prestes a excluir sua conta e todos os dados associados a ela. 
                      Esta ação não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-3">
                    <p className="text-sm font-medium">
                      Digite sua senha para confirmar a exclusão:
                    </p>
                    <Input
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      disabled={isDeleting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || !password}
                    >
                      {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
