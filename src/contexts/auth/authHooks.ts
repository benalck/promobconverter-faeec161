
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

        // Check if email is verified in profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email_verified')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.error('Erro ao verificar status do email:', profileError);
        } else if (profileData && !profileData.email_verified) {
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

  const register = async (name: string, email: string, password: string) => {
    try {
      // Step 1: Create the user in Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          },
          // Disable email confirmation through Supabase
          emailRedirectTo: undefined
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Erro ao criar usuário');
      }
      
      console.log('Usuário criado:', data.user.id);

      // Step 2: Determine if this is the first user (admin)
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      const isFirstUser = count === 0 || countError;
      const userRole = isFirstUser ? 'admin' : 'user';
      
      console.log(`Usuário será registrado com role: ${userRole}, isFirstUser: ${isFirstUser}`);

      // Step 3: Update auth metadata
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

      // Step 4: Generate a 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Código de verificação gerado: ${verificationCode}`);

      // Wait for the profile to be created by the trigger
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 5: Store the verification code in Supabase
      const { error: codeError } = await supabase
        .from('verification_codes')
        .insert([
          {
            user_id: data.user.id,
            email,
            code: verificationCode,
          }
        ]);

      if (codeError) {
        console.error('Erro ao salvar código de verificação:', codeError);
        throw new Error('Erro ao gerar código de verificação');
      }

      // Step 6: Send email with verification code
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
          // This error means the RLS policy is preventing the insert
          // We'll just log it and continue - profile creation should be handled by a trigger
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
