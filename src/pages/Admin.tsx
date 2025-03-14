import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/contexts/auth/types";

export default function Admin() {
  const { users, updateUser } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(5);

  const handleAddCredits = () => {
    if (!selectedUser) {
      toast({
        title: "Erro",
        description: "Selecione um usuário para adicionar créditos",
        variant: "destructive",
      });
      return;
    }

    try {
      const newCredits = (selectedUser.credits || 0) + creditAmount;
      updateUser(selectedUser.id, { credits: newCredits });

      toast({
        title: "Créditos adicionados",
        description: `${creditAmount} créditos foram adicionados para ${selectedUser.name}`,
        variant: "default",
      });
      setSelectedUser(null);
      setCreditAmount(5);
    } catch (error) {
      toast({
        title: "Erro ao adicionar créditos",
        description: "Ocorreu um erro ao adicionar créditos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Existing admin content would be here */}
        
        {/* Credit Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Créditos</CardTitle>
            <CardDescription>
              Adicione créditos para usuários testarem a aplicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-select">Selecione um usuário</Label>
                <select 
                  id="user-select"
                  className="w-full p-2 border rounded mt-1"
                  value={selectedUser?.id || ""}
                  onChange={(e) => {
                    const userId = e.target.value;
                    const user = users.find(u => u.id === userId) || null;
                    setSelectedUser(user);
                  }}
                >
                  <option value="">Selecione um usuário</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.credits || 0} créditos
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="credit-amount">Quantidade de créditos</Label>
                <Input 
                  id="credit-amount"
                  type="number" 
                  min={1}
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              
              <Button 
                onClick={handleAddCredits}
                disabled={!selectedUser}
                className="w-full"
              >
                Adicionar Créditos
              </Button>
              
              {selectedUser && (
                <div className="bg-muted p-3 rounded mt-2 text-sm">
                  <p><strong>Usuário selecionado:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Créditos atuais:</strong> {selectedUser.credits || 0}</p>
                  <p><strong>Após adição:</strong> {(selectedUser.credits || 0) + creditAmount} créditos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
