import { useState, useEffect, useCallback } from "react";
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
import { 
  AlertCircle, 
  Loader2, 
  RefreshCcw, 
  MessageSquare, 
  Mail, 
  MailCheck, 
  History,
} from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { UserTable } from "@/components/admin/UserTable";
import { UserDetailsDialog } from "@/components/admin/UserDetailsDialog";
import { 
  DeleteDialog,
  BanDialog,
  RoleDialog,
  AddUserDialog
} from "@/components/admin/UserDialogs";
import { AddCreditsDialog } from "@/components/admin/AddCreditsDialog";
import { AdminLogsTable } from "@/components/admin/AdminLogsTable";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  getContactForms, 
  updateContactStatus,
  ContactForm 
} from "@/components/HumanizedChat";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/utils/adminLogger";

// Type for handling register user form
interface RegisterUserForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AdminLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id: string | null;
  details: any;
  timestamp: string;
}

export default function Admin() {
  const { 
    user: currentUser,
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
  const [showAddCreditsDialog, setShowAddCreditsDialog] = useState(false);
  
  // UI state
  const [timeFilter, setTimeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Contacts state
  const [contacts, setContacts] = useState<ContactForm[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactForm | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);

  // Admin Logs state
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  
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
    fetchConversionsByDateRange,
    refetch: refetchSystemMetrics
  } = useSystemMetrics();

  const {
    metrics: userMetrics,
    isLoading: isLoadingUsers,
    error: userError,
    fetchUserMetrics
  } = useUserMetrics();

  // Function to load contacts from localStorage
  const loadContacts = useCallback(() => {
    const allContacts = getContactForms();
    allContacts.sort((a, b) => {
      const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
    setContacts(allContacts);
  }, []);

  // Function to load admin logs from Supabase
  const fetchAdminLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('admin_actions_log')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setAdminLogs(data as AdminLog[]);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      toast({
        title: "Erro ao carregar logs",
        description: "Não foi possível carregar os logs de ações administrativas.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLogs(false);
    }
  }, [toast]);

  // Function to refresh data
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      console.log('Iniciando atualização de dados...');
      
      try {
        console.log('Atualizando métricas do sistema...');
        await refetchSystemMetrics(timeFilter);
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
      
      loadContacts();
      fetchAdminLogs();
      
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
  }, [refetchSystemMetrics, fetchUserMetrics, loadContacts, fetchAdminLogs, toast, timeFilter]);

  // Efeito para recarregar dados quando houver erro
  useEffect(() => {
    if (systemError || userError) {
      const retryTimeout = setTimeout(() => {
        refreshData(); 
      }, 5000);

      return () => clearTimeout(retryTimeout);
    }
  }, [systemError, userError, refreshData]);
  
  // Initial data load and polling setup
  useEffect(() => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'ceo') {
      refreshData();

      const pollingInterval = setInterval(() => {
        refreshData();
      }, 30000);

      return () => clearInterval(pollingInterval);
    }
  }, [currentUser?.role, refreshData]);

  // Fetch daily stats when timeFilter changes
  useEffect(() => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'ceo') {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;

      switch (timeFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'all':
        default:
          startDate = new Date(0);
          break;
      }
      fetchConversionsByDateRange(startDate.toISOString(), endDate.toISOString());
      fetchSystemMetrics(timeFilter);
    }
  }, [timeFilter, currentUser?.role, fetchConversionsByDateRange, fetchSystemMetrics]);
  
  // Função para marcar contato como visualizado
  const markAsViewed = (contactId: string) => {
    const success = updateContactStatus(contactId, 'viewed');
    if (success) {
      loadContacts();
      toast({
        title: "Contato atualizado",
        description: "O contato foi marcado como visualizado.",
      });
      logAdminAction('contact_viewed', null, { contactId });
    }
  };
  
  // Função para marcar contato como respondido
  const markAsReplied = (contactId: string) => {
    const success = updateContactStatus(contactId, 'replied');
    if (success) {
      loadContacts();
      toast({
        title: "Contato atualizado",
        description: "O contato foi marcado como respondido.",
      });
      logAdminAction('contact_replied', null, { contactId });
    }
  };

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return format(dateObj, "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser);
      toast({
        title: "Usuário banido",
        description: "O usuário foi banido com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erro ao banir usuário",
        description: "Ocorreu um erro ao banir o usuário.",
        variant: "destructive",
      });
    }

    setShowDeleteDialog(false);
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    const userToUpdate = users.find((u) => u.id === selectedUser);
    if (!userToUpdate) return;

    try {
      await updateUser(selectedUser, { isBanned: !userToUpdate.isBanned });
      toast({
        title: userToUpdate.isBanned ? "Usuário desbanido" : "Usuário banido",
        description: userToUpdate.isBanned
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

  const handleChangeRole = async (newRole: 'admin' | 'user') => {
    if (!selectedUser) return;

    const userToUpdate = users.find((u) => u.id === selectedUser);
    if (!userToUpdate) return;

    try {
      await updateUser(selectedUser, {
        role: newRole,
      });
      toast({
        title: "Função alterada",
        description: `O usuário agora é ${
          newRole === "admin" ? "administrador" : "usuário comum"
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
      const userData: RegisterUserForm = {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        phone: newUserPhone || "(00) 00000-0000"
      };
      
      const result = await register(userData);
      
      if (result.success) {
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
          description: result.message || "Ocorreu um erro ao adicionar o usuário.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Erro ao adicionar usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao adicionar o usuário.",
        variant: "destructive",
      });
    }

    setShowAddUserDialog(false);
  };

  const handleAddCredits = async (amount: number, description: string) => {
    if (!selectedUser || !currentUser?.id) return;

    try {
      const { error } = await supabase.rpc('add_credits_to_user', {
        p_target_user_id: selectedUser,
        p_amount: amount,
        p_admin_id: currentUser.id,
        p_description: description
      });

      if (error) throw error;

      await updateUser(selectedUser, { credits: (users.find(u => u.id === selectedUser)?.credits || 0) + amount });

      toast({
        title: "Créditos adicionados",
        description: `${amount} créditos foram adicionados ao usuário.`,
      });
    } catch (error) {
      console.error('Error adding credits:', error);
      toast({
        title: "Erro ao adicionar créditos",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao adicionar créditos.",
        variant: "destructive",
      });
    } finally {
      setShowAddCreditsDialog(false);
    }
  };
  
  const renderStatusBadge = (status: 'pending' | 'viewed' | 'replied') => {
    if (status === 'pending') {
      return <Badge variant="destructive">Pendente</Badge>;
    } else if (status === 'viewed') {
      return <Badge variant="secondary">Visualizado</Badge>;
    } else {
      return <Badge variant="success" className="bg-green-600 hover:bg-green-700">Respondido</Badge>;
    }
  };
  
  const getContactCountByStatus = (status: 'pending' | 'viewed' | 'replied') => {
    return contacts.filter(contact => contact.status === status).length;
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
              {errorMessage.includes("Access denied") && 
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
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Atualizar Dados
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className={isMobile ? "px-4 pb-4" : ""}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
                  <TabsTrigger value="users" className="flex-1">Usuários</TabsTrigger>
                  <TabsTrigger value="contacts" className="flex-1">Contatos</TabsTrigger>
                  {currentUser?.role === 'ceo' && (
                    <TabsTrigger value="logs" className="flex-1">Logs</TabsTrigger>
                  )}
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
                    currentUserRole={currentUser?.role || 'user'}
                    currentUserId={currentUser?.id || ''}
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
                    onShowAddCreditsDialog={(userId) => {
                      setSelectedUser(userId);
                      setShowAddCreditsDialog(true);
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="contacts">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold`}>
                      Gerenciar Contatos
                    </h2>
                    <div className="flex gap-2">
                      <div className="flex items-center space-x-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="text-xs">{getContactCountByStatus('pending')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
                        <span className="text-xs">{getContactCountByStatus('viewed')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-xs">{getContactCountByStatus('replied')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {contacts.length === 0 ? (
                    <Card className="p-6 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum contato recebido ainda.</p>
                    </Card>
                  ) : (
                    <Card>
                      <div className="overflow-auto max-h-[600px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Nome</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contacts.map((contact) => (
                              <TableRow key={contact.id} className={contact.status === 'pending' ? 'bg-red-50' : ''}>
                                <TableCell className="whitespace-nowrap">
                                  {formatDate(contact.timestamp)}
                                </TableCell>
                                <TableCell className="font-medium">{contact.name}</TableCell>
                                <TableCell>{contact.email}</TableCell>
                                <TableCell>
                                  {renderStatusBadge(contact.status)}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedContact(contact);
                                      setShowContactDialog(true);
                                      
                                      if (contact.status === 'pending') {
                                        markAsViewed(contact.id);
                                      }
                                    }}
                                  >
                                    Detalhes
                                  </Button>
                                  
                                  {contact.status !== 'replied' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                                      onClick={() => markAsReplied(contact.id)}
                                    >
                                      <MailCheck className="h-4 w-4 mr-1" />
                                      <span className={isMobile ? "sr-only" : ""}>Respondido</span>
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </Card>
                  )}
                </TabsContent>

                {currentUser?.role === 'ceo' && (
                  <TabsContent value="logs">
                    <AdminLogsTable logs={adminLogs} isLoading={isLoadingLogs} users={users} formatDate={formatDate} />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

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
          currentUserRole={currentUser?.role || 'user'}
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
          currentUserRole={currentUser?.role || 'user'}
        />

        <AddCreditsDialog
          open={showAddCreditsDialog}
          onOpenChange={setShowAddCreditsDialog}
          onConfirm={handleAddCredits}
          selectedUser={selectedUser}
          users={users}
        />

        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" /> 
                Detalhes do Contato
              </DialogTitle>
              <DialogDescription>
                Informações enviadas pelo usuário
              </DialogDescription>
            </DialogHeader>
            
            {selectedContact && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Nome</h3>
                  <p>{selectedContact.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">Email</h3>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-500" />
                    <a 
                      href={`mailto:${selectedContact.email}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {selectedContact.email}
                    </a>
                  </p>
                </div>
                
                {selectedContact.phone && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Telefone</h3>
                    <p>{selectedContact.phone}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">Data</h3>
                  <p>{formatDate(selectedContact.timestamp)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">Status</h3>
                  <p>{renderStatusBadge(selectedContact.status)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">Mensagem</h3>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>
                
                <DialogFooter className="flex justify-between gap-2 sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      window.location.href = `mailto:${selectedContact.email}?subject=PromobConverter Pro - Resposta ao seu contato&body=Olá ${selectedContact.name},%0D%0A%0D%0AObrigado por entrar em contato conosco.%0D%0A%0D%0A`;
                      markAsReplied(selectedContact.id);
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Responder por Email
                  </Button>
                  
                  {selectedContact.status !== 'replied' && (
                    <Button 
                      type="button"
                      onClick={() => {
                        markAsReplied(selectedContact.id);
                        setShowContactDialog(false);
                      }}
                    >
                      <MailCheck className="h-4 w-4 mr-2" />
                      Marcar como Respondido
                    </Button>
                  )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}