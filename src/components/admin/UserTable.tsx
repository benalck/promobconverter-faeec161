
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Download, PlusCircle, Eye, Shield, ShieldOff, Ban, Check, Coins, Trash } from "lucide-react";
import { User } from "@/contexts/auth/types";
import { UserMetricsCollection } from "@/hooks/useUserMetrics";
import { useToast } from "@/hooks/use-toast";

interface UserTableProps {
  users: User[];
  userMetrics: UserMetricsCollection;
  formatDate: (date: string) => string;
  onShowUserDetails: (userId: string) => void;
  onShowRoleDialog: (userId: string) => void;
  onShowBanDialog: (userId: string) => void;
  onShowCreditsDialog: (userId: string) => void;
  onShowDeleteDialog: (userId: string) => void;
  onShowAddUserDialog: () => void;
}

export function UserTable({
  users,
  userMetrics,
  formatDate,
  onShowUserDetails,
  onShowRoleDialog,
  onShowBanDialog,
  onShowCreditsDialog,
  onShowDeleteDialog,
  onShowAddUserDialog
}: UserTableProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  const [selectAllUsers, setSelectAllUsers] = useState(false);

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Usuários do Sistema</CardTitle>
          <div className="flex space-x-2">
            <Button onClick={exportSelectedUsers} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Selecionados
            </Button>
            <Button onClick={onShowAddUserDialog}>
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
                          onClick={() => onShowUserDetails(user.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onShowRoleDialog(user.id)}
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
                          onClick={() => onShowBanDialog(user.id)}
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
                          onClick={() => onShowCreditsDialog(user.id)}
                        >
                          <Coins className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onShowDeleteDialog(user.id)}
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
  );
}
