
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { User, Lock, Settings, AlertTriangle, FileSpreadsheet, CalendarIcon, Tag, Download, Trash2, Save, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ConversionHistory from "@/components/profile/ConversionHistory";
import PersonalInfo from "@/components/profile/PersonalInfo";
import PlanDetails from "@/components/profile/PlanDetails";
import DangerZone from "@/components/profile/DangerZone";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="w-[380px]">
          <CardHeader>
            <CardTitle>Não autenticado</CardTitle>
            <CardDescription>
              Por favor, faça login para acessar seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full" onClick={() => window.location.href = "/login"}>
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações do sistema.
        </p>
      </div>

      {/* Personal Information Section */}
      <PersonalInfo user={user} updateUser={updateUser} />

      {/* Account Settings & Plan Section */}
      <PlanDetails user={user} />

      {/* Conversion History Section */}
      <ConversionHistory userId={user.id} />

      {/* Danger Zone Section */}
      <DangerZone user={user} />
    </div>
  );
}
