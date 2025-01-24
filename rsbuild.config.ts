import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { NormalModuleReplacementPlugin } from '@rspack/core'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  html: {
    template: './index.html',
  },
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
  plugins: [
    pluginReact(),
  ],
  tools: {
    rspack: (config) => {
      // 处理 raw
      config.plugins?.push(
        new NormalModuleReplacementPlugin(
          /\?raw$/,
          (resource) => {
            resource.request = resource.request.replace(/\?raw/, '')
            resource.request = `!raw-loader!${resource.request}`
            console.log('resource', resource)
          },
        ),
      )
    },
    postcss: {
      plugins: [
        tailwindcss({
          content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
        }),
      ],
    },
  },
})
