import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Download, PlusCircle, Eye, Shield, ShieldOff, Ban, Check, Trash, Coins } from "lucide-react";
import { User } from "@/contexts/auth/types";
import { UserMetricsCollection } from "@/hooks/useUserMetrics";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserTableProps {
  users: User[];
  userMetrics: UserMetricsCollection;
  formatDate: (date: string) => string;
  onShowUserDetails: (userId: string) => void;
  onShowRoleDialog: (userId: string) => void;
  onShowBanDialog: (userId: string) => void;
  onShowDeleteDialog: (userId: string) => void;
  onShowAddUserDialog: () => void;
  onShowAddCreditsDialog: (userId: string) => void; // New prop
}

export function UserTable({
  users,
  userMetrics,
  formatDate,
  onShowUserDetails,
  onShowRoleDialog,
  onShowBanDialog,
  onShowDeleteDialog,
  onShowAddUserDialog,
  onShowAddCreditsDialog // New prop
}: UserTableProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  const [selectAllUsers, setSelectAllUsers] = useState(false);

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        phone: user.phone,
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

  // Colunas a serem mostradas com base no tamanho da tela
  const getColumns = () => {
    if (isMobile) {
      return ['select', 'name', 'role', 'status', 'actions'];
    }
    return ['select', 'name', 'email', 'phone', 'role', 'status', 'credits', 'conversions', 'successRate', 'lastConversion', 'actions'];
  };

  const visibleColumns = getColumns();

  return (
    <Card>
      <CardHeader>
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'}`}>
          <CardTitle>Usuários do Sistema</CardTitle>
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
            <Button 
              onClick={exportSelectedUsers} 
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className={isMobile ? "w-full" : ""}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button 
              onClick={onShowAddUserDialog}
              size={isMobile ? "sm" : "default"}
              className={isMobile ? "w-full" : ""}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários por nome, email ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={isMobile ? "h-[400px]" : "max-h-[600px]"}>
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes('select') && (
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectAllUsers} 
                        onCheckedChange={handleToggleSelectAll}
                        aria-label="Selecionar todos os usuários"
                      />
                    </TableHead>
                  )}
                  {visibleColumns.includes('name') && <TableHead>Nome</TableHead>}
                  {visibleColumns.includes('email') && <TableHead>Email</TableHead>}
                  {visibleColumns.includes('phone') && <TableHead>Telefone</TableHead>}
                  {visibleColumns.includes('role') && <TableHead>Função</TableHead>}
                  {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
                  {visibleColumns.includes('credits') && <TableHead>Créditos</TableHead>}
                  {visibleColumns.includes('conversions') && <TableHead>Conversões</TableHead>}
                  {visibleColumns.includes('successRate') && <TableHead>Taxa de Sucesso</TableHead>}
                  {visibleColumns.includes('lastConversion') && <TableHead>Última Conversão</TableHead>}
                  {visibleColumns.includes('actions') && <TableHead>Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
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
                        {visibleColumns.includes('select') && (
                          <TableCell>
                            <Checkbox 
                              checked={!!selectedUsers[user.id]} 
                              onCheckedChange={() => handleToggleSelectUser(user.id)}
                              aria-label={`Selecionar usuário ${user.name}`}
                            />
                          </TableCell>
                        )}
                        {visibleColumns.includes('name') && (
                          <TableCell>{user.name}</TableCell>
                        )}
                        {visibleColumns.includes('email') && (
                          <TableCell>{user.email}</TableCell>
                        )}
                        {visibleColumns.includes('phone') && (
                          <TableCell>{user.phone || 'N/A'}</TableCell>
                        )}
                        {visibleColumns.includes('role') && (
                          <TableCell>
                            <Badge variant={user.role === "admin" || user.role === "ceo" ? "default" : "outline"}>
                              {user.role === "admin" ? "Admin" : user.role === "ceo" ? "CEO" : "Usuário"}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.includes('status') && (
                          <TableCell>
                            <Badge variant={user.isBanned ? "destructive" : "success"}>
                              {user.isBanned ? "Banido" : "Ativo"}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.includes('credits') && (
                          <TableCell>{user.credits}</TableCell>
                        )}
                        {visibleColumns.includes('conversions') && (
                          <TableCell>{metrics.totalConversions}</TableCell>
                        )}
                        {visibleColumns.includes('successRate') && (
                          <TableCell>
                            {metrics.totalConversions > 0
                              ? ((metrics.successfulConversions / metrics.totalConversions) * 100).toFixed(1)
                              : 0}%
                          </TableCell>
                        )}
                        {visibleColumns.includes('lastConversion') && (
                          <TableCell>
                            {metrics.lastConversion !== '-'
                              ? formatDate(metrics.lastConversion)
                              : 'Nunca converteu'}
                          </TableCell>
                        )}
                        {visibleColumns.includes('actions') && (
                          <TableCell>
                            <div className={`flex ${isMobile ? 'flex-col space-y-1' : 'space-x-1'}`}>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onShowUserDetails(user.id)}
                                title="Ver Detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onShowAddCreditsDialog(user.id)} // New button
                                title="Adicionar Créditos"
                              >
                                <Coins className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onShowRoleDialog(user.id)}
                                title={user.role === "admin" || user.role === "ceo" ? "Remover Admin/CEO" : "Tornar Admin"}
                              >
                                {user.role === "admin" || user.role === "ceo" ? (
                                  <Shield className="h-4 w-4" />
                                ) : (
                                  <ShieldOff className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onShowBanDialog(user.id)}
                                title={user.isBanned ? "Desbanir Usuário" : "Banir Usuário"}
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
                                onClick={() => onShowDeleteDialog(user.id)}
                                title="Excluir Usuário (Banir)"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}