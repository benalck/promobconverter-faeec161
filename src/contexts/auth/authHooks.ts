
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';
import { convertSupabaseUser } from './userUtils';

export const useAuthentication = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  syncUsers: () => Promise<void>,
  addInitialCreditsIfNeeded: (userId: string) => Promise<void>
) => {
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        const currentUser = await convertSupabaseUser(data.user);
        
        if (currentUser.isBanned) {
          throw new Error('Sua conta foi banida. Entre em contato com o administrador.');
        }

        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', currentUser.id);
          
        setUser(currentUser);
        await syncUsers();
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      if (error instanceof Error) {
        if (error.message.includes('banida')) {
          throw error;
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha inválidos');
        } else {
          throw new Error('Falha ao fazer login');
        }
      } else {
        throw new Error('Falha ao fazer login');
      }
    }
  };

  // Fixed infinite type instantiation by specifying the exact return type
  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      // Validar dados antes de prosseguir
      if (!data.name || !data.email || !data.phone || !data.password) {
        return {
          success: false,
          message: 'Todos os campos são obrigatórios'
        };
      }

      // Validar formato do email
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          message: 'Email inválido'
        };
      }

      // Validar formato do telefone
      const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
      if (!phoneRegex.test(data.phone)) {
        return {
          success: false,
          message: 'Telefone inválido. Use o formato (99) 99999-9999'
        };
      }

      const { name, email, phone, password } = data;
      
      // Verificar se o email já está em uso
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (userError && !userError.message.includes('does not exist')) {
        console.error('Error checking existing user:', userError);
        return {
          success: false,
          message: 'Erro ao verificar email existente'
        };
      }

      if (existingUser) {
        return {
          success: false,
          message: 'Este email já está em uso'
        };
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify`,
          data: {
            name,
            phone,
            action: 'confirm_email'
          }
        }
      });

      if (error) {
        if (error.message.includes('email')) {
          return {
            success: false,
            message: 'Este email já está em uso'
          };
        }
        throw error;
      }

      if (!authData.user) {
        return {
          success: false,
          message: 'Erro ao criar usuário'
        };
      }

      // Verificar se é o primeiro usuário (será admin)
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      const isFirstUser = count === 0;
      const userRole = isFirstUser ? 'admin' : 'user';

      // Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name,
            role: userRole,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            is_banned: false,
            email_verified: false,
            credits: 0
          }
        ]);

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        return {
          success: false,
          message: 'Erro ao criar perfil do usuário'
        };
      }

      // Atualizar metadados do usuário
      await supabase.auth.updateUser({
        data: { 
          role: userRole,
          phone
        }
      });

      const newUser = await convertSupabaseUser(authData.user);
      setUser(newUser);
      await syncUsers();

      return {
        success: true,
        message: 'Conta criada com sucesso! Enviamos um email de confirmação.'
      };

    } catch (error) {
      console.error('Erro ao registrar:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Falha ao registrar usuário'
      };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    login,
    register,
    logout
  };
};
