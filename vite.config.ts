import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 🎨 這是負責把網頁變漂亮的設計師，把它請回來了！
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 💉 防止 AI 套件導致白畫面的疫苗
  define: {
    'process.env': {} 
  }
});
