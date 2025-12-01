import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: { port: 5173 },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        cadastro: resolve(__dirname, 'src/pages/cadastro.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
        submissao: resolve(__dirname, 'src/pages/submissao.html'),
        historico: resolve(__dirname, 'src/pages/historico.html'),
        galeria: resolve(__dirname, 'src/pages/galeria.html'),
        perfil: resolve(__dirname, 'src/pages/perfil.html'),
        admin: resolve(__dirname, 'src/pages/admin.html')
      }
    }
  }
});