
import { ShoppingBag, FileText, Lock } from "lucide-react";

const LoginSidebar = () => {
  return (
    <div className="hidden md:block md:w-1/2 bg-primary/90 p-12 text-white relative">
      <div className="h-full flex flex-col justify-between">
        <div>
          <ShoppingBag className="h-12 w-12 mb-6" />
          <h1 className="text-3xl font-bold mb-2">Conversor XML para Excel</h1>
          <p className="text-white/80 mb-8">Transforme seus arquivos XML em planilhas Excel profissionais com apenas alguns cliques.</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Simplifique a Conversão</h3>
              <p className="text-sm text-white/70">De XML para Excel em segundos</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Seguro e Confiável</h3>
              <p className="text-sm text-white/70">Processamento seguro de seus dados</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-sm text-white/60">
          © {new Date().getFullYear()} XML Excel Wizard. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

export default LoginSidebar;
