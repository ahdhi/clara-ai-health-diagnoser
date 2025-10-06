import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Compress assets including the large ICD-10 database
        compression({
          algorithm: 'gzip',
          ext: '.gz',
          threshold: 1024, // Only compress files larger than 1KB
          deleteOriginFile: false,
          filter: /\.(js|css|html|json)$/i,
        })
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Increase chunk size limit for large database files
        chunkSizeWarningLimit: 20000, // 20MB limit
        rollupOptions: {
          output: {
            // Ensure large assets are handled properly
            assetFileNames: (assetInfo) => {
              if (assetInfo.name && assetInfo.name.endsWith('.json')) {
                return 'data/[name][extname]';
              }
              return 'assets/[name]-[hash][extname]';
            }
          }
        }
      },
      assetsInclude: ['**/*.json'], // Ensure JSON files are included as assets
    };
});
