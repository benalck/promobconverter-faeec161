
import { useState } from "react";
import { User } from "@/contexts/auth/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PlanDetailsProps {
  user: User;
}

export default function PlanDetails({ user }: PlanDetailsProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("pt-BR");
  const [defaultFormat, setDefaultFormat] = useState("excel");
  
  const planName = user.activePlan || "Gratuito";
  const planExpiry = user.planExpiryDate ? 
    format(new Date(user.planExpiryDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 
    "Sem data de expiração";
  
  // Calculate plan activation date - if not available, use user creation date
  const activationDate = user.planExpiryDate ? 
    format(new Date(new Date(user.planExpiryDate).getTime() - 30 * 24 * 60 * 60 * 1000), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) :
    format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle>Configurações e Plano</CardTitle>
        </div>
        <CardDescription>
          Informações do seu plano atual e preferências do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Seu Plano</h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{planName}</span>
                <Badge variant={planName === "Gratuito" ? "outline" : "default"}>
                  {planName === "Gratuito" ? "Gratuito" : "Ativo"}
                </Badge>
              </div>
              <div className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" /> 
                Ativado em {activationDate}
              </div>
              {user.planExpiryDate && (
                <div className="mt-1 text-sm text-muted-foreground">
                  Válido até {planExpiry}
                </div>
              )}
            </div>
            
            {planName === "Gratuito" ? (
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                5 conversões/mês
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                Conversões ilimitadas
              </Badge>
            )}
          </div>
        </div>
        
        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Preferências</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="language" className="text-sm font-medium">Idioma</label>
              <select
                id="language"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="format" className="text-sm font-medium">Formato de Saída Padrão</label>
              <select
                id="format"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={defaultFormat}
                onChange={(e) => setDefaultFormat(e.target.value)}
              >
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="txt">Texto (.txt)</option>
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
