import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { remixDevTools } from "remix-development-tools";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  const isCypress = process.env.CYPRESS_ENV === "true";

  return {
    base: isProduction || isCypress ? "/_static/" : "/",
    server: {
      port: 4000,
      open: true,
    },
    build: {
      outDir: "build",
      rollupOptions: {
        output: {
          entryFileNames: "[name]-[hash].js",
          chunkFileNames: "[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
    },
    plugins: [
      remixDevTools(),
      remix({
        ignoredRouteFiles: ["**/*.css"],
        buildDirectory: "build",
        serverBuildFile: "index.mjs",
        basename: "/",
      }),
      tsconfigPaths(),
      {
        name: "architect-handler",
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        apply(_config, env): boolean {
          return env.command === "build" && env?.isSsrBuild === true;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        config: async (_config, _env) => {
          return {
            build: {
              ssr: "handler.ts",
            },
          };
        },
      },
    ],
    test: {
      globals: true,
      environment: "happy-dom",
      setupFiles: ["./test/setup-test-env.ts"],
    },
  };
});
