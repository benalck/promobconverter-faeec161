
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: 8080
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      onwarn(warning, warn) {
        if (warning.code === 'INVALID_IMPORT_SYNTAX' || 
            warning.code === 'INVALID_EXPORT_OPTION' || 
            (warning.message && (
              warning.message.includes('is a directory') || 
              warning.message.includes('NODE_ENV') ||
              warning.message.includes('resolved with an external identifier')
            ))) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    }
  }
}));
