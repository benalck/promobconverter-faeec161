import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BannedMessage from './BannedMessage';

interface BanCheckProps {
  children: React.ReactNode;
}

export default function BanCheck({ children }: BanCheckProps) {
  const { user, logout } = useAuth();

  useEffect(() => {
    // Verificar se o usuário está banido
    if (user?.isBanned) {
      // Se estiver banido, fazer logout
      logout();
    }
  }, [user, logout]);

  // Se o usuário estiver banido, mostrar mensagem
  if (user?.isBanned) {
    return <BannedMessage />;
  }

  // Se não estiver banido, renderizar o conteúdo normalmente
  return <>{children}</>;
} 