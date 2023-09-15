import path from "node:path";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.test.{js,jsx,ts,tsx}"],
  publicPath: "/_static/build/",
  server: "server.ts",
  serverBuildPath: "server/index.mjs",
  serverModuleFormat: "esm",
  routes: (defineRoutes) =>
    defineRoutes((route) => {
      if (process.env.NODE_ENV === "production") return;

      console.log("⚠️  Test routes enabled.");

      const appDir = path.join(process.cwd(), "app");

      route(
        "__tests/create-user",
        path.relative(appDir, "cypress/support/test-routes/create-user.ts"),
      );
    }),
};
