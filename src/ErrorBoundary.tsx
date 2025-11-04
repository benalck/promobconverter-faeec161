
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Info } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Erro capturado pelo ErrorBoundary:', error);
    console.error('Informações da stack:', errorInfo.componentStack);
    
    this.setState({
      errorInfo: errorInfo
    });
    
    // Tentar registrar o erro em algum serviço de monitoramento ou analytics
    try {
      // Aqui poderia enviar para um serviço como Sentry, LogRocket, etc.
      const debugEl = document.getElementById('debug-info');
      if (debugEl) {
        debugEl.innerHTML += `<p style="color: red">ERRO COMPONENTE: ${error.message}</p>`;
        debugEl.innerHTML += `<pre style="font-size:10px;max-height:100px;overflow:auto">${errorInfo.componentStack}</pre>`;
        debugEl.style.display = 'block';
      }
    } catch (loggingError) {
      console.error('Falha ao registrar erro:', loggingError);
    }
  }

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md border border-red-100">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-red-700 mb-4">
              Houve um problema
            </h2>
            
            <p className="text-gray-700 mb-4 text-center">
              Encontramos um erro ao renderizar esta página. Nossa equipe foi notificada.
            </p>
            
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm flex items-center justify-center mb-4"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Recarregar página
            </button>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button 
                onClick={this.toggleDetails}
                className="flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 w-full"
              >
                <Info className="w-4 h-4 mr-1" />
                {this.state.showDetails ? "Ocultar detalhes técnicos" : "Mostrar detalhes técnicos"}
              </button>
              
              {this.state.showDetails && (
                <div className="mt-3 text-xs bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
                  <p className="font-semibold mb-1">Erro:</p>
                  <p className="text-red-600 mb-2">{this.state.error && this.state.error.toString()}</p>
                  
                  {this.state.errorInfo && (
                    <>
                      <p className="font-semibold mb-1">Stack trace:</p>
                      <pre className="whitespace-pre-wrap text-gray-600">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                  
                  <div className="mt-3 pt-2 border-t border-gray-300">
                    <p className="font-semibold mb-1">Informações do sistema:</p>
                    <p>Navegador: {navigator.userAgent}</p>
                    <p>URL: {window.location.href}</p>
                    <p>Hora: {new Date().toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
