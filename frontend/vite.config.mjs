import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  define: { 'process.env': {} },
  plugins: [vue(), vuetify()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['vuetify'],
  },
})
