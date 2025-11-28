import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! 👋 Sou seu assistente de IA. Como posso ajudar com a conversão de XML hoje?",
    },
  ]);
  const [input, setInput] = useState("");

  const quickReplies = [
    "Como converter XML?",
    "Calcular custos",
    "Ver tutorial",
    "Ajuda com plano de corte",
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Simulated AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "como converter xml": "Para converter XML: 1) Faça upload do arquivo XML Promob, 2) Aguarde o processamento automático, 3) Baixe o Excel formatado com planos de corte otimizados.",
        "calcular custos": "No dashboard você pode configurar preços de materiais e fitas de borda. O sistema calculará automaticamente os custos totais do projeto.",
        "ver tutorial": "Acesse a seção de tutorial na página inicial para um guia passo a passo completo de como usar o sistema.",
        "ajuda com plano de corte": "O plano de corte é gerado automaticamente com otimização inteligente para minimizar desperdício de material. Você pode visualizar cada chapa e suas peças no dashboard.",
      };

      const key = input.toLowerCase();
      const response = Object.entries(responses).find(([k]) => key.includes(k))?.[1] || 
        "Entendo sua dúvida. Para mais informações detalhadas, consulte nossa documentação ou entre em contato com o suporte.";

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    }, 800);

    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:scale-110 transition-transform relative overflow-hidden group"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Bot className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-primary/50 animate-ping" />
        </Button>
      </motion.div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-28 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="glass-premium shadow-deep overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Assistente IA</h3>
                    <p className="text-xs text-white/80">Sempre online</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="h-96 p-4 bg-background/50">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-primary to-secondary text-white"
                            : "glass-premium"
                        }`}
                      >
                        {message.content}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              {/* Quick replies */}
              <div className="p-3 border-t bg-background/30">
                <div className="flex flex-wrap gap-2 mb-3">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInput(reply);
                        handleSend();
                      }}
                      className="text-xs rounded-full"
                    >
                      {reply}
                    </Button>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Digite sua pergunta..."
                    className="flex-1 rounded-full bg-background"
                  />
                  <Button
                    onClick={handleSend}
                    size="icon"
                    className="rounded-full bg-gradient-to-r from-primary to-secondary text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
