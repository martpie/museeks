import { TanStackRouterVite as router } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vitePrerenderPlugin({
      renderTarget: '#wrap',
      prerenderScript: './src/prerender.tsx', // Path to the script that will be executed during prerendering
    }), // Allow for prerendering the skeleton of the app
    router({
      target: 'react',
      generatedRouteTree: './src/generated/route-tree.ts',
    }),
    react(),
    svgr(),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
}));
