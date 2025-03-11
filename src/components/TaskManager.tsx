
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ConversionsList from "./ConversionsList";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
}

export default function TaskManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState("tasks");

  // Buscar tarefas do usuário
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        if (!user) return;

        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTasks(data || []);
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
        toast({
          title: "Erro ao carregar tarefas",
          description: "Não foi possível carregar suas tarefas.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user, toast]);

  // Adicionar nova tarefa
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title) {
      toast({
        title: "Campo obrigatório",
        description: "O título da tarefa é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          title: newTask.title,
          description: newTask.description || null,
          status: newTask.status,
          priority: newTask.priority,
        })
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        setTasks([data[0], ...tasks]);
        setNewTask({
          title: "",
          description: "",
          status: "pending",
          priority: "medium",
        });
        toast({
          title: "Tarefa adicionada",
          description: "Sua tarefa foi adicionada com sucesso.",
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      toast({
        title: "Erro ao adicionar tarefa",
        description: "Não foi possível adicionar sua tarefa.",
        variant: "destructive",
      });
    }
  };

  // Atualizar tarefa
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTask || !editingTask.title) {
      toast({
        title: "Campo obrigatório",
        description: "O título da tarefa é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
          priority: editingTask.priority,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingTask.id);

      if (error) throw error;
      
      // Atualizar a lista de tarefas
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...task, ...editingTask, updated_at: new Date().toISOString() } : task
      ));
      
      setEditingTask(null);
      
      toast({
        title: "Tarefa atualizada",
        description: "Sua tarefa foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      toast({
        title: "Erro ao atualizar tarefa",
        description: "Não foi possível atualizar sua tarefa.",
        variant: "destructive",
      });
    }
  };

  // Excluir tarefa
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
      
      // Atualizar a lista de tarefas
      setTasks(tasks.filter(task => task.id !== taskId));
      
      toast({
        title: "Tarefa excluída",
        description: "Sua tarefa foi excluída com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      toast({
        title: "Erro ao excluir tarefa",
        description: "Não foi possível excluir sua tarefa.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Gerenciador de Tarefas</h1>
      
      <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="tasks">Minhas Tarefas</TabsTrigger>
          <TabsTrigger value="conversions">Minhas Conversões</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-8">
          {/* Formulário para adicionar nova tarefa */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</CardTitle>
              <CardDescription>
                {editingTask 
                  ? "Atualize os detalhes da tarefa selecionada" 
                  : "Preencha os dados abaixo para adicionar uma nova tarefa"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingTask ? handleUpdateTask : handleAddTask} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Título</label>
                  <Input
                    id="title"
                    value={editingTask ? editingTask.title : newTask.title}
                    onChange={(e) => editingTask 
                      ? setEditingTask({ ...editingTask, title: e.target.value })
                      : setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="Digite o título da tarefa"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Descrição</label>
                  <Textarea
                    id="description"
                    value={editingTask ? editingTask.description || "" : newTask.description}
                    onChange={(e) => editingTask 
                      ? setEditingTask({ ...editingTask, description: e.target.value })
                      : setNewTask({ ...newTask, description: e.target.value })
                    }
                    placeholder="Digite a descrição da tarefa"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <Select
                      value={editingTask ? editingTask.status || "pending" : newTask.status}
                      onValueChange={(value) => editingTask 
                        ? setEditingTask({ ...editingTask, status: value })
                        : setNewTask({ ...newTask, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in-progress">Em Progresso</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Prioridade</label>
                    <Select
                      value={editingTask ? editingTask.priority || "medium" : newTask.priority}
                      onValueChange={(value) => editingTask 
                        ? setEditingTask({ ...editingTask, priority: value })
                        : setNewTask({ ...newTask, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button type="submit">
                    {editingTask ? "Atualizar Tarefa" : "Adicionar Tarefa"}
                  </Button>
                  
                  {editingTask && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setEditingTask(null)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Lista de tarefas */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Lista de Tarefas</h2>
            
            {isLoading ? (
              // Esqueleto de carregamento
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="w-full">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-3 w-[400px]" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-gray-500 p-4 text-center">
                Você ainda não possui tarefas cadastradas.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className={`p-1 ${
                        task.status === 'completed' 
                          ? 'bg-green-500' 
                          : task.status === 'in-progress' 
                            ? 'bg-yellow-500' 
                            : 'bg-blue-500'
                      }`} />
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold">{task.title}</h3>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTask(task)}
                              className="h-8 w-8 p-0"
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="h-8 w-8 p-0 text-red-500"
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600">{task.description}</p>
                        )}
                        
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full ${
                              task.priority === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : task.priority === 'medium' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                            }`}>
                              {task.priority === 'high' 
                                ? 'Alta' 
                                : task.priority === 'medium' 
                                  ? 'Média' 
                                  : 'Baixa'}
                            </span>
                            <span className={`px-2 py-1 rounded-full ${
                              task.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : task.status === 'in-progress' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {task.status === 'completed' 
                                ? 'Concluída' 
                                : task.status === 'in-progress' 
                                  ? 'Em Progresso' 
                                  : 'Pendente'}
                            </span>
                          </div>
                          <span className="text-gray-500">
                            {new Date(task.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="conversions">
          <ConversionsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
