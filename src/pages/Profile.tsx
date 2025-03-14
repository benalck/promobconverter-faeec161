
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Você não está logado</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/login')}>Ir para o Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Perfil do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Nome</p>
              <p className="text-lg font-semibold">{user.name || 'Nome não informado'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Função</p>
              <p className="text-lg font-semibold capitalize">{user.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Créditos</p>
              <p className="text-lg font-semibold">{user.credits}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Data de cadastro</p>
              <p className="text-lg font-semibold">
                {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button variant="destructive" onClick={handleLogout}>
              Sair da conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
