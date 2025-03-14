
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/contexts/auth/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function Admin() {
  const { users, updateUser, syncUsers } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Starting to load users...");
        await syncUsers();
        console.log("Users loaded successfully:", users);
      } catch (err) {
        console.error("Error loading users:", err);
        setError("Não foi possível carregar os usuários. Tente novamente.");
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [syncUsers, toast]);

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

  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    try {
      await syncUsers();
    } catch (err) {
      setError("Não foi possível carregar os usuários. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    user.id !== "00000000-0000-0000-0000-000000000000" // Filter out system users if any
  );

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Users Table Card */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>
              Visualize e gerencie os usuários da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Buscar usuários por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
            </div>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Créditos</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-destructive">{error}</p>
                          <Button onClick={handleRetry} variant="outline" size="sm">
                            Tentar novamente
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow 
                        key={user.id}
                        className={selectedUser?.id === user.id ? "bg-muted" : ""}
                      >
                        <TableCell>{user.name || "Sem nome"}</TableCell>
                        <TableCell>{user.email || "Sem email"}</TableCell>
                        <TableCell>{user.role === "admin" ? "Administrador" : "Usuário"}</TableCell>
                        <TableCell>{user.credits || 0}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            Selecionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {searchTerm ? "Nenhum usuário encontrado com este termo de busca." : "Nenhum usuário disponível."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
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
              {selectedUser ? (
                <div className="bg-muted p-3 rounded mt-2 text-sm">
                  <p><strong>Usuário selecionado:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Créditos atuais:</strong> {selectedUser.credits || 0}</p>
                  <p><strong>Após adição:</strong> {(selectedUser.credits || 0) + creditAmount} créditos</p>
                </div>
              ) : (
                <div className="p-3 border rounded border-dashed text-center text-sm text-muted-foreground">
                  Selecione um usuário da tabela acima para adicionar créditos
                </div>
              )}
              
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
