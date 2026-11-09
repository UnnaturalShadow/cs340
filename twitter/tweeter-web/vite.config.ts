import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import viteCommonJs from "vite-plugin-commonjs"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin(), { ...viteCommonJs(), apply: "serve" }],
  build: {
    // The shared workspace emits CommonJS; use Vite's production converter.
    commonjsOptions: { include: [/node_modules/, /tweeter-shared[\\/]dist/] },
  },
  server: {
    open: true,
  },
});
