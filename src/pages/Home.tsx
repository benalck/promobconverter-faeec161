
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileDown, FileSpreadsheet, Users, BarChart, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/50 dark:bg-black/20 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6 h-16">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">PromobConverter</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium">Recursos</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium">Depoimentos</a>
          </nav>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link to="/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="gradient" size="sm" className="shadow-sm">
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] translate-x-1/3 translate-y-1/3 rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="outline" className="mb-6 px-4 py-1 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              A ferramenta preferida dos profissionais
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 gradient-heading">
              Automatize seus planos de corte. Converta arquivos XML do Promob em segundos.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Ferramenta profissional usada por marceneiros, projetistas e fábricas. 
              Transforme XML em planilhas organizadas com um único clique.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button variant="gradient" size="xl" className="font-medium shadow-lg">
                  Crie sua conta grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#demo">
                <Button variant="outline" size="xl" className="font-medium">
                  Ver demonstração
                </Button>
              </a>
            </div>
          </div>

          {/* Demo preview */}
          <div className="relative mx-auto max-w-4xl mt-12 rounded-lg overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="bg-white dark:bg-gray-900 pt-3 px-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">PromobConverter Pro - Conversor XML</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 aspect-[16/9] flex items-center justify-center p-6">
              <div className="w-full rounded-md bg-white dark:bg-gray-900 p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-full text-center mb-8">
                  <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Converter XML Promob</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Arraste seu arquivo ou clique para fazer upload</p>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center animate-pulse mb-8">
                  <div className="mb-2">
                    <FileDown className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Solte seu arquivo XML aqui</p>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="gradient">
                    Converter Agora
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 gradient-heading">Recursos poderosos</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Projetado para profissionais que valorizam tempo, precisão e eficiência em seus projetos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: FileDown,
                title: "Conversão instantânea",
                desc: "Transforme arquivos XML do Promob em planilhas Excel organizadas em segundos, sem perda de dados."
              },
              {
                icon: FileSpreadsheet,
                title: "Planilhas otimizadas",
                desc: "Formato profissional com cálculo automático de materiais, separação por tipo e totais calculados."
              },
              {
                icon: Clock,
                title: "Economize tempo",
                desc: "O que levaria horas para organizar manualmente agora leva apenas alguns segundos."
              },
              {
                icon: BarChart,
                title: "Análise de dados",
                desc: "Visualize o resumo de materiais, chapas necessárias e cálculos de fitas de borda."
              },
              {
                icon: Check,
                title: "Precisão garantida",
                desc: "Elimine erros humanos com conversão 100% precisa de todos os dados do arquivo XML."
              },
              {
                icon: Users,
                title: "Colaboração",
                desc: "Compartilhe facilmente seus planos de corte com fornecedores e colaboradores."
              },
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg transition-all hover:shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 mb-4 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 gradient-heading">O que nossos clientes dizem</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Profissionais que transformaram seu fluxo de trabalho com o PromobConverter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Ricardo Oliveira",
                role: "Marceneiro autônomo",
                text: "Economizo pelo menos 2 horas por projeto. Agora consigo entregar orçamentos muito mais rápido para meus clientes.",
                image: "https://randomuser.me/api/portraits/men/32.jpg"
              },
              {
                name: "Ana Carolina",
                role: "Projetista de móveis",
                text: "Indispensável para quem trabalha com Promob. Os planos de corte saem perfeitos e não preciso mais refazer nada manualmente.",
                image: "https://randomuser.me/api/portraits/women/44.jpg"
              },
              {
                name: "Fernando Mendes",
                role: "Gerente de fábrica",
                text: "Reduziu nossos erros de produção em 40%. O investimento se pagou no primeiro mês de uso.",
                image: "https://randomuser.me/api/portraits/men/62.jpg"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">{testimonial.text}</p>
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo section */}
      <section id="demo" className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 gradient-heading">Veja como funciona</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  O PromobConverter transforma seu arquivo XML do Promob em uma planilha Excel organizada em apenas três passos simples.
                </p>
                <ul className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: "Faça upload do arquivo XML",
                      desc: "Exporte o arquivo XML do seu projeto no Promob e faça upload no PromobConverter."
                    },
                    {
                      step: 2,
                      title: "Conversão automática",
                      desc: "Nosso sistema processa todos os dados e organiza em um formato otimizado."
                    },
                    {
                      step: 3,
                      title: "Baixe o resultado",
                      desc: "Receba uma planilha Excel profissional, pronta para uso ou impressão."
                    },
                  ].map((step, index) => (
                    <li key={index} className="flex">
                      <div className="mr-4 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-bold text-lg">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{step.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link to="/register">
                    <Button variant="gradient" size="lg">
                      Experimente agora
                      <ArrowRight className="ml-1 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex flex-col h-full">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center p-4 mb-4 animate-pulse">
                      <FileDown className="h-16 w-16 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded overflow-hidden flex-1">
                      <div className="p-2 bg-blue-600 dark:bg-blue-700">
                        <div className="w-40 h-5 bg-white/30 rounded"></div>
                      </div>
                      <div className="p-2">
                        <div className="space-y-2">
                          <div className="grid grid-cols-5 gap-1">
                            <div className="bg-gray-100 dark:bg-gray-800 h-6 rounded"></div>
                            <div className="bg-gray-100 dark:bg-gray-800 h-6 rounded"></div>
                            <div className="bg-gray-100 dark:bg-gray-800 h-6 rounded"></div>
                            <div className="bg-gray-100 dark:bg-gray-800 h-6 rounded"></div>
                            <div className="bg-gray-100 dark:bg-gray-800 h-6 rounded"></div>
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            <div className="bg-gray-50 dark:bg-gray-800/50 h-6 rounded"></div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 h-6 rounded"></div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 h-6 rounded"></div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 h-6 rounded"></div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 h-6 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <div className="bg-blue-600 dark:bg-blue-700 text-white rounded py-2 px-6 text-sm font-medium w-40 text-center">
                        Download Excel
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full opacity-70 blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Pronto para automatizar seus planos de corte?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Comece agora mesmo e transforme a forma como você trabalha com projetos Promob.
          </p>
          <Link to="/register">
            <Button 
              size="xl"
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
            >
              Criar conta gratuita
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4">PromobConverter</h4>
              <p className="text-gray-400 text-sm">
                Sua ferramenta para conversão de arquivos XML Promob em planilhas Excel otimizadas.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Depoimentos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutoriais</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Serviço</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} PromobConverter. Todos os direitos reservados.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

