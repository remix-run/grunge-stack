const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

function getRandomString(length) {
  return crypto.randomBytes(length).toString("hex");
}

async function main() {
  const ENV_PATH = path.join(__dirname, ".env");

  const secret = getRandomString(16);
  const env = `NODE_ENV="development"\nSESSION_SECRET="${secret}"\n`;

  await fs.writeFile(ENV_PATH, env);
}

void main();
