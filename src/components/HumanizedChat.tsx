import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2, Maximize2, User, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";

// Tipos para as mensagens do chat
type MessageType = 'user' | 'attendant' | 'system';

interface ChatMessage {
  id: string;
  type: MessageType;
  text: string;
  timestamp: Date;
  senderName?: string;
}

export interface ContactForm {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'viewed' | 'replied';
}

// Horário de funcionamento do atendimento
const WORKING_HOURS = {
  start: 8, // 8:00
  end: 18,  // 18:00
};

// Dias da semana de funcionamento (0 = domingo, 6 = sábado)
const WORKING_DAYS = [1, 2, 3, 4, 5]; // Segunda a sexta

// Simular atendentes disponíveis
const ATTENDANTS = [
  { id: 1, name: "Carlos", isAvailable: true },
  { id: 2, name: "Mariana", isAvailable: true },
  { id: 3, name: "Rafael", isAvailable: false },
];

// Chave para armazenamento local
const CONTACT_STORAGE_KEY = 'promobconverter-contact-forms';

function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Função para salvar os contatos no localStorage
export const saveContactForm = (form: Omit<ContactForm, 'id' | 'timestamp' | 'status'>) => {
  // Pegar contatos existentes ou inicializar array vazio
  const existingContacts = getContactForms();
  
  // Criar novo contato com ID e timestamp
  const newContact: ContactForm = {
    id: generateUniqueId(),
    ...form,
    timestamp: new Date(),
    status: 'pending'
  };
  
  // Adicionar novo contato ao início da lista
  const updatedContacts = [newContact, ...existingContacts];
  
  // Salvar no localStorage
  localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(updatedContacts));
  
  return newContact;
};

// Função para obter todos os contatos
export const getContactForms = (): ContactForm[] => {
  const storedContacts = localStorage.getItem(CONTACT_STORAGE_KEY);
  return storedContacts ? JSON.parse(storedContacts) : [];
};

// Função para atualizar status de um contato
export const updateContactStatus = (id: string, status: 'pending' | 'viewed' | 'replied'): boolean => {
  const contacts = getContactForms();
  const contactIndex = contacts.findIndex(contact => contact.id === id);
  
  if (contactIndex >= 0) {
    contacts[contactIndex].status = status;
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contacts));
    return true;
  }
  
  return false;
};

const HumanizedChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [askedForInfo, setAskedForInfo] = useState(false);
  const [isBusinessHours, setIsBusinessHours] = useState(false);
  const [isWaitingQueue, setIsWaitingQueue] = useState(false);
  const [currentAttendant, setCurrentAttendant] = useState<typeof ATTENDANTS[0] | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState<Omit<ContactForm, 'id' | 'timestamp' | 'status'>>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Verificar se estamos em horário comercial
  useEffect(() => {
    const checkBusinessHours = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay();
      
      // Verificar se o dia atual é um dia útil
      const isWorkingDay = WORKING_DAYS.includes(currentDay);
      
      // Verificar se o horário atual está dentro do horário de funcionamento
      const isDuringWorkHours = currentHour >= WORKING_HOURS.start && currentHour < WORKING_HOURS.end;
      
      return isWorkingDay && isDuringWorkHours;
    };
    
    const inBusinessHours = checkBusinessHours();
    setIsBusinessHours(inBusinessHours);
    
    // Verificar a cada minuto
    const interval = setInterval(() => {
      const inBusinessHours = checkBusinessHours();
      setIsBusinessHours(inBusinessHours);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Mensagem de boas-vindas quando o chat é aberto pela primeira vez
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (isBusinessHours) {
        // Verificar atendentes disponíveis
        const availableAttendants = ATTENDANTS.filter(att => att.isAvailable);
        
        if (availableAttendants.length > 0) {
          // Escolher um atendente aleatório
          const randomIndex = Math.floor(Math.random() * availableAttendants.length);
          const selectedAttendant = availableAttendants[randomIndex];
          setCurrentAttendant(selectedAttendant);
          
          // Mensagem de boas-vindas com atendente
          const welcomeMessage: ChatMessage = {
            id: generateUniqueId(),
            type: 'system',
            text: `Bem-vindo ao atendimento do PromobConverter Pro! Você está sendo atendido por ${selectedAttendant.name}.`,
            timestamp: new Date()
          };
          
          const attendantMessage: ChatMessage = {
            id: generateUniqueId(),
            type: 'attendant',
            text: 'Olá! Como posso ajudar você hoje?',
            timestamp: new Date(),
            senderName: selectedAttendant.name
          };
          
          setMessages([welcomeMessage, attendantMessage]);
          setAskedForInfo(true);
        } else {
          // Mensagem de fila de espera
          const queueMessage: ChatMessage = {
            id: generateUniqueId(),
            type: 'system',
            text: 'Todos os nossos atendentes estão ocupados no momento. Você está na fila de espera. Por favor, informe seu nome e email para continuarmos.',
            timestamp: new Date()
          };
          
          setMessages([queueMessage]);
          setIsWaitingQueue(true);
          setAskedForInfo(true);
        }
      } else {
        // Fora do horário comercial
        const offHoursMessage: ChatMessage = {
          id: generateUniqueId(),
          type: 'system',
          text: `Nosso atendimento funciona de segunda a sexta, das ${WORKING_HOURS.start}h às ${WORKING_HOURS.end}h. Por favor, preencha o formulário abaixo e retornaremos o contato em breve.`,
          timestamp: new Date()
        };
        
        setMessages([offHoursMessage]);
        setShowContactForm(true);
      }
    }
  }, [isOpen, messages.length, isBusinessHours]);

  // Rolagem automática para a mensagem mais recente
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Reset form submitted state after delay
  useEffect(() => {
    if (formSubmitted) {
      const timer = setTimeout(() => {
        setFormSubmitted(false);
        toggleChat(); // Fechar o chat após envio
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [formSubmitted]);

  // Simulação de resposta do atendente
  const simulateAttendantResponse = (userQuery: string) => {
    if (!currentAttendant) return;
    
    // Delay para simular digitação
    const typingDelay = Math.max(1000, userQuery.length * 30);
    
    // Mensagem "digitando..."
    const typingMessage: ChatMessage = {
      id: generateUniqueId(),
      type: 'system',
      text: `${currentAttendant.name} está digitando...`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    setTimeout(() => {
      // Remover mensagem "digitando..."
      setMessages(prev => prev.filter(msg => msg.id !== typingMessage.id));
      
      let response = '';
      
      // Respostas simples baseadas no conteúdo
      if (userQuery.toLowerCase().includes('preço') || userQuery.toLowerCase().includes('valor') || userQuery.toLowerCase().includes('plano')) {
        response = 'Temos diferentes planos para atender sua necessidade. O plano básico custa R$19,90/mês e inclui até 50 conversões. Posso te enviar todos os detalhes por email. Qual é o melhor email para contato?';
      } else if (userQuery.toLowerCase().includes('xml') || userQuery.toLowerCase().includes('converter')) {
        response = 'Para converter seu arquivo XML do Promob, basta fazer o upload na nossa plataforma. O sistema processará automaticamente e gerará o arquivo Excel formatado. Você precisa de ajuda com algum arquivo específico?';
      } else if (userQuery.toLowerCase().includes('erro') || userQuery.toLowerCase().includes('problema')) {
        response = 'Sinto muito pelo inconveniente. Poderia me descrever melhor o erro que está encontrando? Se possível, compartilhe uma captura de tela ou o código de erro para que eu possa ajudar de forma mais eficaz.';
      } else if (userQuery.toLowerCase().includes('obrigado') || userQuery.toLowerCase().includes('obrigada')) {
        response = 'Por nada! Estou aqui para ajudar. Tem mais alguma dúvida em que eu possa auxiliar?';
      } else {
        response = 'Entendi sua solicitação. Vou verificar as informações e te retorno em breve. Enquanto isso, há algo mais específico que você gostaria de saber sobre o PromobConverter Pro?';
      }
      
      // Adicionar resposta do atendente
      const attendantMessage: ChatMessage = {
        id: generateUniqueId(),
        type: 'attendant',
        text: response,
        timestamp: new Date(),
        senderName: currentAttendant.name
      };
      
      setMessages(prev => [...prev, attendantMessage]);
    }, typingDelay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !showContactForm) return;
    
    if (showContactForm) {
      // Envio do formulário de contato
      const savedContact = saveContactForm(contactForm);
      
      const contactSent: ChatMessage = {
        id: generateUniqueId(),
        type: 'system',
        text: 'Obrigado! Suas informações foram enviadas. Entraremos em contato em breve.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, contactSent]);
      setFormSubmitted(true);
      
      // Resetar formulário
      setContactForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
      
      return;
    }
    
    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: generateUniqueId(),
      type: 'user',
      text: message,
      timestamp: new Date(),
      senderName: userName || 'Você'
    };
    
    const userQuery = message;
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    
    // Verificar se estamos perguntando informações de contato
    if (askedForInfo && !userName && isWaitingQueue) {
      // Extrair nome e email da mensagem
      const emailMatch = userQuery.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
      const nameCandidate = userQuery.replace(emailMatch?.[0] || '', '').trim();
      
      if (nameCandidate && emailMatch) {
        setUserName(nameCandidate);
        setUserEmail(emailMatch[0]);
        setAskedForInfo(false);
        
        // Salvar o usuário na fila como um contato
        saveContactForm({
          name: nameCandidate,
          email: emailMatch[0],
          phone: "",
          message: "Usuário está aguardando na fila de atendimento."
        });
        
        // Confirmar recebimento das informações
        const confirmMessage: ChatMessage = {
          id: generateUniqueId(),
          type: 'system',
          text: `Obrigado, ${nameCandidate}! Você está na posição #2 da fila. Tempo estimado de espera: 5 minutos. Um atendente entrará em contato assim que disponível.`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, confirmMessage]);
        
        // Simular disponibilidade de atendente após 5 segundos (no mundo real seria quando um atendente ficar disponível)
        setTimeout(() => {
          const availableAttendant = ATTENDANTS.find(att => !att.isAvailable);
          
          if (availableAttendant) {
            // Atualizar status do atendente
            availableAttendant.isAvailable = true;
            setCurrentAttendant(availableAttendant);
            setIsWaitingQueue(false);
            
            // Mensagem de conexão com atendente
            const connectionMessage: ChatMessage = {
              id: generateUniqueId(),
              type: 'system',
              text: `${availableAttendant.name} está disponível e vai atender você agora.`,
              timestamp: new Date()
            };
            
            const greetingMessage: ChatMessage = {
              id: generateUniqueId(),
              type: 'attendant',
              text: `Olá ${nameCandidate}! Sou ${availableAttendant.name}, como posso ajudar você hoje?`,
              timestamp: new Date(),
              senderName: availableAttendant.name
            };
            
            setMessages(prev => [...prev, connectionMessage, greetingMessage]);
          }
        }, 5000);
      } else {
        // Pedir informações novamente se não foram fornecidas corretamente
        const retryMessage: ChatMessage = {
          id: generateUniqueId(),
          type: 'system',
          text: 'Por favor, forneça seu nome e email para entrar na fila de atendimento. Por exemplo: "João Silva joao@email.com"',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, retryMessage]);
      }
      
      return;
    }
    
    // Se temos um atendente, simular resposta
    if (currentAttendant) {
      simulateAttendantResponse(userQuery);
    }
  };

  // Atualizar campos do formulário
  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle do chat
  const toggleChat = () => {
    if (!isOpen) {
      // Resetar o chat se estiver sendo reaberto
      if (messages.length > 0) {
        setUserName(null);
        setUserEmail(null);
        setAskedForInfo(false);
        setIsWaitingQueue(false);
        setCurrentAttendant(null);
        setShowContactForm(false);
        setMessages([]);
      }
    }
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  // Toggle para minimizar
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Botão flutuante para abrir o chat */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 rounded-full h-12 w-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
      
      {/* Container do chatbot */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 transition-all duration-300 shadow-xl",
            isMobile 
              ? "inset-0 m-2" 
              : isMinimized
                ? "bottom-4 right-4 w-64 h-12"
                : "bottom-4 right-4 w-80 md:w-96 h-[500px] max-h-[80vh]"
          )}
        >
          <Card className="flex flex-col h-full border-blue-200">
            {/* Cabeçalho */}
            <CardHeader className="py-3 px-4 border-b flex-shrink-0 flex flex-row items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              {!isMinimized ? (
                <>
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    <div>
                      <h3 className="font-medium text-sm">Atendimento PromobConverter</h3>
                      <div className="flex items-center text-xs opacity-90">
                        {isBusinessHours ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1 text-green-300" />
                            <span>Online agora</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1 text-yellow-300" />
                            <span>Fora do horário de atendimento</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-8 w-8 text-white hover:text-white hover:bg-white/20">
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8 text-white hover:text-white hover:bg-white/20">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    <h3 className="font-medium text-sm">Atendimento PromobConverter</h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-8 w-8 text-white hover:text-white hover:bg-white/20">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </CardHeader>
            
            {/* Corpo do chat com mensagens ou formulário */}
            {!isMinimized && (
              <CardContent className="flex-1 overflow-y-auto py-4 px-3 bg-gray-50">
                {showContactForm ? (
                  <div className="space-y-4">
                    <p className="text-sm font-medium">Por favor, preencha o formulário abaixo:</p>
                    
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="name" className="text-xs text-gray-600 mb-1 block">Nome *</label>
                        <Input 
                          id="name"
                          name="name"
                          value={contactForm.name}
                          onChange={handleContactFormChange}
                          placeholder="Seu nome completo"
                          className="text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="text-xs text-gray-600 mb-1 block">Email *</label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={contactForm.email}
                          onChange={handleContactFormChange}
                          placeholder="seu@email.com"
                          className="text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="text-xs text-gray-600 mb-1 block">Telefone</label>
                        <Input 
                          id="phone"
                          name="phone"
                          value={contactForm.phone}
                          onChange={handleContactFormChange}
                          placeholder="(00) 00000-0000"
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="text-xs text-gray-600 mb-1 block">Mensagem *</label>
                        <Textarea 
                          id="message"
                          name="message"
                          value={contactForm.message}
                          onChange={handleContactFormChange}
                          placeholder="Como podemos ajudar você?"
                          className="text-sm resize-none min-h-[100px]"
                          required
                        />
                      </div>
                      
                      <Button 
                        type="button" 
                        onClick={handleSubmit}
                        disabled={!contactForm.name || !contactForm.email || !contactForm.message || formSubmitted}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {formSubmitted ? "Enviado!" : "Enviar"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-start",
                          msg.type === 'user' ? "justify-end" : "justify-start",
                          msg.type === 'system' ? "justify-center" : ""
                        )}
                      >
                        {msg.type === 'attendant' && (
                          <Avatar className="h-8 w-8 mr-2 bg-blue-600">
                            <span className="text-xs font-medium text-white">{msg.senderName?.substring(0, 2).toUpperCase()}</span>
                          </Avatar>
                        )}
                        
                        <div
                          className={cn(
                            "rounded-lg py-2 px-3 max-w-[85%]",
                            msg.type === 'user'
                              ? "bg-blue-600 text-white"
                              : msg.type === 'system'
                                ? "bg-gray-200 text-gray-800 text-xs text-center w-full italic"
                                : "bg-white border border-gray-200"
                          )}
                        >
                          {msg.type === 'attendant' && (
                            <p className="text-xs font-semibold text-blue-600 mb-1">{msg.senderName}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1 text-right">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        
                        {msg.type === 'user' && (
                          <Avatar className="h-8 w-8 ml-2 bg-gray-300">
                            <span className="text-xs font-medium text-gray-600">EU</span>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>
            )}
            
            {/* Rodapé com input para mensagem */}
            {!isMinimized && !showContactForm && (
              <CardFooter className="p-2 border-t bg-white flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex items-center w-full space-x-2">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    className="min-h-10 flex-1 resize-none border rounded-md p-2"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default HumanizedChat; 