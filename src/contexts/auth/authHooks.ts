import { supabase } from '@/integrations/supabase/client';
import { User } from './types';
import { convertSupabaseUser } from './userUtils';

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

  // Nova implementação da função de registro com timeout
  const register = async (data: RegisterData): Promise<RegisterResponse> => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      // Criar uma Promise com timeout que rejeita após 20 segundos
      const registerWithTimeout = async (): Promise<RegisterResponse> => {
        return new Promise((resolve, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error("Tempo limite excedido ao tentar registrar. Verifique sua conexão e tente novamente."));
          }, 20000); // 20 segundos
          
          // Continuação da função original de registro
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
  
  // Função que realiza o registro separadamente para melhor organização
  const performRegistration = async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      // Validações iniciais
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

      // Criar usuário no Supabase Auth
      let authResponse;
      try {
        authResponse = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Não redirecionar para verificação - marcaremos como verificado automaticamente no trigger SQL
            // NOTA: Confirmação de email completamente desabilitada
            data: {
              name,
              phone,
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

      // Verificar se é o primeiro usuário (será admin)
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      const isFirstUser = count === 0;
      const userRole = isFirstUser ? 'admin' : 'user';

      // Verificar se o perfil já existe antes de tentar criá-lo
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authResponse.data.user.id)
        .maybeSingle();
        
      // Se o perfil já existe, não tente criá-lo novamente
      if (existingProfile) {
        console.log('Perfil já existe, pulando criação:', existingProfile.id);
        
        try {
          const newUser = await convertSupabaseUser(authResponse.data.user);
          setUser(newUser);
          await syncUsers();
        } catch (finalizeError) {
          console.error('Erro ao finalizar registro com perfil existente:', finalizeError);
        }
        
        return {
          success: true,
          message: 'Login realizado com sucesso!'
        };
      }

      // Criar perfil do usuário apenas se não existir
      let profileCreated = false;
      try {
        // Primeiro tenta usar a função RPC personalizada para registro verificado
        const { data: rpcResult, error: rpcError } = await supabase.rpc<'register_user_verified', RegisterUserResponse>(
          'register_user_verified',
          {
            user_id: authResponse.data.user.id,
            user_name: name,
            user_email: email,
            user_role: userRole
          }
        );
        
        if (rpcError) {
          console.error('Erro ao chamar register_user_verified RPC:', rpcError);
          // Tentar a função RPC antiga como fallback
          const { data: oldRpcResult, error: oldRpcError } = await supabase.rpc<'register_user', RegisterUserResponse>(
            'register_user',
            {
              user_id: authResponse.data.user.id,
              user_name: name,
              user_email: email,
              user_role: userRole
            }
          );
          
          if (oldRpcError) {
            console.error('Erro ao chamar register_user RPC:', oldRpcError);
            // Fallback para inserção direta
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: authResponse.data.user.id,
                  name,
                  email,
                  role: userRole,
                  created_at: new Date().toISOString(),
                  last_login: new Date().toISOString(),
                  is_banned: false,
                  email_verified: true,  // Garantir que o email é verificado
                  credits: 10  // 10 créditos iniciais para cada novo usuário
                }
              ]);
              
            if (profileError) {
              console.error('Erro ao criar perfil (fallback):', profileError);
              // Se o erro for de chave duplicada, consideramos como sucesso
              if (profileError.message.includes('duplicate key') || profileError.message.includes('violates unique constraint')) {
                console.log('Perfil já existe (inserção direta detectou), considerando sucesso');
                profileCreated = true;
              } else {
                return {
                  success: false,
                  message: 'Erro ao criar perfil do usuário: ' + profileError.message
                };
              }
            } else {
              profileCreated = true;
            }
          } else {
            console.log('RPC register_user resultado:', oldRpcResult);
            profileCreated = oldRpcResult?.success || false;
            
            if (!profileCreated) {
              return {
                success: false,
                message: oldRpcResult?.message || 'Erro ao criar perfil do usuário'
              };
            }
            
            // Atualizar verificação de email manualmente
            await supabase
              .from('profiles')
              .update({ email_verified: true })
              .eq('id', authResponse.data.user.id);
          }
        } else {
          console.log('RPC register_user_verified resultado:', rpcResult);
          profileCreated = rpcResult?.success || false;
          
          if (!profileCreated) {
            return {
              success: false,
              message: rpcResult?.message || 'Erro ao criar perfil do usuário'
            };
          }
        }
      } catch (profileErr) {
        console.error('Exceção ao criar perfil:', profileErr);
        // Se for um erro de chave duplicada, consideramos como sucesso
        if (profileErr instanceof Error && 
            (profileErr.message.includes('duplicate key') || 
             profileErr.message.includes('violates unique constraint'))) {
          console.log('Perfil já existe (exceção detectou), considerando sucesso');
          profileCreated = true;
        } else {
          return {
            success: false,
            message: 'Erro ao criar perfil do usuário: ' + (profileErr instanceof Error ? profileErr.message : 'Erro desconhecido')
          };
        }
      }
      
      if (!profileCreated) {
        return {
          success: false,
          message: 'Falha ao criar perfil do usuário'
        };
      }

      // Atualizar metadados do usuário
      try {
        await supabase.auth.updateUser({
          data: { 
            role: userRole,
            phone
          }
        });
      } catch (updateError) {
        console.error('Erro ao atualizar metadados do usuário:', updateError);
        // Continuar mesmo se falhar a atualização dos metadados
      }

      try {
        const newUser = await convertSupabaseUser(authResponse.data.user);
        setUser(newUser);
        await syncUsers();
      } catch (finalizeError) {
        console.error('Erro ao finalizar registro:', finalizeError);
        // Continuar mesmo se falhar a conversão do usuário
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
