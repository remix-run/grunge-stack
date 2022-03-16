const { execSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const sort = require("sort-package-json");

function getRandomString(length) {
  return crypto.randomBytes(length).toString("hex");
}

async function main({ rootDirectory }) {
  const APP_ARC_PATH = path.join(rootDirectory, "./app.arc");
  const ENV_PATH = path.join(rootDirectory, ".env");
  const PACKAGE_JSON_PATH = path.join(rootDirectory, "package.json");

  const DIR_NAME = path.basename(rootDirectory);
  const SUFFIX = getRandomString(2);
  const APP_NAME = DIR_NAME + "-" + SUFFIX;

  const [appArc, packageJson] = await Promise.all([
    fs.readFile(APP_ARC_PATH, "utf-8"),
    fs.readFile(PACKAGE_JSON_PATH, "utf-8"),
  ]);

  const secret = getRandomString(16);
  const env = `NODE_ENV="development"\nSESSION_SECRET="${secret}"\n`;

  const newPackageJson =
    JSON.stringify(
      sort({ ...JSON.parse(packageJson), name: APP_NAME }),
      null,
      2
    ) + "\n";

  await Promise.all([
    fs.writeFile(
      APP_ARC_PATH,
      appArc.replace("grunge-stack-template", APP_NAME)
    ),
    fs.writeFile(ENV_PATH, env),
    fs.writeFile(PACKAGE_JSON_PATH, newPackageJson),
  ]);

  console.log(
    `Running the setup script to make sure everything was set up properly`
  );
  execSync(`npm run setup`, { stdio: "inherit", cwd: rootDirectory });

  console.log(`✅  Project is ready! Start development with "npm run dev"`);
}

module.exports = main;
