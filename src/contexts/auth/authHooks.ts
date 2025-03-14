
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';
import { convertSupabaseUser } from './userUtils';

interface VerificationCodeResponse {
  id: string;
  user_id: string;
  email: string;
  code: string;
  created_at: string;
}

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

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email_verified')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.error('Erro ao verificar status do email:', profileError);
        } else if (profileData && profileData.email_verified === false) {
          throw new Error('Por favor, verifique seu email antes de fazer login.');
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
        } else if (error.message.includes('verifique seu email')) {
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

  const register = async (name: string, email: string, password: string): Promise<{email: string, name: string} | undefined> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          },
          emailRedirectTo: undefined
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Erro ao criar usuário');
      }
      
      console.log('Usuário criado:', data.user.id);

      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      const isFirstUser = count === 0 || countError;
      const userRole = isFirstUser ? 'admin' : 'user';
      
      console.log(`Usuário será registrado com role: ${userRole}, isFirstUser: ${isFirstUser}`);

      try {
        await supabase.auth.updateUser({
          data: { 
            role: userRole 
          }
        });
        
        console.log(`Usuário registrado com role: ${userRole}`);
      } catch (roleError) {
        console.error('Erro ao definir role nos metadados:', roleError);
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Código de verificação gerado: ${verificationCode}`);

      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const { error: codeError } = await supabase.rpc<void, {
          p_user_id: string;
          p_email: string;
          p_code: string;
        }>('insert_verification_code', {
          p_user_id: data.user.id,
          p_email: email,
          p_code: verificationCode
        });

        if (codeError) {
          console.error('Erro ao salvar código de verificação:', codeError);
          throw new Error('Erro ao gerar código de verificação');
        }
      } catch (insertError) {
        console.error('Erro ao inserir código:', insertError);
        throw new Error('Erro ao salvar código de verificação');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email,
          name,
          code: verificationCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao enviar email:', errorData);
        throw new Error('Erro ao enviar email de verificação');
      }

      console.log('Email de verificação enviado com sucesso');
      return { email, name };

    } catch (error) {
      console.error('Erro ao registrar:', error);
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          throw new Error('Este email já está em uso');
        } else if (error.message.includes('violates row-level security policy')) {
          console.log('Aviso de RLS ignorado - o trigger deve criar o perfil');
        } else {
          throw new Error('Falha ao registrar usuário');
        }
      } else {
        throw new Error('Falha ao registrar usuário');
      }
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
