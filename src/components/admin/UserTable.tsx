
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  Trash2, 
  Ban, 
  Shield, 
  User, 
  UserCog, 
  UserPlus, 
  Crown, 
  FileText, 
  Check
} from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserTableProps {
  users: any[];
  userMetrics: any;
  formatDate: (date: string) => string;
  onShowUserDetails: (userId: string) => void;
  onShowRoleDialog: (userId: string) => void;
  onShowBanDialog: (userId: string) => void;
  onShowDeleteDialog: (userId: string) => void;
  onShowAddUserDialog: () => void;
  onShowPromoteToCEODialog?: (userId: string) => void; // New prop for CEO promotion
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
  onShowPromoteToCEODialog,
}: UserTableProps) {
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  const filteredUsers = users.filter((user) => {
    const searchTerm = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  });

  const getRoleBadgeClass = (role: string) => {
    if (role === "admin") return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    if (role === "ceo") return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  };

  const getRoleDisplay = (role: string) => {
    if (role === "admin") return (
      <>
        <Shield className="h-3 w-3 mr-1" />
        Admin
      </>
    );
    if (role === "ceo") return (
      <>
        <Crown className="h-3 w-3 mr-1" />
        CEO
      </>
    );
    return (
      <>
        <User className="h-3 w-3 mr-1" />
        Usuário
      </>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Input
          type="search"
          placeholder="Buscar usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={onShowAddUserDialog}>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>
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
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {user.role === 'ceo' ? (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Crown className="h-4 w-4" />
                    </div>
                  ) : user.role === 'admin' ? (
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Shield className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  {user.name}
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}
                >
                  {getRoleDisplay(user.role)}
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
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </>
                  )}
                </span>
              </TableCell>
              <TableCell>
                {user.createdAt ? formatDate(user.createdAt) : "Não disponível"}
              </TableCell>
              <TableCell>
                {user.lastLogin ? formatDate(user.lastLogin) : "Nunca"}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShowUserDetails(user.id)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    <span className="sr-only md:not-sr-only md:ml-1">Detalhes</span>
                  </Button>
                  {user.role !== "ceo" && onShowPromoteToCEODialog && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onShowPromoteToCEODialog(user.id)}
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <Crown className="h-4 w-4 mr-1" />
                      <span className="sr-only md:not-sr-only md:ml-1">CEO</span>
                    </Button>
                  )}
                  {user.role !== "ceo" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onShowRoleDialog(user.id)}
                    >
                      <UserCog className="h-4 w-4 mr-1" />
                      <span className="sr-only md:not-sr-only md:ml-1">
                        {user.role === "admin" ? "Rebaixar" : "Promover"}
                      </span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShowBanDialog(user.id)}
                    className={
                      user.isBanned
                        ? "text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                        : "text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    }
                  >
                    {user.isBanned ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Ban className="h-4 w-4 mr-1" />
                    )}
                    <span className="sr-only md:not-sr-only md:ml-1">
                      {user.isBanned ? "Ativar" : "Banir"}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShowDeleteDialog(user.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="sr-only md:not-sr-only md:ml-1">Excluir</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
