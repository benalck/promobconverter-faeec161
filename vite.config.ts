import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Garantir que o NODE_ENV não cause problemas
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log('Building with NODE_ENV:', nodeEnv);
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: true,
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      minify: 'terser',
      // Ignorar advertências sobre NODE_ENV
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'react';
              }
              if (id.includes('@supabase') || id.includes('date-fns') || id.includes('lucide-react')) {
                return 'vendor';
              }
              return 'vendor-other';
            }
          }
        },
        onwarn(warning, warn) {
          // Ignorar avisos de NODE_ENV
          if (warning.message && warning.message.includes('NODE_ENV')) {
            return;
          }
          warn(warning);
        }
      }
    }
  };
});
