
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
  CreditsDialog,
  AddUserDialog
} from "@/components/admin/UserDialogs";

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
    register, 
    refreshUserCredits
  } = useAuth();
  const { toast } = useToast();
  
  // State for dialog management
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  
  // UI state
  const [timeFilter, setTimeFilter] = useState("today");
  const [activeTab, setActiveTab] = useState("users");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Form states for the add user dialog
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserCredits, setNewUserCredits] = useState("5");
  const [newUserPhone, setNewUserPhone] = useState(""); 
  const [isNewUserAdmin, setIsNewUserAdmin] = useState(false);
  
  // Credits dialog state
  const [creditsToAdd, setCreditsToAdd] = useState("0");

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
                    onShowCreditsDialog={(userId) => {
                      setSelectedUser(userId);
                      setShowCreditsDialog(true);
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

        <CreditsDialog 
          open={showCreditsDialog} 
          onOpenChange={setShowCreditsDialog}
          onConfirm={handleUpdateCredits}
          creditsToAdd={creditsToAdd}
          setCreditsToAdd={setCreditsToAdd}
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
          newUserCredits={newUserCredits}
          setNewUserCredits={setNewUserCredits}
          isNewUserAdmin={isNewUserAdmin}
          setIsNewUserAdmin={setIsNewUserAdmin}
        />
      </div>
    </AppLayout>
  );
}
