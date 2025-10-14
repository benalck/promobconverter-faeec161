import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import ErrorBoundary from "./ErrorBoundary";
import "./index.css";

/**
 * Configurações de performance
 */
// Configuração para monitorar performance
const enablePerfMetrics = process.env.NODE_ENV === 'development';
if (enablePerfMetrics) {
  // Monitoramento do tempo de inicialização
  performance.mark('app-init-start');
}

// Preload de recursos críticos
const preloadResources = () => {
  // Lista de recursos críticos para pré-carregar
  const criticalResources = [
    // Imagens e ícones importantes
    '/favicon.ico',
    // Fontes
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.endsWith('.ico') || resource.endsWith('.png') || resource.endsWith('.jpg') || resource.endsWith('.svg')) {
      link.as = 'image';
    } else if (resource.includes('fonts.googleapis.com')) {
      link.as = 'font';
    }
    
    link.href = resource;
    document.head.appendChild(link);
  });
};

// Componente de carregamento para Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
  </div>
);

// Carregamento lazy do App com prefetch
const App = lazy(() => {
  // Inicia o pré-carregamento dos recursos enquanto aguarda o App ser carregado
  preloadResources();
  return import('./App').then(module => {
    if (enablePerfMetrics) {
      performance.mark('app-loaded');
      performance.measure('app-loading-time', 'app-init-start', 'app-loaded');
      console.log('App carregado e pronto para renderização');
    }
    return module;
  });
});

// Configuração de logs e detecção de erros
console.log('Inicializando aplicação...');
console.log('Ambiente:', import.meta.env.MODE);

// Adicionar elemento para debug visível
const debugElement = document.createElement('div');
debugElement.id = 'debug-info';
debugElement.style.position = 'fixed';
debugElement.style.bottom = '0';
debugElement.style.left = '0';
debugElement.style.right = '0';
debugElement.style.backgroundColor = 'rgba(0,0,0,0.8)';
debugElement.style.color = 'white';
debugElement.style.padding = '10px';
debugElement.style.fontSize = '12px';
debugElement.style.zIndex = '9999';
debugElement.style.maxHeight = '200px';
debugElement.style.overflow = 'auto';
debugElement.style.display = 'none'; // Inicialmente oculto

// Função para mostrar/ocultar debug info com triplo clique
document.addEventListener('click', (e) => {
  if (e.detail === 3) { // Triplo clique
    const debugEl = document.getElementById('debug-info');
    if (debugEl) {
      debugEl.style.display = debugEl.style.display === 'none' ? 'block' : 'none';
    }
  }
});

// Adicionar ao DOM
document.body.appendChild(debugElement);

// Capturar informações do ambiente
const envInfo = {
  MODE: import.meta.env.MODE,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'não definido',
  VITE_API_URL: import.meta.env.VITE_API_URL || 'não definido',
  HAS_SUPABASE_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  HAS_STRIPE_KEY: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  BROWSER: navigator.userAgent,
  TIMESTAMP: new Date().toISOString()
};

// Guardar variáveis de ambiente e informações de depuração
console.log('Informações do ambiente:', envInfo);
debugElement.innerHTML = `
  <h3>Debug Info (triplo clique para mostrar/ocultar)</h3>
  <p>Ambiente: ${envInfo.MODE}</p>
  <p>VITE_SUPABASE_URL: ${envInfo.VITE_SUPABASE_URL}</p>
  <p>VITE_API_URL: ${envInfo.VITE_API_URL}</p>
  <p>HAS_SUPABASE_KEY: ${envInfo.HAS_SUPABASE_KEY}</p>
  <p>HAS_STRIPE_KEY: ${envInfo.HAS_STRIPE_KEY}</p>
  <p>User Agent: ${envInfo.BROWSER}</p>
  <p>Timestamp: ${envInfo.TIMESTAMP}</p>
`;

// Handler para erros globais
window.addEventListener('error', (event) => {
  console.error('Erro global capturado:', event.error || event.message);
  
  // Atualizar elemento de debug
  const debugEl = document.getElementById('debug-info');
  if (debugEl) {
    debugEl.innerHTML += `<p style="color: red">ERRO: ${event.error?.message || event.message || 'Erro desconhecido'}</p>`;
    debugEl.style.display = 'block'; // Mostrar automaticamente em caso de erro
  }
  
  // Remover loader
  const loader = document.getElementById('loading-fallback');
  if (loader) {
    loader.style.display = 'none';
  }
});

// Handler para rejeições de promessas não tratadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promessa rejeitada não tratada:', event.reason);
  
  // Atualizar elemento de debug
  const debugEl = document.getElementById('debug-info');
  if (debugEl) {
    debugEl.innerHTML += `<p style="color: orange">PROMESSA REJEITADA: ${event.reason?.message || 'Razão desconhecida'}</p>`;
    debugEl.style.display = 'block'; // Mostrar automaticamente em caso de erro
  }
});

// Renderizar aplicação com fallbacks
try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error("Elemento root não encontrado");
  }
  
  // Iniciar preload imediatamente
  preloadResources();
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <App />
        </Suspense>
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  // Remover loader quando o app renderizar
  const loader = document.getElementById('loading-fallback');
  if (loader) {
    loader.style.display = 'none';
  }
  
  if (enablePerfMetrics) {
    performance.mark('app-render-complete');
    performance.measure('app-total-time', 'app-init-start', 'app-render-complete');
    console.log('Aplicação renderizada com sucesso!');
    
    // Registrar métricas importantes
    const appLoadTime = performance.getEntriesByName('app-loading-time')[0];
    const totalTime = performance.getEntriesByName('app-total-time')[0];
    console.log(`Tempo de carregamento do App: ${appLoadTime?.duration.toFixed(2)}ms`);
    console.log(`Tempo total de inicialização: ${totalTime?.duration.toFixed(2)}ms`);
  } else {
    console.log('Aplicação renderizada com sucesso!');
  }
} catch (error) {
  console.error('Erro crítico ao renderizar aplicação:', error);
  
  // Fallback simples em caso de erro crítico
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; margin: 20px; border: 1px solid #f44336; border-radius: 4px; background-color: #ffebee;">
        <h2 style="color: #d32f2f;">Erro crítico ao iniciar a aplicação</h2>
        <p>${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        <button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px; background-color: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Recarregar página
        </button>
      </div>
    `;
  }
}
