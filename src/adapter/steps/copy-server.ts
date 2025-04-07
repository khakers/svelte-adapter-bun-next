import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Builder } from "@sveltejs/kit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_DIR = "../server";

function _copy(builder: Builder, outDirectory: string, filename: string) {
  const src = path.join(__dirname, SERVER_DIR, filename);
  const dest = path.join(outDirectory, filename);

  builder.copy(src, dest);
}

export function copyServer(builder: Builder, outDirectory: string) {
  _copy(builder, outDirectory, "index.js");
  _copy(builder, outDirectory, "index.js.jsc");
  _copy(builder, outDirectory, "index.js.map");
}
