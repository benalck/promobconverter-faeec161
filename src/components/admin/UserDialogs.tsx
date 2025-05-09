import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir usuário</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este usuário? Esta ação não pode ser
            desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Excluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BanDialog({
  open,
  onOpenChange,
  onConfirm,
  selectedUser,
  users,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  selectedUser: string | null;
  users: any[];
}) {
  const user = users.find((u) => u.id === selectedUser);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Banir usuário</DialogTitle>
          <DialogDescription>
            {user?.isBanned
              ? "Tem certeza que deseja desbanir este usuário?"
              : "Tem certeza que deseja banir este usuário?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            {user?.isBanned ? "Desbanir" : "Banir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RoleDialog({
  open,
  onOpenChange,
  onConfirm,
  selectedUser,
  users,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  selectedUser: string | null;
  users: any[];
}) {
  const user = users.find((u) => u.id === selectedUser);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar função</DialogTitle>
          <DialogDescription>
            {user?.role === "admin"
              ? "Deseja alterar este usuário para função básica?"
              : user?.role === "ceo"
              ? "Deseja alterar este CEO para função básica?"
              : "Deseja promover este usuário para administrador?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            {user?.role === "admin" || user?.role === "ceo"
              ? "Remover privilégios"
              : "Promover para admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PromoteToCEODialog({
  open,
  onOpenChange,
  onConfirm,
  selectedUser,
  users,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  selectedUser: string | null;
  users: any[];
}) {
  const user = users.find((u) => u.id === selectedUser);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promover para CEO</DialogTitle>
          <DialogDescription>
            {user?.role === "ceo"
              ? "Este usuário já é CEO."
              : `Deseja promover ${user?.name || 'este usuário'} para CEO da empresa? Este é o nível mais alto de acesso no sistema.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {user?.role !== "ceo" && (
            <Button variant="gradient" onClick={onConfirm}>
              Promover para CEO
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  newUserName: string;
  setNewUserName: React.Dispatch<React.SetStateAction<string>>;
  newUserEmail: string;
  setNewUserEmail: React.Dispatch<React.SetStateAction<string>>;
  newUserPassword: string;
  setNewUserPassword: React.Dispatch<React.SetStateAction<string>>;
  newUserPhone: string;
  setNewUserPhone: React.Dispatch<React.SetStateAction<string>>;
  isNewUserAdmin: boolean;
  setIsNewUserAdmin: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar novo usuário</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para adicionar um novo usuário ao sistema.
          </DialogDescription>
        </DialogHeader>
        <div>
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            id="name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
          />
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
          />
          <label htmlFor="phone">Telefone</label>
          <input
            type="tel"
            id="phone"
            value={newUserPhone}
            onChange={(e) => setNewUserPhone(e.target.value)}
          />
          <div>
            <label htmlFor="admin">Administrador</label>
            <input
              type="checkbox"
              id="admin"
              checked={isNewUserAdmin}
              onChange={(e) => setIsNewUserAdmin(e.target.checked)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
