import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // HTTPS required for WebXR and microphone access
  ],
  server: {
    host: '0.0.0.0', // Allow Quest to connect via local IP
    port: 5173,
    https: true
  }
})
