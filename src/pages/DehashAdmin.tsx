
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
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Users, Activity, Settings, LogOut, User, Shield, Ban, 
  Trash, Check, X, UserCheck, FileSpreadsheet, RefreshCcw
} from "lucide-react";

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
  const { theme, toggleTheme } = useTheme();

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
      {
        userId: "2",
        action: "Login",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        details: "Login realizado com sucesso",
      },
      {
        userId: "3",
        action: "Registro",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        details: "Novo usuário registrado",
      },
    ];
    setActivities(mockActivities);
  }, [navigate]);

  const handleDeleteUser = (id: string) => {
    try {
      const newUsers = users.filter(u => u.id !== id);
      setUsers(newUsers);
      localStorage.setItem("users", JSON.stringify(newUsers));
      
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
      );
      
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
        user.id === id ? { ...user, role: 'admin' as const } : user
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="flex h-screen bg-white dark:bg-gray-900">
        <div className="hidden md:flex flex-col w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">Admin</span>
          </div>

          <div className="flex flex-col flex-1 overflow-y-auto">
            <nav className="flex-1 p-4">
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Geral
                </div>
                <a href="#users" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  <Users className="mr-3 h-5 w-5" />
                  Usuários
                </a>
                <a href="#activities" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Activity className="mr-3 h-5 w-5" />
                  Atividades
                </a>
                <a href="#settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setShowSettingsDialog(true)}>
                  <Settings className="mr-3 h-5 w-5" />
                  Configurações
                </a>
              </div>
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center md:hidden">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="font-bold text-gray-900 dark:text-white">Admin</span>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </Button>
              
              <div className="flex items-center gap-2 md:hidden">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSettingsDialog(true)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Painel Administrativo
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Gerencie usuários, visualize atividades e configure o sistema
              </p>
            </div>

            <Tabs defaultValue="users" className="space-y-6">
              <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
                <TabsTrigger value="users" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300">
                  <Users className="h-4 w-4 mr-2" />
                  Usuários
                </TabsTrigger>
                <TabsTrigger value="activities" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300">
                  <Activity className="h-4 w-4 mr-2" />
                  Atividades
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Gerenciamento de Usuários
                  </h2>
                  <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
                
                <Card className="border border-gray-200 dark:border-gray-800">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Criado em</TableHead>
                          <TableHead>Último acesso</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <User className="h-4 w-4" />
                                  </div>
                                  {user.name}
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user.role === "admin"
                                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  }`}
                                >
                                  {user.role === "admin" ? (
                                    <>
                                      <Shield className="h-3 w-3 mr-1" />
                                      Admin
                                    </>
                                  ) : (
                                    <>
                                      <User className="h-3 w-3 mr-1" />
                                      Usuário
                                    </>
                                  )}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user.isBanned
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  }`}
                                >
                                  {user.isBanned ? (
                                    <>
                                      <Ban className="h-3 w-3 mr-1" />
                                      Banido
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-3 w-3 mr-1" />
                                      Ativo
                                    </>
                                  )}
                                </span>
                              </TableCell>
                              <TableCell>
                                {user.createdAt ? formatDate(user.createdAt) : "Desconhecido"}
                              </TableCell>
                              <TableCell>
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
                                      className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    >
                                      <UserCheck className="h-4 w-4" />
                                      <span className="sr-only md:not-sr-only md:ml-2">Promover</span>
                                    </Button>
                                  )}
                                  <Button
                                    variant={user.isBanned ? "outline" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(user.id);
                                      setShowBanDialog(true);
                                    }}
                                    className={user.isBanned ? 
                                      "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20" : 
                                      "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                    }
                                  >
                                    {user.isBanned ? <Check className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                    <span className="sr-only md:not-sr-only md:ml-2">{user.isBanned ? "Desbanir" : "Banir"}</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(user.id);
                                      setShowDeleteDialog(true);
                                    }}
                                    className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only md:not-sr-only md:ml-2">Excluir</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              Nenhum usuário encontrado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="activities" className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Registro de Atividades
                  </h2>
                  <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
                
                <Card className="border border-gray-200 dark:border-gray-800">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Ação</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Detalhes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activities.length > 0 ? (
                          activities.map((activity, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <User className="h-4 w-4" />
                                  </div>
                                  {users.find(u => u.id === activity.userId)?.name || "Usuário Removido"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center gap-1.5">
                                  {activity.action === 'Conversão XML' && <FileSpreadsheet className="h-4 w-4 text-green-600 dark:text-green-400" />}
                                  {activity.action === 'Login' && <LogOut className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                                  {activity.action === 'Registro' && <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                                  {activity.action}
                                </span>
                              </TableCell>
                              <TableCell>
                                {formatDate(activity.timestamp)}
                              </TableCell>
                              <TableCell>
                                {activity.details}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              Nenhuma atividade registrada
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Dialog modals */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser
              desfeita e removerá todos os dados associados.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
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
              <Trash className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              {users.find(u => u.id === selectedUser)?.isBanned
                ? "Deseja desbanir este usuário?"
                : "Deseja banir este usuário? Ele não poderá acessar o sistema."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowBanDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant={users.find(u => u.id === selectedUser)?.isBanned ? "default" : "destructive"}
              onClick={() => selectedUser && handleBanUser(selectedUser)}
            >
              {users.find(u => u.id === selectedUser)?.isBanned ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Desbanir
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Banir
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Promover usuário</DialogTitle>
            <DialogDescription>
              Deseja promover este usuário a administrador? Ele terá acesso a todas as
              funcionalidades administrativas.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowPromoteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              className="gradient-cta"
              onClick={() => selectedUser && handlePromoteUser(selectedUser)}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Promover
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações do Admin</DialogTitle>
            <DialogDescription>
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
                className="bg-white dark:bg-gray-900"
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
                className="bg-white dark:bg-gray-900"
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
                className="bg-white dark:bg-gray-900"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              className="gradient-cta"
              onClick={handleUpdateAdminCredentials}
            >
              <Settings className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
