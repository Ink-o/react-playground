import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteExternalsPlugin } from 'vite-plugin-externals'

// https://vite.dev/config/
export default defineConfig({
  publicDir: 'public',
  plugins: [
    react(),
    viteExternalsPlugin({
      react: 'React',
      'react-dom': 'ReactDOM',
    })
  ],
})
