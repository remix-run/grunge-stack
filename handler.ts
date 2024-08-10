import { createRequestHandler } from "@remix-run/architect";
// @ts-expect-error - Remix doesn't have types for this file
// eslint-disable-next-line import/no-unresolved
import * as build from "virtual:remix/server-build";

export const handler = createRequestHandler({
  build: build,
  mode: process.env.NODE_ENV,
});
