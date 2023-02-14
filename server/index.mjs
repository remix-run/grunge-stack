import { createRequestHandler } from "@remix-run/architect";
import * as serverBuild from "./build/index.js";

if (process.env.NODE_ENV !== "production") {
  import("./mocks/index.js");
}

export const handler = createRequestHandler({
  build: serverBuild,
  mode: process.env.NODE_ENV,
});
