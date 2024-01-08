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
        // get from env
        host: '0.0.0.0', //'cards.site',
        // Specify the port todo: get from env
        port: 4090,
    }
});
