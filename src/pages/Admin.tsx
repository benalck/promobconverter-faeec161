import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { useUserMetrics } from "@/hooks/useUserMetrics";
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
  Coins,
  LineChart,
  Users,
  FileText,
  AlertCircle,
  Clock,
  Activity,
  RefreshCcw,
  Download,
  Eye,
  Loader2
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConversionMetricsChart from "@/components/admin/ConversionMetricsChart";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User } from "@/contexts/auth/types";

// Add a type for handling register user form
interface RegisterUserForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export default function Admin() {
  const { 
    users, 
    deleteUser, 
    isAdmin: isCurrentUserAdmin, 
    user: currentUser, 
    updateUser, 
    register, 
    refreshUserCredits
  } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("today");
  const [activeTab, setActiveTab] = useState("users");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Form states for the add user dialog
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserCredits, setNewUserCredits] = useState("5");
  const [newUserPhone, setNewUserPhone] = useState(""); // Add missing phone state
  const [isNewUserAdmin, setIsNewUserAdmin] = useState(false);
  
  // Credits dialog state
  const [creditsToAdd, setCreditsToAdd] = useState("0");

  // User export state
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  const [selectAllUsers, setSelectAllUsers] = useState(false);

  const {
    metrics: systemMetrics,
    dailyStats,
    isLoading: isLoadingSystem,
    error: systemError,
    fetchSystemMetrics,
    refetch: refetchSystemMetrics
  } = useSystemMetrics();

  const {
    metrics: userMetrics,
    isLoading: isLoadingUsers,
    error: userError,
    fetchUserMetrics
  } = useUserMetrics();

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchSystemMetrics(),
        fetchUserMetrics(),
        refreshUserCredits()
      ]);
      toast({
        title: "Dados atualizados",
        description: "Os dados da administração foram atualizados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar dados",
        description: "Ocorreu um erro ao atualizar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Reset selected users when filtered users change
    const newSelectedUsers: Record<string, boolean> = {};
    filteredUsers.forEach(user => {
      newSelectedUsers[user.id] = !!selectedUsers[user.id];
    });
    setSelectedUsers(newSelectedUsers);
    setSelectAllUsers(false);
  }, [filteredUsers]);

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser);
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erro ao excluir usuário",
        description: "Ocorreu um erro ao excluir o usuário.",
        variant: "destructive",
      });
    }

    setShowDeleteDialog(false);
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    const user = users.find((u) => u.id === selectedUser);
    if (!user) return;

    try {
      await updateUser(selectedUser, { isBanned: !user.isBanned });
      toast({
        title: user.isBanned ? "Usuário desbanido" : "Usuário banido",
        description: user.isBanned
          ? "O usuário foi desbanido com sucesso."
          : "O usuário foi banido com sucesso.",
      });
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        title: "Erro ao alterar status do usuário",
        description: "Ocorreu um erro ao alterar o status do usuário.",
        variant: "destructive",
      });
    }

    setShowBanDialog(false);
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;

    const user = users.find((u) => u.id === selectedUser);
    if (!user) return;

    try {
      await updateUser(selectedUser, {
        role: user.role === "admin" ? "user" : "admin",
      });
      toast({
        title: "Função alterada",
        description: `O usuário agora é ${
          user.role === "admin" ? "usuário comum" : "administrador"
        }.`,
      });
    } catch (error) {
      console.error("Error changing role:", error);
      toast({
        title: "Erro ao alterar função",
        description: "Ocorreu um erro ao alterar a função do usuário.",
        variant: "destructive",
      });
    }

    setShowRoleDialog(false);
  };

  const handleUpdateCredits = async () => {
    if (!selectedUser) return;

    const user = users.find((u) => u.id === selectedUser);
    if (!user) return;

    const credits = parseInt(creditsToAdd);
    if (isNaN(credits)) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um número válido de créditos.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUser(selectedUser, {
        credits: user.credits + credits,
      });
      toast({
        title: "Créditos atualizados",
        description: `Os créditos do usuário foram atualizados com sucesso.`,
      });
    } catch (error) {
      console.error("Error updating credits:", error);
      toast({
        title: "Erro ao atualizar créditos",
        description: "Ocorreu um erro ao atualizar os créditos do usuário.",
        variant: "destructive",
      });
    }

    setShowCreditsDialog(false);
  };

  const handleAddUser = async () => {
    try {
      // Create user data object with proper type
      const userData: RegisterUserForm = {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        phone: newUserPhone || "(00) 00000-0000" // Add a default phone
      };
      
      const result = await register(userData);
      
      if (result.success) {
        // If registration successful, optionally update credits separately
        if (parseInt(newUserCredits) > 0) {
          const newUser = users.find(u => u.email === newUserEmail);
          if (newUser) {
            await updateUser(newUser.id, { 
              credits: parseInt(newUserCredits),
              role: isNewUserAdmin ? "admin" : "user"
            });
          }
        }

        toast({
          title: "Usuário adicionado",
          description: "O novo usuário foi adicionado com sucesso.",
        });

        setNewUserName("");
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserCredits("5");
        setIsNewUserAdmin(false);
      } else {
        toast({
          title: "Erro ao adicionar usuário",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Erro ao adicionar usuário",
        description: "Ocorreu um erro ao adicionar o novo usuário.",
        variant: "destructive",
      });
    }

    setShowAddUserDialog(false);
  };

  const handleToggleSelectAll = () => {
    const newValue = !selectAllUsers;
    setSelectAllUsers(newValue);
    
    const newSelectedUsers: Record<string, boolean> = {};
    filteredUsers.forEach(user => {
      newSelectedUsers[user.id] = newValue;
    });
    setSelectedUsers(newSelectedUsers);
  };

  const handleToggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const exportSelectedUsers = () => {
    const selectedUserIds = Object.entries(selectedUsers)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id);
    
    if (selectedUserIds.length === 0) {
      toast({
        title: "Nenhum usuário selecionado",
        description: "Por favor, selecione pelo menos um usuário para exportar.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedUserData = users
      .filter(user => selectedUserIds.includes(user.id))
      .map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isBanned: user.isBanned,
        credits: user.credits
      }));
    
    const dataStr = JSON.stringify(selectedUserData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `users-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Usuários exportados",
      description: `${selectedUserIds.length} usuários foram exportados com sucesso.`,
    });
  };

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

  if (isLoadingSystem || isLoadingUsers) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Carregando métricas...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (systemError || userError) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center text-red-500">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>Erro ao carregar métricas. Por favor, tente novamente.</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">Painel do Administrador</CardTitle>
                  <CardDescription>
                    Monitore e gerencie o sistema
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={refreshData} 
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4 mr-2" />
                  )}
                  Atualizar Dados
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="users">Usuários</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dashboard">
                  <div className="flex justify-between items-center mb-4">
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="week">Última Semana</SelectItem>
                        <SelectItem value="month">Último Mês</SelectItem>
                        <SelectItem value="all">Todo Período</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Usuários Ativos
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{systemMetrics?.activeUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          de {systemMetrics?.totalUsers || 0} usuários totais
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Taxa de Sucesso
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {(systemMetrics?.successRate || 0).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          em {systemMetrics?.totalConversions || 0} conversões
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Tempo Médio
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {((systemMetrics?.averageConversionTime || 0) / 1000).toFixed(2)}s
                        </div>
                        <p className="text-xs text-muted-foreground">
                          por conversão
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {dailyStats && <ConversionMetricsChart data={dailyStats} timeFilter={timeFilter} />}
                </TabsContent>
                
                <TabsContent value="users">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Usuários do Sistema</CardTitle>
                        <div className="flex space-x-2">
                          <Button onClick={exportSelectedUsers} variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar Selecionados
                          </Button>
                          <Button onClick={() => setShowAddUserDialog(true)}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Novo Usuário
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar usuários..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="max-w-sm"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox 
                                checked={selectAllUsers} 
                                onCheckedChange={handleToggleSelectAll}
                                aria-label="Selecionar todos os usuários"
                              />
                            </TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Créditos</TableHead>
                            <TableHead>Conversões</TableHead>
                            <TableHead>Taxa de Sucesso</TableHead>
                            <TableHead>Última Conversão</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={10} className="h-24 text-center">
                                Nenhum usuário encontrado.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredUsers.map((user) => {
                              const metrics = userMetrics[user.id] || {
                                totalConversions: 0,
                                successfulConversions: 0,
                                failedConversions: 0,
                                averageConversionTime: 0,
                                lastConversion: '-'
                              };
                              
                              return (
                                <TableRow key={user.id}>
                                  <TableCell>
                                    <Checkbox 
                                      checked={!!selectedUsers[user.id]} 
                                      onCheckedChange={() => handleToggleSelectUser(user.id)}
                                      aria-label={`Selecionar usuário ${user.name}`}
                                    />
                                  </TableCell>
                                  <TableCell>{user.name}</TableCell>
                                  <TableCell>{user.email}</TableCell>
                                  <TableCell>
                                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                                      {user.role === "admin" ? "Administrador" : "Usuário"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={user.isBanned ? "destructive" : "success"}>
                                      {user.isBanned ? "Banido" : "Ativo"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{user.credits}</TableCell>
                                  <TableCell>{metrics.totalConversions}</TableCell>
                                  <TableCell>
                                    {metrics.totalConversions > 0
                                      ? ((metrics.successfulConversions / metrics.totalConversions) * 100).toFixed(1)
                                      : 0}%
                                  </TableCell>
                                  <TableCell>
                                    {metrics.lastConversion !== '-'
                                      ? formatDate(metrics.lastConversion)
                                      : 'Nunca converteu'}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-1">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          setSelectedUser(user.id);
                                          setShowUserDetailsDialog(true);
                                        }}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          setSelectedUser(user.id);
                                          setShowRoleDialog(true);
                                        }}
                                      >
                                        {user.role === "admin" ? (
                                          <Shield className="h-4 w-4" />
                                        ) : (
                                          <ShieldOff className="h-4 w-4" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          setSelectedUser(user.id);
                                          setShowBanDialog(true);
                                        }}
                                      >
                                        {user.isBanned ? (
                                          <Check className="h-4 w-4" />
                                        ) : (
                                          <Ban className="h-4 w-4" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          setSelectedUser(user.id);
                                          setShowCreditsDialog(true);
                                        }}
                                      >
                                        <Coins className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          setSelectedUser(user.id);
                                          setShowDeleteDialog(true);
                                        }}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* User Details Dialog */}
        <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
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
                      <div className="grid grid-cols-2 gap-2">
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
                          <Label>Função</Label>
                          <div className="text-sm">{user.role === 'admin' ? 'Administrador' : 'Usuário'}</div>
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
                        <div className="grid grid-cols-2 gap-2">
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
            )}
            <DialogFooter>
              <Button onClick={() => setShowUserDetailsDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Usuário</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ban/Unban User Dialog */}
        <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {users.find((u) => u.id === selectedUser)?.isBanned
                  ? "Desbanir Usuário"
                  : "Banir Usuário"}
              </DialogTitle>
              <DialogDescription>
                {users.find((u) => u.id === selectedUser)?.isBanned
                  ? "Tem certeza que deseja desbanir este usuário?"
                  : "Tem certeza que deseja banir este usuário?"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBanDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant={
                  users.find((u) => u.id === selectedUser)?.isBanned
                    ? "default"
                    : "destructive"
                }
                onClick={handleBanUser}
              >
                {users.find((u) => u.id === selectedUser)?.isBanned
                  ? "Desbanir"
                  : "Banir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Role Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Função</DialogTitle>
              <DialogDescription>
                {users.find((u) => u.id === selectedUser)?.role === "admin"
                  ? "Remover privilégios de administrador deste usuário?"
                  : "Tornar este usuário um administrador?"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleChangeRole}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Credits Dialog */}
        <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Créditos</DialogTitle>
              <DialogDescription>
                Adicione ou remova créditos do usuário.
                Use números negativos para remover créditos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="credits" className="text-right">
                  Créditos
                </Label>
                <Input
                  id="credits"
                  type="number"
                  value={creditsToAdd}
                  onChange={(e) => setCreditsToAdd(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreditsDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateCredits}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add User Dialog */}
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo usuário.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="form-group">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="form-group">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="form-group">
                <Label htmlFor="password" className="text-right">
                  Senha
                </Label>
                <Input
                  id="
