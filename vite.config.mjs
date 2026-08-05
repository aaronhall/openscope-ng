import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const ROOT = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    root: ROOT,
    base: './',
    publicDir: `${ROOT}.vite-public`,
    build: {
        outDir: `${ROOT}public`,
        emptyOutDir: true,
        sourcemap: true,
        target: 'es2015',
    },
});
