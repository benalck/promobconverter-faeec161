import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      onwarn(warning, warn) {
        // Ignorar completamente os avisos sobre diretórios
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
      }
    }
  }
});
