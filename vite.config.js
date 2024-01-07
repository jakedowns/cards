// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    publicDir: './public',
    resolve: {
        // Alias vue to the correct vue version
        alias: {
            'vue': resolve(__dirname, 'node_modules/vue/dist/vue.esm-bundler.js'),
        },
    },
    server: {
        // Specify the host IP, use '0.0.0.0' to accept connections from all IPs
        // host: '0.0.0.0',
        // Specify the port
        port: 3000, // Change to your desired port
    }
});
