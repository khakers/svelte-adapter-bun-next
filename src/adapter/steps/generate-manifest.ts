import fs from "node:fs/promises";
import path from "node:path";
import type { Builder } from "@sveltejs/kit";

export async function generateManifest(builder: Builder, outDirectory: string) {
  const manifestContent = `export const manifest = ${builder.generateManifest({ relativePath: "./server" })};

export const prerendered = new Set(${JSON.stringify(builder.prerendered.paths)});
`;

  const manifestPath = path.join(outDirectory, "manifest.js");

  try {
    await fs.writeFile(manifestPath, manifestContent, "utf8");
    builder.log(`Manifest file generated at ${manifestPath}`);
  } catch (error) {
    builder.log.error(`Error writing manifest file: ${error}`);
    throw error;
  }
}
