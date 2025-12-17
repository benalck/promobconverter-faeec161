import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Mail, Phone, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                PromobConverter
              </h3>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              A ferramenta profissional para converter arquivos XML Promob em planos de corte Excel. 
              Otimize seu workflow e economize horas de trabalho manual.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-muted-foreground hover:text-primary transition-colors">
                  Histórico
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-muted-foreground hover:text-primary transition-colors">
                  Configurações
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} PromobConverter Pro. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="mailto:suporte@promobconverter.com" className="hover:text-primary transition-colors flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Suporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
