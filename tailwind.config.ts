import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      themeColor: 'rgb(88 196 220)',
    },
    extend: {},
  },
  plugins: [],
}

export default config
