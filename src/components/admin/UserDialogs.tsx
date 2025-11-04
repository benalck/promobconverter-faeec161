import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User } from "@/contexts/auth/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatPhoneNumber } from "@/lib/utils"; // Import formatPhoneNumber
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteDialog({ open, onOpenChange, onConfirm }: DeleteDialogProps) {
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "max-w-[90vw] p-4" : ""}>
        <DialogHeader>
          <DialogTitle>Excluir Usuário</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface BanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  selectedUser: string | null;
  users: User[];
}

export function BanDialog({ open, onOpenChange, onConfirm, selectedUser, users }: BanDialogProps) {
  const user = users.find(u => u.id === selectedUser);
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "max-w-[90vw] p-4" : ""}>
        <DialogHeader>
          <DialogTitle>
            {user?.isBanned ? "Desbanir Usuário" : "Banir Usuário"}
          </DialogTitle>
          <DialogDescription>
            {user?.isBanned 
              ? "Tem certeza que deseja desbanir este usuário?" 
              : "Tem certeza que deseja banir este usuário?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant={user?.isBanned ? "default" : "destructive"}
            onClick={onConfirm}
          >
            {user?.isBanned ? "Desbanir" : "Banir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newRole: 'admin' | 'user') => void; // Modified to pass new role
  selectedUser: string | null;
  users: User[];
  currentUserRole: 'admin' | 'user' | 'ceo'; // New prop
}

export function RoleDialog({ open, onOpenChange, onConfirm, selectedUser, users, currentUserRole }: RoleDialogProps) {
  const user = users.find(u => u.id === selectedUser);
  const isMobile = useIsMobile();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>(user?.role === 'admin' ? 'admin' : 'user');

  // Update selectedRole when user changes
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role === 'admin' ? 'admin' : 'user');
    }
  }, [user]);

  if (!user) return null;

  const handleConfirm = () => {
    onConfirm(selectedRole);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "max-w-[90vw] p-4" : ""}>
        <DialogHeader>
          <DialogTitle>Alterar Função do Usuário</DialogTitle>
          <DialogDescription>
            Você está alterando a função de <span className="font-semibold">{user.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="form-group">
            <Label htmlFor="role-select" className="text-right">
              Função
            </Label>
            <Select value={selectedRole} onValueChange={(value: 'admin' | 'user') => setSelectedRole(value)}>
              <SelectTrigger id="role-select" className="mt-1">
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  newUserName: string;
  setNewUserName: (value: string) => void;
  newUserEmail: string;
  setNewUserEmail: (value: string) => void;
  newUserPassword: string;
  setNewUserPassword: (value: string) => void;
  newUserPhone: string;
  setNewUserPhone: (value: string) => void;
  isNewUserAdmin: boolean;
  setIsNewUserAdmin: (value: boolean) => void;
  currentUserRole: 'admin' | 'user' | 'ceo'; // New prop
}

export function AddUserDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  newUserName,
  setNewUserName,
  newUserEmail,
  setNewUserEmail,
  newUserPassword,
  setNewUserPassword,
  newUserPhone,
  setNewUserPhone,
  isNewUserAdmin,
  setIsNewUserAdmin,
  currentUserRole // New prop
}: AddUserDialogProps) {
  const isMobile = useIsMobile();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNewUserPhone(formatted);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "max-w-[90vw] p-4" : ""}>
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
              className="mt-1"
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
              className="mt-1"
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
              className="mt-1"
            />
          </div>
          <div className="form-group">
            <Label htmlFor="phone" className="text-right">
              Telefone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={newUserPhone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className="mt-1"
              maxLength={15}
            />
          </div>
          {currentUserRole === 'ceo' && ( // Only CEO can set admin role for new users
            <div className="form-group flex items-center space-x-2">
              <Switch
                id="admin"
                checked={isNewUserAdmin}
                onCheckedChange={setIsNewUserAdmin}
              />
              <Label htmlFor="admin">Usuário Administrador</Label>
            </div>
          )}
        </div>
        <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}