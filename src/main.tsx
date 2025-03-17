import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./ErrorBoundary";

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

// Adicionar log para debug
const envInfo = {
  MODE: import.meta.env.MODE,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  HAS_SUPABASE_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  HAS_STRIPE_KEY: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
};

console.log('Ambiente:', envInfo.MODE);
console.log('Variáveis de ambiente:', envInfo);

// Atualizar elemento de debug
debugElement.innerHTML = `
  <h3>Debug Info (triplo clique para mostrar/ocultar)</h3>
  <p>Ambiente: ${envInfo.MODE}</p>
  <p>VITE_SUPABASE_URL: ${envInfo.VITE_SUPABASE_URL || 'não definido'}</p>
  <p>VITE_API_URL: ${envInfo.VITE_API_URL || 'não definido'}</p>
  <p>HAS_SUPABASE_KEY: ${envInfo.HAS_SUPABASE_KEY}</p>
  <p>HAS_STRIPE_KEY: ${envInfo.HAS_STRIPE_KEY}</p>
  <p>User Agent: ${navigator.userAgent}</p>
  <p>Timestamp: ${new Date().toISOString()}</p>
`;

// Adicionar handler global de erros
window.addEventListener('error', (event) => {
  console.error('Erro global capturado:', event.error);
  
  // Atualizar elemento de debug
  const debugEl = document.getElementById('debug-info');
  if (debugEl) {
    debugEl.innerHTML += `<p style="color: red">ERRO: ${event.error?.message || 'Erro desconhecido'}</p>`;
    debugEl.style.display = 'block'; // Mostrar automaticamente em caso de erro
  }
});

// Adicionar handler para rejeições de promessas não tratadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promessa rejeitada não tratada:', event.reason);
  
  // Atualizar elemento de debug
  const debugEl = document.getElementById('debug-info');
  if (debugEl) {
    debugEl.innerHTML += `<p style="color: orange">PROMESSA REJEITADA: ${event.reason?.message || 'Razão desconhecida'}</p>`;
    debugEl.style.display = 'block'; // Mostrar automaticamente em caso de erro
  }
});

// Tentar renderizar com fallback simples em caso de erro
try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error("Elemento root não encontrado");
  }
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Erro ao renderizar aplicação:', error);
  
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
