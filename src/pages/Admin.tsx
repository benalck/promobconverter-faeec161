import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  PlusCircle, 
  Trash, 
  UserCog, 
  Shield, 
  ShieldOff, 
  Ban, 
  Check,
  Search,
  Coins
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/contexts/auth/types";

export default function Admin() {
  const { users, deleteUser, isAdmin: isCurrentUserAdmin, user: currentUser, updateUser, register } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Estados para cadastro de novo usuário
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserCredits, setNewUserCredits] = useState("5");
  const [isNewUserAdmin, setIsNewUserAdmin] = useState(false);
  
  // Estados para alterar créditos
  const [creditsToAdd, setCreditsToAdd] = useState("0");

  if (!isCurrentUserAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Acesso Restrito
            </h1>
            <p className="text-gray-600">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleDeleteUser = async (id: string) => {
    try {
      deleteUser(id);
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async (id: string, isBanned: boolean) => {
    try {
      updateUser(id, { isBanned });
      toast({
        title: isBanned ? "Usuário banido" : "Usuário desbanido",
        description: isBanned 
          ? "O usuário foi banido com sucesso." 
          : "O usuário foi desbanido com sucesso.",
      });
      setShowBanDialog(false);
    } catch (error) {
      toast({
        title: "Erro ao processar",
        description: "Não foi possível processar a operação.",
        variant: "destructive",
      });
    }
  };

  const handleChangeRole = async (id: string, role: 'admin' | 'user') => {
    try {
      updateUser(id, { role });
      toast({
        title: "Função atualizada",
        description: `O usuário agora é um ${role === 'admin' ? 'Administrador' : 'Usuário comum'}.`,
      });
      setShowRoleDialog(false);
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a função do usuário.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCredits = async (id: string) => {
    try {
      const user = users.find(u => u.id === id);
      if (!user) return;
      
      const currentCredits = user.credits || 0;
      const addedCredits = parseInt(creditsToAdd);
      const newCredits = currentCredits + addedCredits;
      
      updateUser(id, { credits: newCredits });
      toast({
        title: "Créditos atualizados",
        description: `Foram adicionados ${addedCredits} créditos para o usuário.`,
      });
      setShowCreditsDialog(false);
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os créditos.",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPassword) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await register(newUserName, newUserEmail, newUserPassword);
      
      // Aguardar um momento para o usuário ser registrado
      setTimeout(() => {
        const newUser = users.find(u => u.email === newUserEmail);
        if (newUser) {
          // Atualizar créditos e função se necessário
          const updates: Partial<User> = {};
          
          if (newUserCredits) {
            updates.credits = parseInt(newUserCredits);
          }
          
          if (isNewUserAdmin) {
            updates.role = 'admin';
          }
          
          if (Object.keys(updates).length > 0) {
            updateUser(newUser.id, updates);
          }
        }
      }, 1000);
      
      toast({
        title: "Usuário criado",
        description: "O novo usuário foi criado com sucesso.",
      });
      
      // Limpar formulário
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserCredits("5");
      setIsNewUserAdmin(false);
      
      setShowAddUserDialog(false);
    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Não foi possível criar o usuário.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
      locale: ptBR,
    });
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Cabeçalho e estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Painel do Administrador</CardTitle>
              <CardDescription>
                Gerencie os usuários e recursos do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border shadow-sm">
                  <h3 className="text-lg font-medium">Total de Usuários</h3>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border shadow-sm">
                  <h3 className="text-lg font-medium">Usuários Ativos</h3>
                  <p className="text-3xl font-bold">{users.filter(u => !u.isBanned).length}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border shadow-sm">
                  <h3 className="text-lg font-medium">Administradores</h3>
                  <p className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gerenciamento de usuários */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Adicione, edite ou remova usuários do sistema
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowAddUserDialog(true)}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Novo Usuário
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar por nome ou email..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Créditos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role === "admin" ? "Administrador" : "Usuário"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1">
                            <Coins className="h-3 w-3" />
                            {user.credits || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isBanned
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.isBanned ? "Banido" : "Ativo"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Botão de Banir/Desbanir */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user.id);
                                setShowBanDialog(true);
                              }}
                              title={user.isBanned ? "Desbanir usuário" : "Banir usuário"}
                              className={user.isBanned ? "text-green-600" : "text-red-600"}
                            >
                              {user.isBanned ? <Check className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </Button>
                            
                            {/* Botão de Alterar Função */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user.id);
                                setShowRoleDialog(true);
                              }}
                              title={user.role === 'admin' ? "Remover privilégios admin" : "Tornar administrador"}
                            >
                              {user.role === 'admin' ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                            </Button>
                            
                            {/* Botão de Adicionar Créditos */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user.id);
                                setCreditsToAdd("0");
                                setShowCreditsDialog(true);
                              }}
                              title="Gerenciar créditos"
                            >
                              <Coins className="h-4 w-4" />
                            </Button>

                            {/* Botão de Excluir */}
                            {user.id !== currentUser?.id && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user.id);
                                  setShowDeleteDialog(true);
                                }}
                                title="Excluir usuário"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog de Exclusão */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este usuário? Esta ação não pode ser
                desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedUser && handleDeleteUser(selectedUser)}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Banir/Desbanir */}
        <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser && users.find(u => u.id === selectedUser)?.isBanned
                  ? "Desbanir usuário"
                  : "Banir usuário"}
              </DialogTitle>
              <DialogDescription>
                {selectedUser && users.find(u => u.id === selectedUser)?.isBanned
                  ? "Tem certeza que deseja desbanir este usuário? Ele poderá acessar o sistema normalmente."
                  : "Tem certeza que deseja banir este usuário? Ele não poderá acessar o sistema até ser desbanido."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBanDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant={selectedUser && users.find(u => u.id === selectedUser)?.isBanned ? "default" : "destructive"}
                onClick={() => selectedUser && handleBanUser(
                  selectedUser, 
                  !(users.find(u => u.id === selectedUser)?.isBanned)
                )}
              >
                {selectedUser && users.find(u => u.id === selectedUser)?.isBanned
                  ? "Desbanir"
                  : "Banir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Alterar Função */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar função do usuário</DialogTitle>
              <DialogDescription>
                {selectedUser && users.find(u => u.id === selectedUser)?.role === 'admin'
                  ? "Remover privilégios de administrador deste usuário?"
                  : "Conceder privilégios de administrador para este usuário?"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRoleDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={() => selectedUser && handleChangeRole(
                  selectedUser, 
                  users.find(u => u.id === selectedUser)?.role === 'admin' ? 'user' : 'admin'
                )}
              >
                {selectedUser && users.find(u => u.id === selectedUser)?.role === 'admin'
                  ? "Remover privilégios"
                  : "Conceder privilégios"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Gerenciar Créditos */}
        <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar créditos</DialogTitle>
              <DialogDescription>
                Adicione créditos para o usuário selecionado.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="currentCredits">Créditos atuais</Label>
                <Input
                  id="currentCredits"
                  value={selectedUser ? users.find(u => u.id === selectedUser)?.credits || 0 : 0}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="creditsToAdd">Créditos a adicionar</Label>
                <Input
                  id="creditsToAdd"
                  type="number"
                  value={creditsToAdd}
                  onChange={(e) => setCreditsToAdd(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newTotalCredits">Novo total de créditos</Label>
                <Input
                  id="newTotalCredits"
                  value={selectedUser 
                    ? (users.find(u => u.id === selectedUser)?.credits || 0) + parseInt(creditsToAdd || "0")
                    : 0
                  }
                  disabled
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreditsDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={() => selectedUser && handleUpdateCredits(selectedUser)}
              >
                Atualizar créditos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Adicionar Usuário */}
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar novo usuário</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para criar um novo usuário.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Senha segura"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="credits">Créditos iniciais</Label>
                <Input
                  id="credits"
                  type="number"
                  value={newUserCredits}
                  onChange={(e) => setNewUserCredits(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="admin"
                  checked={isNewUserAdmin}
                  onCheckedChange={setIsNewUserAdmin}
                />
                <Label htmlFor="admin">Usuário administrador</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddUserDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={handleAddUser}
              >
                Criar usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
