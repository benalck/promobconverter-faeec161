import { useState } from "react";
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
  Activity
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
import ConversionMetricsChart from "@/components/admin/ConversionMetricsChart";

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
  const [timeFilter, setTimeFilter] = useState("today");
  
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserCredits, setNewUserCredits] = useState("5");
  const [isNewUserAdmin, setIsNewUserAdmin] = useState(false);
  
  const [creditsToAdd, setCreditsToAdd] = useState("0");

  const {
    metrics: systemMetrics,
    dailyStats,
    isLoading: isLoadingSystem,
    error: systemError
  } = useSystemMetrics(timeFilter);

  const {
    metrics: userMetrics,
    isLoading: isLoadingUsers,
    error: userError
  } = useUserMetrics(users.map(u => u.id), timeFilter);

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
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
      await register({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        credits: parseInt(newUserCredits),
        role: isNewUserAdmin ? "admin" : "user",
      });

      toast({
        title: "Usuário adicionado",
        description: "O novo usuário foi adicionado com sucesso.",
      });

      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserCredits("5");
      setIsNewUserAdmin(false);
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
              <CardTitle className="text-2xl">Painel do Administrador</CardTitle>
              <CardDescription>
                Monitore e gerencie o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuários Ativos
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  de {systemMetrics.totalUsers} usuários totais
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
                  {systemMetrics.successRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  em {systemMetrics.totalConversions} conversões
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
                  {(systemMetrics.averageResponseTime / 1000).toFixed(2)}s
                </div>
                <p className="text-xs text-muted-foreground">
                  por conversão
                </p>
              </CardContent>
            </Card>
          </div>

          <ConversionMetricsChart data={dailyStats} timeFilter={timeFilter} />

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Usuários do Sistema</CardTitle>
                <Button onClick={() => setShowAddUserDialog(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Conversões</TableHead>
                    <TableHead>Taxa de Sucesso</TableHead>
                    <TableHead>Última Conversão</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const metrics = userMetrics[user.id] || {
                      totalConversions: 0,
                      successfulConversions: 0,
                      failedConversions: 0,
                      averageConversionTime: 0,
                      lastConversion: '-'
                    };
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.role === "admin" ? "Administrador" : "Usuário"}
                        </TableCell>
                        <TableCell>
                          {user.isBanned ? (
                            <span className="text-red-500">Banido</span>
                          ) : (
                            <span className="text-green-500">Ativo</span>
                          )}
                        </TableCell>
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
                          <div className="flex space-x-2">
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
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

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
                  id="password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="form-group">
                <Label htmlFor="credits" className="text-right">
                  Créditos
                </Label>
                <Input
                  id="credits"
                  type="number"
                  value={newUserCredits}
                  onChange={(e) => setNewUserCredits(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="form-group">
                <Label htmlFor="isAdmin" className="text-right">
                  Administrador
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAdmin"
                    checked={isNewUserAdmin}
                    onCheckedChange={setIsNewUserAdmin}
                  />
                  <Label htmlFor="isAdmin">
                    {isNewUserAdmin ? "Sim" : "Não"}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddUser}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
