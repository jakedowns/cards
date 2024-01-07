// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    publicDir: './public',
    server: {
        // Specify the host IP, use '0.0.0.0' to accept connections from all IPs
        // host: '0.0.0.0',
        // Specify the port
        port: 3000, // Change to your desired port
    }
  });