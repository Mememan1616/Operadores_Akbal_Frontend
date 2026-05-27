import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile' // ¡Asegúrate de tener esta línea!

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile(), // ¡Y que esté invocado aquí con los paréntesis!
  ],
})