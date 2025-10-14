// Admin.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User } from '@/contexts/auth/types';
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome precisa ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  role: z.enum(['admin', 'user', 'ceo']),
  isBanned: z.boolean().default(false),
  credits: z.number().optional(),
  emailVerified: z.boolean().default(false),
  activePlan: z.string().optional(),
  planExpiryDate: z.string().optional(),
})

const Admin = () => {
  const { user, users, getAllUsers, updateUser, deleteUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    await getAllUsers();
    setLoading(false);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      toast({
        title: "Usuário deletado com sucesso.",
      })
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Erro ao deletar usuário.",
        description: "Por favor, tente novamente.",
      })
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: selectedUser?.name || "",
      email: selectedUser?.email || "",
      role: selectedUser?.role || 'user',
      isBanned: selectedUser?.isBanned || false,
      credits: selectedUser?.credits || 0,
      emailVerified: selectedUser?.emailVerified || false,
      activePlan: selectedUser?.activePlan || '',
      planExpiryDate: selectedUser?.planExpiryDate || '',
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (selectedUser) {
      form.reset({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        isBanned: selectedUser.isBanned || false,
        credits: selectedUser.credits || 0,
        emailVerified: selectedUser.emailVerified || false,
        activePlan: selectedUser.activePlan || '',
        planExpiryDate: selectedUser.planExpiryDate || '',
      });
    }
  }, [selectedUser, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser.id, values);
      toast({
        title: "Usuário atualizado com sucesso.",
      })
      fetchUsers(); // Refresh user list
      setSelectedUser(null); // Close the dialog
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário.",
        description: "Por favor, tente novamente.",
      })
    }
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Painel de Administração</h1>
      <Table>
        <TableCaption>Lista de usuários</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(user)}>
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Editar usuário</DialogTitle>
                      <DialogDescription>
                        Faça as alterações necessárias aqui. Clique em salvar quando terminar.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="ceo">CEO</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="isBanned"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Banido</FormLabel>
                                <FormDescription>
                                  Banir este usuário impede o acesso.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="credits"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Créditos</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Créditos" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emailVerified"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Email Verificado</FormLabel>
                                <FormDescription>
                                  Marque se o email do usuário foi verificado.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="activePlan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plano Ativo</FormLabel>
                              <FormControl>
                                <Input placeholder="Plano Ativo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="planExpiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Expiração do Plano</FormLabel>
                              <FormControl>
                                <Input placeholder="Data de Expiração do Plano" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">Salvar</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                  Deletar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Admin;
