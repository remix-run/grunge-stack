// This should eventually be a npm package, but for now it lives here.
// Its job is to notify the remix dev server of the version of the running
// app to trigger HMR / HDR.

import fs from "node:fs";
import path from "node:path";

import { logDevReady } from "@remix-run/node";

const BUILD_PATH = path.join("server", "index.mjs");

let lastTimeout;

export default {
  sandbox: {
    watcher: async () => {
      if (lastTimeout) {
        clearTimeout(lastTimeout);
      }

      lastTimeout = setTimeout(async () => {
        const contents = fs.readFileSync(
          path.resolve(process.cwd(), BUILD_PATH),
          "utf8"
        );
        const manifestMatches = contents.matchAll(/manifest-([A-f0-9]+)\.js/g);
        const sent = new Set();
        for (const [buildHash] of manifestMatches) {
          if (!sent.has(buildHash)) {
            sent.add(buildHash);
            logDevReady({ assets: { version: buildHash } });
          }
        }
      }, 300);
    },
  },
  set: {
    env: () => ({
      // `arc sandbox` does not automatically pass `NODE_ENV` from its
      // environment to the application.
      testing: { NODE_ENV: "development" },
    }),
  },
};
