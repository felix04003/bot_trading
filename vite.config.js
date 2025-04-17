import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react({
        jsxRuntime: 'automatic',
        jsxImportSource: 'react'
    })],
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    'solana': ['@solana/web3.js', '@solana/wallet-adapter-base', '@solana/wallet-adapter-phantom'],
                    'react': ['react', 'react-dom']
                }
            }
        }
    },
    optimizeDeps: {
        include: ['@solana/web3.js', '@solana/wallet-adapter-base', '@solana/wallet-adapter-phantom']
    },
    resolve: {
        extensions: ['.jsx', '.js', '.json', '.css']
    },
    css: {
        modules: false,
        preprocessorOptions: {
            css: {
                additionalData: `@import "./styles.css";`
            }
        }
    }
}); 