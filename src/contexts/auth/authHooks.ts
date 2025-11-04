import { supabase } from '@/integrations/supabase/client';
import { User } from './types';
import { convertSupabaseUser } from './userUtils';
import { logAdminAction } from '@/utils/adminLogger'; // Import the new logger

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

// Interface para resposta da RPC register_user_verified
interface RegisterUserResponse {
  success: boolean;
  message: string;
}

// Função para tratamento de erro padrão
const handleDefaultError = (error: unknown): string => {
  console.error("Erro capturado:", error);
  
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error);
    } catch (e) {
      return "Erro desconhecido: " + (Object.prototype.toString.call(error));
    }
  }
  
  return "Ocorreu um erro desconhecido";
};

export const useAuthentication = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  syncUsers: () => Promise<void>
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

  // Simplified registration function that ensures profiles are created
  const register = async (data: RegisterData): Promise<RegisterResponse> => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      // Create a Promise with timeout that rejects after 20 seconds
      const registerWithTimeout = async (): Promise<RegisterResponse> => {
        return new Promise((resolve, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error("Tempo limite excedido ao tentar registrar. Verifique sua conexão e tente novamente."));
          }, 20000); // 20 seconds
          
          // Continue with the original registration function
          performRegistration(data)
            .then(resolve)
            .catch(reject)
            .finally(() => {
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
              }
            });
        });
      };
      
      return await registerWithTimeout();
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      console.error("Erro geral no registro com timeout:", error);
      return {
        success: false,
        message: handleDefaultError(error)
      };
    }
  };
  
  // Modified performRegistration to use the RPC function register_user_verified
  const performRegistration = async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      // Initial validations
      if (!data.name || !data.email || !data.phone || !data.password) {
        return {
          success: false,
          message: 'Todos os campos são obrigatórios'
        };
      }

      // Enhanced email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          message: 'Email inválido'
        };
      }

      // Validate email length
      if (data.email.length > 255) {
        return {
          success: false,
          message: 'Email muito longo'
        };
      }

      // Validate name length and sanitize
      const sanitizedName = data.name.trim().substring(0, 100);
      if (sanitizedName.length === 0) {
        return {
          success: false,
          message: 'Nome não pode estar vazio'
        };
      }
      
      // Prevent HTML/script injection in name
      if (/<[^>]*>/g.test(sanitizedName)) {
        return {
          success: false,
          message: 'Nome contém caracteres inválidos'
        };
      }

      // Validate phone format
      const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
      if (!phoneRegex.test(data.phone)) {
        return {
          success: false,
          message: 'Telefone inválido. Use o formato (99) 99999-9999'
        };
      }
      
      // Validate password strength
      if (data.password.length < 8) {
        return {
          success: false,
          message: 'Senha deve ter no mínimo 8 caracteres'
        };
      }

      const { email, phone, password } = data;
      const name = sanitizedName;
      
      // Check if email is already in use
      try {
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
      } catch (checkError) {
        console.error('Exceção ao verificar email existente:', checkError);
        return {
          success: false,
          message: 'Erro ao verificar disponibilidade do email: ' + handleDefaultError(checkError)
        };
      }

      // Create user in Supabase Auth
      let authResponse;
      try {
        authResponse = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone, // Pass phone to user_metadata
              action: 'confirm_email'
            }
          }
        });
        
        if (authResponse.error) {
          console.error('Erro na criação do usuário:', authResponse.error);
          if (authResponse.error.message.includes('email')) {
            return {
              success: false,
              message: 'Este email já está em uso'
            };
          }
          return {
            success: false,
            message: `Erro na criação do usuário: ${authResponse.error.message}`
          };
        }

        if (!authResponse.data.user) {
          return {
            success: false,
            message: 'Erro ao criar usuário: Resposta vazia do servidor'
          };
        }
      } catch (authError) {
        console.error('Exceção na criação do usuário:', authError);
        return {
          success: false,
          message: 'Falha ao criar usuário no sistema de autenticação: ' + handleDefaultError(authError)
        };
      }

      // Create profile using the RPC function
      try {
        // First, count the users to determine if this is the first user (admin)
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        const isFirstUser = count === 0;
        const userRole = isFirstUser ? 'ceo' : 'user'; // First user is CEO
        
        // Call the register_user_verified RPC function
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
          'register_user_verified',
          {
            user_id: authResponse.data.user.id,
            user_name: name,
            user_email: email,
            user_role: userRole
          }
        );
        
        if (rpcError) {
          console.error('Erro ao registrar usuário via RPC:', rpcError);
          
          // Fallback to direct insertion if the RPC fails
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authResponse.data.user.id,
              name,
              email,
              phone, // Insert phone into profiles table
              role: userRole,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
              is_banned: false,
              email_verified: true
            });
            
          if (insertError) {
            console.error('Falha no fallback de inserção direta:', insertError);
            return {
              success: false,
              message: 'Erro ao criar perfil do usuário: ' + insertError.message
            };
          }
        }
      } catch (profileErr) {
        console.error('Erro ao criar perfil:', profileErr);
        return {
          success: false,
          message: 'Erro ao criar perfil do usuário: ' + handleDefaultError(profileErr)
        };
      }

      try {
        const newUser = await convertSupabaseUser(authResponse.data.user);
        setUser(newUser);
        await syncUsers();
        await logAdminAction('new_user_registration', newUser.id, { email: newUser.email, role: newUser.role });
      } catch (finalizeError) {
        console.error('Erro ao finalizar registro:', finalizeError);
      }

      return {
        success: true,
        message: 'Conta criada com sucesso!'
      };

    } catch (error) {
      console.error('Erro completo no processo de registro:', error);
      return {
        success: false,
        message: handleDefaultError(error)
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