
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { useUserMetrics } from "@/hooks/useUserMetrics";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, RefreshCcw } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { UserTable } from "@/components/admin/UserTable";
import { UserDetailsDialog } from "@/components/admin/UserDetailsDialog";
import { 
  DeleteDialog,
  BanDialog,
  RoleDialog,
  AddUserDialog
} from "@/components/admin/UserDialogs";
import { useIsMobile } from "@/hooks/use-mobile";

// Type for handling register user form
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
    updateUser, 
    register
  } = useAuth();
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // State for dialog management
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  
  // UI state
  const [timeFilter, setTimeFilter] = useState("today");
  const [activeTab, setActiveTab] = useState("users");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Form states for the add user dialog
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPhone, setNewUserPhone] = useState(""); 
  const [isNewUserAdmin, setIsNewUserAdmin] = useState(false);

  // Fetch metrics data
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

  // Efeito para recarregar dados quando houver erro
  useEffect(() => {
    if (systemError || userError) {
      const retryTimeout = setTimeout(() => {
        refreshData();
      }, 5000); // Tenta novamente após 5 segundos

      return () => clearTimeout(retryTimeout);
    }
  }, [systemError, userError]);

  // Function to refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      console.log('Iniciando atualização de dados...');
      
      // Tentativas individuais para identificar qual está falhando
      try {
        console.log('Atualizando métricas do sistema...');
        await refetchSystemMetrics();
        console.log('Métricas do sistema atualizadas com sucesso!');
      } catch (e) {
        console.error('Falha ao atualizar métricas do sistema:', e);
      }
      
      try {
        console.log('Atualizando métricas de usuários...');
        await fetchUserMetrics();
        console.log('Métricas de usuários atualizadas com sucesso!');
      } catch (e) {
        console.error('Falha ao atualizar métricas de usuários:', e);
      }
      
      toast({
        title: "Dados atualizados",
        description: "Os dados da administração foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast({
        title: "Erro ao atualizar dados",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

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
        // If registration successful, update role if admin
        if (isNewUserAdmin) {
          const newUser = users.find(u => u.email === newUserEmail);
          if (newUser) {
            await updateUser(newUser.id, { 
              role: "admin"
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
        setNewUserPhone("");
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-3">Carregando métricas...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (systemError || userError) {
    const errorMessage = systemError?.message || userError?.message || "Erro ao carregar métricas. Por favor, tente novamente.";
    console.error('Erro específico:', systemError || userError);
    
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <span>{errorMessage}</span>
            </div>
            <div className="text-sm text-gray-500 max-w-md text-center mt-2">
              {errorMessage.includes("Could not find the function") && 
                "As funções de métricas podem não estar disponíveis no banco de dados. Verifique as migrações."}
              {errorMessage.includes("permission denied") && 
                "Você não tem permissão para acessar estas métricas. Verifique suas permissões de administrador."}
            </div>
            <Button
              variant="outline"
              onClick={refreshData}
              disabled={isRefreshing}
              className="mt-4"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Tentar novamente
                </>
              )}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className={`container mx-auto ${isMobile ? 'px-2 py-4' : 'py-8'}`}>
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader className={isMobile ? "px-4 py-3" : ""}>
              <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-between items-center'}`}>
                <div>
                  <CardTitle className={isMobile ? "text-xl" : "text-2xl"}>Painel do Administrador</CardTitle>
                  <CardDescription>
                    Monitore e gerencie o sistema
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={refreshData} 
                  disabled={isRefreshing}
                  size={isMobile ? "sm" : "default"}
                  className={isMobile ? "w-full" : ""}
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
            <CardContent className={isMobile ? "px-4 pb-4" : ""}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
                  <TabsTrigger value="users" className="flex-1">Usuários</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dashboard">
                  <AdminDashboard 
                    systemMetrics={systemMetrics}
                    dailyStats={dailyStats}
                    timeFilter={timeFilter}
                    setTimeFilter={setTimeFilter}
                  />
                </TabsContent>
                
                <TabsContent value="users">
                  <UserTable 
                    users={users}
                    userMetrics={userMetrics}
                    formatDate={formatDate}
                    onShowUserDetails={(userId) => {
                      setSelectedUser(userId);
                      setShowUserDetailsDialog(true);
                    }}
                    onShowRoleDialog={(userId) => {
                      setSelectedUser(userId);
                      setShowRoleDialog(true);
                    }}
                    onShowBanDialog={(userId) => {
                      setSelectedUser(userId);
                      setShowBanDialog(true);
                    }}
                    onShowDeleteDialog={(userId) => {
                      setSelectedUser(userId);
                      setShowDeleteDialog(true);
                    }}
                    onShowAddUserDialog={() => {
                      setShowAddUserDialog(true);
                    }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* All dialogs */}
        <UserDetailsDialog 
          open={showUserDetailsDialog} 
          onOpenChange={setShowUserDetailsDialog}
          selectedUser={selectedUser}
          users={users}
          userMetrics={userMetrics}
          formatDate={formatDate}
        />

        <DeleteDialog 
          open={showDeleteDialog} 
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteUser}
        />

        <BanDialog 
          open={showBanDialog} 
          onOpenChange={setShowBanDialog}
          onConfirm={handleBanUser}
          selectedUser={selectedUser}
          users={users}
        />

        <RoleDialog 
          open={showRoleDialog} 
          onOpenChange={setShowRoleDialog}
          onConfirm={handleChangeRole}
          selectedUser={selectedUser}
          users={users}
        />

        <AddUserDialog 
          open={showAddUserDialog} 
          onOpenChange={setShowAddUserDialog}
          onConfirm={handleAddUser}
          newUserName={newUserName}
          setNewUserName={setNewUserName}
          newUserEmail={newUserEmail}
          setNewUserEmail={setNewUserEmail}
          newUserPassword={newUserPassword}
          setNewUserPassword={setNewUserPassword}
          newUserPhone={newUserPhone}
          setNewUserPhone={setNewUserPhone}
          isNewUserAdmin={isNewUserAdmin}
          setIsNewUserAdmin={setIsNewUserAdmin}
        />
      </div>
    </AppLayout>
  );
}
