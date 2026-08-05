import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/**/*.spec.js'],
        setupFiles: [
            './test/testHelpers/globalProps.js',
            './test/testHelpers/localStorage.js',
            './test/testHelpers/setupBrowserEnv.js',
        ],
        globals: true,
        coverage: {
            reporter: ['text', 'html', 'clover', 'json', 'lcov'],
        },
    },
});
