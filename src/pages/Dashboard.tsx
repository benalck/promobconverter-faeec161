
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FileDown, Clock, Calendar, BarChart2, FileSpreadsheet, Plus,
  LayoutDashboard, Settings, User, LogOut, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import ConverterForm from "@/components/ConverterForm";
import UserCredits from "@/components/UserCredits";
import { Badge } from "@/components/ui/badge";

// Tipo para mock de conversões
interface Conversion {
  id: string;
  fileName: string;
  createdAt: Date;
  status: 'completed' | 'failed';
  fileSize: string;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [isNewConversion, setIsNewConversion] = useState(false);

  // Mock de dados de conversão
  useEffect(() => {
    const mockConversions: Conversion[] = [
      {
        id: "1",
        fileName: "projeto_cozinha.xml",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
        status: 'completed',
        fileSize: "1.2 MB"
      },
      {
        id: "2",
        fileName: "sala_estar.xml",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
        status: 'completed',
        fileSize: "0.7 MB"
      },
      {
        id: "3",
        fileName: "escritorio_cliente.xml",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 dias atrás
        status: 'failed',
        fileSize: "2.1 MB"
      },
      {
        id: "4",
        fileName: "closet_master.xml",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 dias atrás
        status: 'completed',
        fileSize: "1.5 MB"
      }
    ];

    setConversions(mockConversions);
  }, []);

  // Formato de data legível
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Atalhos para estatísticas
  const totalConversions = conversions.length;
  const successfulConversions = conversions.filter(c => c.status === 'completed').length;
  const conversionRate = totalConversions > 0 
    ? Math.round((successfulConversions / totalConversions) * 100) 
    : 0;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col">
        <div className="p-4 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
          <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="font-display font-bold text-gray-900 dark:text-white">PromobConverter</span>
        </div>
        
        <div className="flex flex-col flex-1 py-6 px-4">
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-400 uppercase mb-2 px-3">Menu</p>
            <nav className="space-y-1">
              <Link to="/dashboard" className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              <button onClick={() => setIsNewConversion(true)} className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
                <FileDown className="mr-3 h-5 w-5" />
                Converter XML
              </button>
              <Link to="/profile" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
                <User className="mr-3 h-5 w-5" />
                Meu Perfil
              </Link>
              <Link to="/settings" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
                <Settings className="mr-3 h-5 w-5" />
                Configurações
              </Link>
            </nav>
          </div>
          
          <div className="mt-auto">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Seus créditos</h3>
              <UserCredits />
              <Button variant="gradient" size="sm" className="w-full mt-3">
                <Plus className="mr-1 h-4 w-4" />
                Adicionar créditos
              </Button>
            </div>
            
            <button
              onClick={logout}
              className="mt-6 w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center md:hidden">
            <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-display font-bold text-gray-900 dark:text-white ml-2">PromobConverter</span>
          </div>
          
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  Menu
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setIsNewConversion(true)}>
                  <FileDown className="mr-2 h-4 w-4" />
                  <span>Converter XML</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  {user?.name || "Usuário"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-6">
          {isNewConversion ? (
            <div className="max-w-3xl mx-auto animate-fade-in">
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setIsNewConversion(false)}
                  className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nova conversão</h1>
              </div>
              
              <ConverterForm />
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Bem-vindo, {user?.name?.split(' ')[0] || "Usuário"}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Gerencie suas conversões e acesse todas as funcionalidades do PromobConverter.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500 dark:text-gray-400 font-normal">Total de conversões</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-3xl font-bold">{totalConversions}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500 dark:text-gray-400 font-normal">Taxa de sucesso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <BarChart2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-3xl font-bold">{conversionRate}%</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500 dark:text-gray-400 font-normal">Última conversão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="text-base font-medium">{conversions[0]?.createdAt ? formatDate(conversions[0].createdAt) : '-'}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Histórico de conversões</h2>
                
                <Button onClick={() => setIsNewConversion(true)} variant="gradient" className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova conversão
                </Button>
              </div>
              
              <Tabs defaultValue="all">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="completed">Concluídas</TabsTrigger>
                  <TabsTrigger value="failed">Com erro</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Arquivo</th>
                              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Data</th>
                              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Tamanho</th>
                              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {conversions.map((conversion) => (
                              <tr key={conversion.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <FileSpreadsheet className="h-5 w-5 text-gray-400 mr-2" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{conversion.fileName}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                    {formatDate(conversion.createdAt)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{conversion.fileSize}</td>
                                <td className="px-6 py-4">
                                  {conversion.status === 'completed' ? (
                                    <Badge variant="success">Concluído</Badge>
                                  ) : (
                                    <Badge variant="destructive">Erro</Badge>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Button variant="ghost" size="sm">
                                    <FileDown className="h-4 w-4" />
                                    <span className="sr-only md:not-sr-only md:ml-2">Download</span>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="completed">
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Arquivo</th>
                              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Data</th>
                              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Tamanho</th>
                              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {conversions
                              .filter(c => c.status === 'completed')
                              .map((conversion) => (
                                <tr key={conversion.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <FileSpreadsheet className="h-5 w-5 text-gray-400 mr-2" />
                                      <span className="font-medium text-gray-700 dark:text-gray-300">{conversion.fileName}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                      {formatDate(conversion.createdAt)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{conversion.fileSize}</td>
                                  <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm">
                                      <FileDown className="h-4 w-4" />
                                      <span className="sr-only md:not-sr-only md:ml-2">Download</span>
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="failed">
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Arquivo</th>
                              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Data</th>
                              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Tamanho</th>
                              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {conversions
                              .filter(c => c.status === 'failed')
                              .map((conversion) => (
                                <tr key={conversion.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <FileSpreadsheet className="h-5 w-5 text-gray-400 mr-2" />
                                      <span className="font-medium text-gray-700 dark:text-gray-300">{conversion.fileName}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                      {formatDate(conversion.createdAt)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{conversion.fileSize}</td>
                                  <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm">
                                      Tentar novamente
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
