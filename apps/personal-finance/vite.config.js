import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@zeno/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@zeno/core': path.resolve(__dirname, '../../packages/core'),
    },
  },
})
