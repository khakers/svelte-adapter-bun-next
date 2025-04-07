import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Builder } from "@sveltejs/kit";

type Dependencies = Record<string, string>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const files = path.join(__dirname, "files");

export async function createPackageJson(
  builder: Builder,
  out: string,
  envPrefix: string,
  buildOptions: Record<string, unknown>,
): Promise<void> {
  // Read original package.json
  let pkg: Record<string, unknown> = {};
  try {
    const packageJsonContent = await fs.readFile("package.json", "utf-8");
    pkg = JSON.parse(packageJsonContent);
  } catch (error) {
    builder.log.warn(`Could not read package.json: ${(error as Error).message}`);
  }

  // Copy files with replacements
  builder.copy(files, out, {
    replace: {
      SERVER: "./server/index.js",
      MANIFEST: "./manifest.js",
      ENV_PREFIX: JSON.stringify(envPrefix),
      dotENV_PREFIX: envPrefix,
      BUILD_OPTIONS: JSON.stringify(buildOptions),
    },
  });

  // Prepare new package.json
  const packageData = {
    name: (pkg.name as string) || "bun-sveltekit-app",
    version: (pkg.version as string) || "0.0.0",
    type: "module",
    private: true,
    main: "index.js",
    scripts: {
      start: "bun run ./index.js",
    },
    dependencies: {
      ...(pkg.dependencies || {}),
    } satisfies Dependencies,
  };

  // Write new package.json
  await fs.writeFile(`${out}/package.json`, JSON.stringify(packageData, null, "\t"), "utf-8");
}
