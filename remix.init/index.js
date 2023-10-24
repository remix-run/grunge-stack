const { execSync } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const { toLogicalID } = require("@architect/utils");
const PackageJson = require("@npmcli/package-json");
const inquirer = require("inquirer");
const semver = require("semver");

const getPackageManagerCommand = (packageManager) =>
  // Inspired by https://github.com/nrwl/nx/blob/bd9b33eaef0393d01f747ea9a2ac5d2ca1fb87c6/packages/nx/src/utils/package-manager.ts#L38-L103
  ({
    bun: () => ({
      exec: "bunx",
      lockfile: "bun.lockb",
      run: (script, args) => `bun run ${script} ${args || ""}`,
    }),
    npm: () => ({
      exec: "npx",
      lockfile: "package-lock.json",
      run: (script, args) => `npm run ${script} ${args ? `-- ${args}` : ""}`,
    }),
    pnpm: () => {
      const pnpmVersion = getPackageManagerVersion("pnpm");
      const includeDoubleDashBeforeArgs = semver.lt(pnpmVersion, "7.0.0");
      const useExec = semver.gte(pnpmVersion, "6.13.0");

      return {
        exec: useExec ? "pnpm exec" : "pnpx",
        lockfile: "pnpm-lock.yaml",
        run: (script, args) =>
          includeDoubleDashBeforeArgs
            ? `pnpm run ${script} ${args ? `-- ${args}` : ""}`
            : `pnpm run ${script} ${args || ""}`,
      };
    },
    yarn: () => ({
      exec: "yarn",
      lockfile: "yarn.lock",
      run: (script, args) => `yarn ${script} ${args || ""}`,
    }),
  })[packageManager]();

const getPackageManagerVersion = (packageManager) =>
  // Copied over from https://github.com/nrwl/nx/blob/bd9b33eaef0393d01f747ea9a2ac5d2ca1fb87c6/packages/nx/src/utils/package-manager.ts#L105-L114
  execSync(`${packageManager} --version`).toString("utf-8").trim();

const getRandomString = (length) => crypto.randomBytes(length).toString("hex");

const updatePackageJson = ({ APP_NAME, packageJson }) => {
  const {
    scripts: {
      // eslint-disable-next-line no-unused-vars
      "format:repo": _repoFormatScript,
      ...scripts
    },
  } = packageJson.content;

  packageJson.update({
    name: APP_NAME,
    scripts,
  });
};

const main = async ({ packageManager, rootDirectory }) => {
  const APP_ARC_PATH = path.join(rootDirectory, "./app.arc");
  const EXAMPLE_ENV_PATH = path.join(rootDirectory, ".env.example");
  const ENV_PATH = path.join(rootDirectory, ".env");
  const README_PATH = path.join(rootDirectory, "README.md");

  const DIR_NAME = path.basename(rootDirectory);
  const SUFFIX = getRandomString(2);

  const APP_NAME = (DIR_NAME + "-" + SUFFIX)
    // get rid of anything that's not allowed in an app name
    .replace(/[^a-zA-Z0-9-_]/g, "-");

  const [appArc, env, readme, packageJson] = await Promise.all([
    fs.readFile(APP_ARC_PATH, "utf-8"),
    fs.readFile(EXAMPLE_ENV_PATH, "utf-8"),
    fs.readFile(README_PATH, "utf-8"),
    PackageJson.load(rootDirectory),
  ]);

  const newEnv = env.replace(
    /^SESSION_SECRET=.*$/m,
    `SESSION_SECRET="${getRandomString(16)}"`,
  );

  const initInstructions = `
- First run this stack's \`remix.init\` script and commit the changes it makes to your project.

  \`\`\`sh
  npx remix init
  git init # if you haven't already
  git add .
  git commit -m "Initialize project"
  \`\`\`
`;

  const newReadme = readme
    .replace(new RegExp("RemixGrungeStack", "g"), toLogicalID(APP_NAME))
    .replace(initInstructions, "");

  updatePackageJson({ APP_NAME, packageJson });

  await Promise.all([
    fs.writeFile(
      APP_ARC_PATH,
      appArc.replace("grunge-stack-template", APP_NAME),
    ),
    fs.writeFile(ENV_PATH, newEnv),
    fs.writeFile(README_PATH, newReadme),
    packageJson.save(),
    fs.copyFile(
      path.join(rootDirectory, "remix.init", "gitignore"),
      path.join(rootDirectory, ".gitignore"),
    ),
    fs.rm(path.join(rootDirectory, ".github", "ISSUE_TEMPLATE"), {
      recursive: true,
    }),
    fs.rm(path.join(rootDirectory, ".github", "workflows", "format-repo.yml")),
    fs.rm(path.join(rootDirectory, ".github", "workflows", "lint-repo.yml")),
    fs.rm(path.join(rootDirectory, ".github", "workflows", "no-response.yml")),
    fs.rm(path.join(rootDirectory, ".github", "dependabot.yml")),
    fs.rm(path.join(rootDirectory, ".github", "PULL_REQUEST_TEMPLATE.md")),
    fs.rm(path.join(rootDirectory, "LICENSE.md")),
  ]);

  await askSetupQuestions({ packageManager, rootDirectory }).catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      throw error;
    }
  });
};

async function askSetupQuestions({ packageManager, rootDirectory }) {
  const answers = await inquirer.prompt([
    {
      name: "validate",
      type: "confirm",
      default: false,
      message:
        "Do you want to run the build/tests/etc to verify things are setup properly?",
    },
  ]);
  const pm = getPackageManagerCommand(packageManager);

  if (answers.validate) {
    console.log(
      `Running the validate script to make sure everything was set up properly`,
    );
    execSync(pm.run("validate"), { cwd: rootDirectory, stdio: "inherit" });
  }

  console.log(
    `✅  Project is ready! Start development with "${pm.run("dev")}"`,
  );
}

module.exports = main;
