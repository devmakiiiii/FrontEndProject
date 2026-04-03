import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    allowedHosts: [
      'sb-359h5fmc5qon.vercel.run',
      'localhost',
      '127.0.0.1',
    ],
  },
})