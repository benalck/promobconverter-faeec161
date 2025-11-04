import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/contexts/auth/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (amount: number, description: string) => void;
  selectedUser: string | null;
  users: User[];
}

export function AddCreditsDialog({
  open,
  onOpenChange,
  onConfirm,
  selectedUser,
  users,
}: AddCreditsDialogProps) {
  const isMobile = useIsMobile();
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");

  const user = users.find((u) => u.id === selectedUser);

  const handleConfirm = () => {
    if (amount !== 0) {
      onConfirm(amount, description);
      setAmount(0);
      setDescription("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "max-w-[90vw] p-4" : ""}>
        <DialogHeader>
          <DialogTitle>Adicionar Créditos</DialogTitle>
          <DialogDescription>
            Adicione ou remova créditos para {user?.name || "o usuário"}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="form-group">
            <Label htmlFor="amount" className="text-right">
              Quantidade de Créditos
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <div className="form-group">
            <Label htmlFor="description" className="text-right">
              Descrição (opcional)
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Bônus de boas-vindas, ajuste manual"
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={amount === 0}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}