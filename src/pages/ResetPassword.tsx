"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, XCircle, Loader2, CheckCircle } from "lucide-react";
import { toast as sonnerToast } from "sonner";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    const setupSessionFromUrl = async () => {
      try {
        setIsValidating(true);

        // Extrai parâmetros do hash (#) e query (?)
        const hashString = window.location.hash.substring(1);
        const searchString = window.location.search.substring(1);
        const hashParams = new URLSearchParams(hashString);
        const searchParams = new URLSearchParams(searchString);
        
        // Função auxiliar para buscar parâmetros em ambos os lugares
        const getParam = (key: string) => hashParams.get(key) || searchParams.get(key);

        // Detecta todos os formatos possíveis de autenticação do Supabase
        const type = getParam("type");
        const code = getParam("code");
        const token_hash = getParam("token_hash");
        const token = getParam("token");
        const access_token = getParam("access_token");
        const refresh_token = getParam("refresh_token");

        console.log("Parâmetros detectados:", { type, code, token_hash, token, access_token, refresh_token });

        let sessionEstablished = false;

        // Estratégia 1: PKCE flow com code (mais moderno)
        if (code) {
          console.log("Tentando exchangeCodeForSession...");
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data.session) {
            console.log("✅ Sessão criada via exchangeCodeForSession");
            sessionEstablished = true;
          } else {
            console.warn("exchangeCodeForSession falhou:", error);
          }
        }

        // Estratégia 2: Token hash com type=recovery (OTP)
        if (!sessionEstablished && type === "recovery" && (token_hash || token)) {
          console.log("Tentando verifyOtp...");
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token_hash || token || "",
            type: "recovery",
          });
          if (!error && data.session) {
            console.log("✅ Sessão criada via verifyOtp");
            sessionEstablished = true;
          } else {
            console.warn("verifyOtp falhou:", error);
          }
        }

        // Estratégia 3: Access/refresh tokens (fluxo legado)
        if (!sessionEstablished && access_token && refresh_token) {
          console.log("Tentando setSession...");
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (!error && data.session) {
            console.log("✅ Sessão criada via setSession");
            sessionEstablished = true;
          } else {
            console.warn("setSession falhou:", error);
          }
        }

        if (sessionEstablished) {
          setIsSessionValid(true);
          setMessage("");
          sonnerToast.success("Link validado", {
            description: "Agora você pode redefinir sua senha.",
          });

          // Converte hash em query string e limpa a URL
          if (hashString) {
            const cleanUrl = `${window.location.pathname}?${hashString}`;
            window.history.replaceState(null, "", cleanUrl);
            
            // Remove query string após processamento
            setTimeout(() => {
              window.history.replaceState(null, "", window.location.pathname);
            }, 500);
          }
        } else {
          throw new Error("Nenhuma estratégia de autenticação funcionou");
        }
      } catch (error) {
        console.error("❌ Erro ao validar link de redefinição:", error);
        sonnerToast.error("Link inválido ou expirado", {
          description: "Por favor, solicite um novo link de redefinição.",
        });
        setMessage("Link de redefinição inválido ou expirado.");
        setIsSessionValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    setupSessionFromUrl();
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "Senha deve ter pelo menos 8 caracteres";
    if (!/[A-Z]/.test(password)) return "Senha deve conter pelo menos uma letra maiúscula";
    if (!/[a-z]/.test(password)) return "Senha deve conter pelo menos uma letra minúscula";
    if (!/[0-9]/.test(password)) return "Senha deve conter pelo menos um número";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Senha deve conter pelo menos um caractere especial";
    }
    return null;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Validação de campos vazios
    if (!newPassword.trim() || !confirmPassword.trim()) {
      sonnerToast.error("Campos obrigatórios", {
        description: "Preencha ambos os campos de senha.",
      });
      return;
    }

    // Validação de confirmação
    if (newPassword !== confirmPassword) {
      sonnerToast.error("Senhas não coincidem", {
        description: "As senhas digitadas não são iguais.",
      });
      return;
    }

    // Validação de força da senha
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      sonnerToast.error("Senha fraca", {
        description: passwordError,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword.trim() 
      });

      if (error) {
        console.error("Erro ao redefinir senha:", error);
        sonnerToast.error("Erro ao redefinir senha", {
          description: error.message || "Tente novamente mais tarde.",
        });
      } else {
        sonnerToast.success("✅ Senha redefinida com sucesso!", {
          description: "Redirecionando para o login em 3 segundos...",
          duration: 3000,
        });
        
        // Aguarda 3 segundos e redireciona
        setTimeout(() => {
          navigate("/register?isLoginMode=true");
        }, 3000);
      }
    } catch (err) {
      console.error("Erro inesperado ao redefinir senha:", err);
      sonnerToast.error("Erro inesperado", {
        description: "Ocorreu um problema. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tela de carregamento enquanto valida o token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-center text-muted-foreground font-medium">
                Validando link de redefinição...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-foreground">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-base">
            {isSessionValid
              ? "Escolha uma senha forte para sua conta."
              : "Link de redefinição inválido ou expirado."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {!isSessionValid ? (
            <div className="flex flex-col items-center space-y-6 py-4">
              <div className="rounded-full bg-red-50 p-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-muted-foreground font-medium">{message}</p>
                <p className="text-sm text-muted-foreground">
                  Por favor, solicite um novo link de redefinição.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/register?isLoginMode=true")} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Voltar para o Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nova senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="password"
                      placeholder="Digite sua nova senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Confirmar senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="password"
                      placeholder="Digite novamente sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 font-medium mb-1">
                  Requisitos de senha:
                </p>
                <ul className="text-xs text-blue-700 space-y-0.5">
                  <li>• Mínimo de 8 caracteres</li>
                  <li>• Pelo menos 1 letra maiúscula e 1 minúscula</li>
                  <li>• Pelo menos 1 número e 1 caractere especial</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-semibold"
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando nova senha...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Salvar nova senha
                  </span>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}