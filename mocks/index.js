const { setupServer } = require("msw/node");

const server = setupServer();

server.listen({ onUnhandledRequest: "bypass" });

process.once("SIGINT", () => server.close());
process.once("SIGTERM", () => server.close());
