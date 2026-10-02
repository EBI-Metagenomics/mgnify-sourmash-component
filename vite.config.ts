import { defineConfig, Plugin } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import fs from 'fs';
import path from 'path';

// Custom plugin to handle sourmash WebAssembly imports
function sourmashWasmPlugin(): Plugin {
  return {
    name: 'sourmash-wasm-plugin',
    async load(id) {
      // Check if this is the sourmash WebAssembly file
      if (id.includes('sourmash_bg.wasm')) {
        // Get the path to the WebAssembly file
        const wasmPath = path.resolve(process.cwd(), id.replace(/^\/?/, ''));
        
        // Read the WebAssembly file as a buffer
        const wasmBuffer = await fs.promises.readFile(wasmPath);
        
        // Convert the buffer to a base64 string
        const base64 = wasmBuffer.toString('base64');
        
        // Return a module that exports the WebAssembly module
        return `
          const wasmBinary = Uint8Array.from(atob('${base64}'), c => c.charCodeAt(0));
          const wasmModule = new WebAssembly.Module(wasmBinary);
          export default wasmModule;
        `;
      }
    }
  };
}

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MGnifySourmashComponent',
      fileName: 'mgnify-sourmash-component',
      formats: ['es'],
    },
    rollupOptions: {
      external: [],
      output: {
        // Preserve the name of the component
        entryFileNames: 'mgnify-sourmash-component.js',
      },
    },
    sourcemap: true,
    target: 'es2015',
  },
  plugins: [
    dts(), // Generate TypeScript declaration files
    wasm(), // Support WebAssembly
    topLevelAwait(), // Support top-level await in WebAssembly modules
    sourmashWasmPlugin(), // Custom plugin for sourmash WebAssembly imports
    nodePolyfills({
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      // Provide polyfills
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      stream: 'stream-browserify',
    },
  },
  optimizeDeps: {
    // Exclude sourmash from optimization to prevent WebAssembly loading issues
    exclude: ['sourmash'],
    esbuildOptions: {
      // Enable WebAssembly support in dependencies
      supported: {
        'top-level-await': true,
      },
    },
  },
  worker: {
    format: 'es', // Use ES modules for workers
  },
  server: {
    port: 9001, // Match the port used in the original webpack config
  },
});