import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import.meta.url
// https://vitejs.dev/config/
export default defineConfig({
  base: '/ton-vote/',
  plugins: [
    react(),
    tsconfigPaths(),
    
  ],
  server: {
    port: 3000,
  },
});
