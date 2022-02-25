import { setupServer } from "msw/node";

const server = setupServer();

// TODO: uncomment this and figure out why arc attempting to connect to
// the dynamodb tables fails when MSW is intercepting those requests
// server.listen({ onUnhandledRequest: "warn" });
console.info("🔶 Mock server running");

process.once("SIGINT", () => server.close());
process.once("SIGTERM", () => server.close());
