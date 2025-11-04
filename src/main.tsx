import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import ErrorBoundary from "./ErrorBoundary";
import "./index.css";

/**
 * Configurações de performance
 */
// Configuração para monitorar performance

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
    return module;
  });
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
  
  // Remover loader quando o app renderizar
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
