import { createRequestHandler } from "@remix-run/architect";
import * as serverBuild from "@remix-run/dev/server-build";

if (process.env.NODE_ENV !== "production") {
  import("./mocks/index.js");
}

export const handler = createRequestHandler({
  build: serverBuild,
  mode: process.env.NODE_ENV,
});
