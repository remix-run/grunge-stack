import { createRequestHandler } from "@remix-run/architect";
import { installGlobals } from "@remix-run/node";
import * as build from "@remix-run/dev/server-build";

installGlobals();

if (process.env.NODE_ENV !== "production") {
  require("./mocks");
}

export const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
});
