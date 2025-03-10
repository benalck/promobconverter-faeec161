import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminConfig, updateAdminConfig } from "@/utils/adminConfig";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
  isBanned?: boolean;
}

interface UserActivity {
  userId: string;
  action: string;
  timestamp: string;
  details: string;
}

export default function DehashAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/dehash-login");
      return;
    }

    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    const mockActivities: UserActivity[] = [
      {
        userId: "1",
        action: "Conversão XML",
        timestamp: new Date().toISOString(),
        details: "Converteu arquivo: projeto.xml",
      },
    ];
    setActivities(mockActivities);
  }, [navigate]);

  const handleDeleteUser = (id: string) => {
    try {
      const newUsers = users.filter(u => u.id !== id);
      setUsers(newUsers);
      localStorage.setItem("users", JSON.stringify(newUsers));
      localStorage.removeItem("user");
      
      toast({
        title: "Usuário excluído",
        description: "O usuário e todos seus dados foram removidos.",
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

  const handleBanUser = (id: string) => {
    try {
      const targetUser = users.find(u => u.id === id);
      if (!targetUser) return;

      const newUsers = users.map(user => 
        user.id === id ? { ...user, isBanned: !user.isBanned } : user
      ) as User[];
      
      setUsers(newUsers);
      localStorage.setItem("users", JSON.stringify(newUsers));
      
      const action = newUsers.find(u => u.id === id)?.isBanned ? "banido" : "desbanido";
      toast({
        title: `Usuário ${action}`,
        description: action === "banido" ? 
          "O usuário foi banido e será desconectado imediatamente." : 
          "O usuário foi desbanido e poderá acessar o sistema novamente.",
      });
      setShowBanDialog(false);
    } catch (error) {
      toast({
        title: "Erro ao atualizar usuário",
        description: "Não foi possível atualizar o status do usuário.",
        variant: "destructive",
      });
    }
  };

  const handlePromoteUser = (id: string) => {
    try {
      const newUsers = users.map(user => 
        user.id === id ? { ...user, role: 'admin' } : user
      );
      setUsers(newUsers);
      localStorage.setItem("users", JSON.stringify(newUsers));
      
      toast({
        title: "Usuário promovido",
        description: "O usuário foi promovido a administrador.",
      });
      setShowPromoteDialog(false);
    } catch (error) {
      toast({
        title: "Erro ao promover",
        description: "Não foi possível promover o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAdminCredentials = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas diferentes",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    try {
      updateAdminConfig({
        username: newUsername || getAdminConfig().username,
        password: newPassword || getAdminConfig().password,
      });

      toast({
        title: "Credenciais atualizadas",
        description: "As credenciais de administrador foram atualizadas com sucesso.",
      });
      setShowSettingsDialog(false);
      setNewUsername("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as credenciais.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/dehash-login");
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
      locale: ptBR,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Painel Administrativo Principal</h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettingsDialog(true)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Configurações
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="activities">Atividades</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Nome</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Tipo</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Criado em</TableHead>
                      <TableHead className="text-gray-400">Último acesso</TableHead>
                      <TableHead className="text-right text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-gray-700">
                        <TableCell className="font-medium text-gray-300">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-gray-300">{user.email}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-red-900 text-red-200"
                                : "bg-blue-900 text-blue-200"
                            }`}
                          >
                            {user.role === "admin" ? "Administrador" : "Usuário"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isBanned
                                ? "bg-red-900 text-red-200"
                                : "bg-green-900 text-green-200"
                            }`}
                          >
                            {user.isBanned ? "Banido" : "Ativo"}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {user.lastLogin ? formatDate(user.lastLogin) : "Nunca"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {user.role !== "admin" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user.id);
                                  setShowPromoteDialog(true);
                                }}
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                Promover
                              </Button>
                            )}
                            <Button
                              variant={user.isBanned ? "default" : "secondary"}
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user.id);
                                setShowBanDialog(true);
                              }}
                            >
                              {user.isBanned ? "Desbanir" : "Banir"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user.id);
                                setShowDeleteDialog(true);
                              }}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Usuário</TableHead>
                      <TableHead className="text-gray-400">Ação</TableHead>
                      <TableHead className="text-gray-400">Data/Hora</TableHead>
                      <TableHead className="text-gray-400">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((activity, index) => (
                      <TableRow key={index} className="border-gray-700">
                        <TableCell className="text-gray-300">
                          {users.find(u => u.id === activity.userId)?.name || "Usuário Removido"}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {activity.action}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatDate(activity.timestamp)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {activity.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser
              desfeita e removerá todos os dados associados.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleDeleteUser(selectedUser)}
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription className="text-gray-400">
              {users.find(u => u.id === selectedUser)?.isBanned
                ? "Deseja desbanir este usuário?"
                : "Deseja banir este usuário? Ele não poderá acessar o sistema."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowBanDialog(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleBanUser(selectedUser)}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Promover usuário</DialogTitle>
            <DialogDescription className="text-gray-400">
              Deseja promover este usuário a administrador? Ele terá acesso a todas as
              funcionalidades administrativas.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowPromoteDialog(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={() => selectedUser && handlePromoteUser(selectedUser)}
            >
              Promover
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Configurações do Admin</DialogTitle>
            <DialogDescription className="text-gray-400">
              Atualize suas credenciais de acesso ao painel administrativo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newUsername">Novo usuário</Label>
              <Input
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Deixe em branco para manter o atual"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Deixe em branco para manter a atual"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleUpdateAdminCredentials}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 