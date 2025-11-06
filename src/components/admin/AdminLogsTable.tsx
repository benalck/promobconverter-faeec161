import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Loader2, History } from "lucide-react";
import { User } from "@/contexts/auth/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id: string | null;
  details: any;
  timestamp: string;
}

interface AdminLogsTableProps {
  logs: AdminLog[];
  isLoading: boolean;
  users: User[];
  formatDate: (date: string) => string;
}

export function AdminLogsTable({ logs, isLoading, users, formatDate }: AdminLogsTableProps) {
  const isMobile = useIsMobile();

  const getAdminName = (adminId: string) => {
    const adminUser = users.find(u => u.id === adminId);
    return adminUser ? adminUser.name : "Desconhecido";
  };

  const getTargetUserName = (userId: string | null) => {
    if (!userId) return "N/A";
    const targetUser = users.find(u => u.id === userId);
    return targetUser ? targetUser.name : "Usuário Removido";
  };

  if (isLoading) {
    return (
      <Card className="p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando logs...</p>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="p-6 text-center">
        <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Nenhum log de ação administrativa encontrado.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Logs de Ações Administrativas</CardTitle>
        <CardDescription>
          Registro de todas as ações realizadas por administradores e CEOs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className={isMobile ? "h-[400px]" : "max-h-[600px]"}>
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Tipo de Ação</TableHead>
                  <TableHead>Usuário Alvo</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(log.timestamp)}</TableCell>
                    <TableCell>{getAdminName(log.admin_id)}</TableCell>
                    <TableCell>{log.action_type}</TableCell>
                    <TableCell>{getTargetUserName(log.target_user_id)}</TableCell>
                    <TableCell className="text-xs">
                      <pre className="whitespace-pre-wrap text-gray-600 bg-gray-50 p-1 rounded">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}