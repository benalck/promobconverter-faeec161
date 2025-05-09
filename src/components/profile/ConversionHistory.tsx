
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Download, FileCheck, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Conversion {
  id: string;
  user_id: string;
  filename: string;
  created_at: string;
  file_size: number;
  status: 'success' | 'error';
  input_format: string;
  output_format: string;
  error_message?: string;
  download_url?: string;
}

interface ConversionHistoryProps {
  userId: string;
}

export default function ConversionHistory({ userId }: ConversionHistoryProps) {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchConversions();
  }, [userId, currentPage]);

  const fetchConversions = async () => {
    setLoading(true);
    
    try {
      // Get count for pagination
      const { count } = await supabase
        .from('conversions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      
      // Get conversions with pagination
      const { data, error } = await supabase
        .from('conversions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      
      if (error) throw error;
      
      if (data) {
        // Map supabase data to our Conversion interface
        const mappedConversions: Conversion[] = data.map(item => ({
          id: item.id,
          user_id: item.user_id,
          filename: item.name || item.original_filename || "Untitled",
          created_at: item.created_at,
          file_size: item.file_size || 0,
          status: item.success ? 'success' : 'error',
          input_format: item.input_format || "",
          output_format: item.output_format || "",
          error_message: item.error_message || undefined,
          download_url: item.file_content ? `/api/download/${item.id}` : undefined
        }));
        
        setConversions(mappedConversions);
      } else {
        setConversions([]);
      }
    } catch (error) {
      console.error('Error fetching conversion history:', error);
      setConversions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDownload = (downloadUrl: string) => {
    // Implement download logic
    window.open(downloadUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          <CardTitle>Histórico de Conversões</CardTitle>
        </div>
        <CardDescription>
          Arquivos que você converteu recentemente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-center">
              <div className="h-6 w-32 bg-muted rounded mb-4 mx-auto"></div>
              <div className="h-4 w-48 bg-muted rounded mx-auto"></div>
            </div>
          </div>
        ) : conversions.length > 0 ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arquivo</TableHead>
                    <TableHead className="hidden sm:table-cell">Data</TableHead>
                    <TableHead className="hidden md:table-cell">Tamanho</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversions.map((conversion) => (
                    <TableRow key={conversion.id}>
                      <TableCell>
                        <div className="font-medium truncate max-w-[150px] md:max-w-[200px]">
                          {conversion.filename}
                        </div>
                        <div className="text-xs text-muted-foreground md:hidden">
                          {format(new Date(conversion.created_at), "dd/MM/yy HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {format(new Date(conversion.created_at), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatFileSize(conversion.file_size)}
                      </TableCell>
                      <TableCell>
                        {conversion.status === 'success' ? (
                          <Badge variant="success" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <FileCheck className="h-3 w-3 mr-1" /> Concluído
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            <AlertCircle className="h-3 w-3 mr-1" /> Falha
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {conversion.status === 'success' && conversion.download_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownload(conversion.download_url!)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Baixar</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">Nenhuma conversão encontrada</h3>
            <p className="text-sm text-muted-foreground">
              Arquivos que você converter aparecerão aqui.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
