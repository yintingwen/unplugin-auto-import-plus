import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Unplugin from '../src/vite'
console.log(process.cwd());

export default defineConfig({
  plugins: [
    // Inspect(),
    Unplugin({
      dirs: [
        { input: './src/test', suffix: 'util' }
      ],
      output: './src/merge'
    }),
  ],
})