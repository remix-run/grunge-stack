import path from "node:path";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  cacheDirectory: "./node_modules/.cache/remix",
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
  ignoredRouteFiles: ["**/.*", "**/*.test.{js,jsx,ts,tsx}"],
  publicPath: "/_static/build/",
  postcss: true,
  server: "server.ts",
  serverBuildPath: "server/index.mjs",
  serverModuleFormat: "esm",
  tailwind: true,
  routes: (defineRoutes) =>
    defineRoutes((route) => {
      if (process.env.NODE_ENV === "production") return;

      console.log("⚠️  Test routes enabled.");

      const appDir = path.join(process.cwd(), "app");

      route(
        "__tests/create-user",
        path.relative(appDir, "cypress/support/test-routes/create-user.ts")
      );
    }),
};
