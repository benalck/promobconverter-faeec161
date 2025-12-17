import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Calendar,
  FileDown,
  RefreshCw,
  Eye,
  ArrowLeft,
  ArrowRight,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  FileSpreadsheet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Conversion {
  id: string;
  name: string;
  original_filename: string | null;
  converted_filename: string | null;
  input_format: string | null;
  output_format: string | null;
  file_size: number | null;
  conversion_time: number | null;
  success: boolean | null;
  created_at: string;
  error_message: string | null;
}

const ITEMS_PER_PAGE = 10;

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchConversions();
  }, [user, currentPage, dateFilter, statusFilter]);

  const fetchConversions = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let query = supabase
        .from('conversions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Filtro de data
      if (dateFilter !== "all") {
        const now = new Date();
        let startDate: Date;
        
        switch (dateFilter) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case "year":
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      // Filtro de status
      if (statusFilter !== "all") {
        query = query.eq('success', statusFilter === "success");
      }

      // Paginação
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setConversions(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching conversions:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar seu histórico de conversões.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredConversions = conversions.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.original_filename?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleReuseConversion = () => {
    navigate('/');
    toast({
      title: "Pronto para nova conversão",
      description: "Use o conversor para criar uma nova conversão.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Histórico de Conversões</h1>
              <p className="text-muted-foreground">
                Todas as suas conversões ficam salvas aqui. Reutilize quando precisar.
              </p>
            </div>
            <Button onClick={() => navigate('/')} className="rounded-full">
              <FileDown className="w-4 h-4 mr-2" />
              Nova Conversão
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="glass-premium">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome do arquivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Date Filter */}
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo período</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mês</SelectItem>
                    <SelectItem value="year">Último ano</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="success">Sucesso</SelectItem>
                    <SelectItem value="error">Erro</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={fetchConversions} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-premium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Suas Conversões</CardTitle>
                  <CardDescription>
                    {totalCount} {totalCount === 1 ? 'conversão encontrada' : 'conversões encontradas'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredConversions.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Arquivo</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Tamanho</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredConversions.map((conv) => (
                          <TableRow key={conv.id}>
                            <TableCell className="whitespace-nowrap">
                              {formatDate(conv.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-primary" />
                                <span className="truncate max-w-[200px]">
                                  {conv.original_filename || conv.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {conv.input_format || 'XML'} → {conv.output_format || 'Excel'}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatFileSize(conv.file_size)}</TableCell>
                            <TableCell>
                              {conv.success ? (
                                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Sucesso
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Erro
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleReuseConversion}
                                  title="Reutilizar"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ArrowLeft className="w-4 h-4 mr-1" />
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Próxima
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma conversão encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || dateFilter !== "all" || statusFilter !== "all"
                      ? "Tente ajustar os filtros de busca"
                      : "Comece fazendo sua primeira conversão"}
                  </p>
                  <Button onClick={() => navigate('/')}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Nova Conversão
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Seu histórico é permanente</h3>
                  <p className="text-sm text-muted-foreground">
                    Todas as suas conversões ficam salvas indefinidamente. Você pode consultar, 
                    reutilizar e exportar a qualquer momento. Quanto mais você usa, mais valioso 
                    se torna seu histórico.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default HistoryPage;
