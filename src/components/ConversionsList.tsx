
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileDown, Trash2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { convertXMLToCSV } from "@/utils/xmlParser";
import { generateHtmlPrefix, generateHtmlSuffix } from "@/utils/xmlConverter";

interface Conversion {
  id: string;
  name: string;
  original_filename: string | null;
  converted_filename: string | null;
  conversion_type: string | null;
  created_at: string;
  file_content: string | null;
}

export default function ConversionsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchConversions();
  }, [user]);

  const fetchConversions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("conversions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConversions(data || []);
    } catch (error) {
      console.error("Erro ao buscar conversões:", error);
      toast({
        title: "Erro ao carregar conversões",
        description: "Não foi possível carregar suas conversões salvas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (conversion: Conversion) => {
    if (!conversion.file_content) {
      toast({
        title: "Erro ao baixar",
        description: "O conteúdo do arquivo não está disponível.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(conversion.id);
    try {
      const csvString = convertXMLToCSV(conversion.file_content);
      const htmlPrefix = generateHtmlPrefix();
      const htmlSuffix = generateHtmlSuffix();
      const content = htmlPrefix + csvString + htmlSuffix;

      const blob = new Blob([content], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = conversion.converted_filename || `${conversion.name}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download concluído",
        description: "Seu arquivo foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao baixar conversão:", error);
      toast({
        title: "Erro ao baixar",
        description: "Não foi possível baixar o arquivo convertido.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conversão?")) return;

    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from("conversions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setConversions(conversions.filter((conv) => conv.id !== id));
      toast({
        title: "Conversão excluída",
        description: "Sua conversão foi excluída com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir conversão:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir sua conversão.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Minhas Conversões</CardTitle>
            <CardDescription>
              Conversões salvas para uso posterior
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConversions}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : conversions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Você ainda não possui conversões salvas.
            </p>
            <Button
              onClick={() => window.location.href = "/converter"}
              className="mx-auto"
            >
              Ir para o Conversor
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {conversions.map((conversion) => (
              <div
                key={conversion.id}
                className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-medium">{conversion.name}</h3>
                  <p className="text-sm text-gray-500">
                    Criado em: {formatDate(conversion.created_at)}
                  </p>
                  {conversion.original_filename && (
                    <p className="text-xs text-gray-400">
                      Arquivo original: {conversion.original_filename}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(conversion)}
                    disabled={isDownloading === conversion.id}
                  >
                    {isDownloading === conversion.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                    ) : (
                      <FileDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(conversion.id)}
                    disabled={isDeleting === conversion.id}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    {isDeleting === conversion.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
