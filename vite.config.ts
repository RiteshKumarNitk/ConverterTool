import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
//
//uvicorn main:app --reload

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', 'pdfjs-dist'],
  },
  build: {
    target: 'esnext',
  },
});
