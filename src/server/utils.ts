import path from "node:path";
import { fileURLToPath } from "bun";
import env from "./env";
import type { Manifest } from "./types/Manifest";

export function __dirname() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  return __dirname;
}

export async function getManifestFile() {
  try {
    const manifestPath = path.resolve(__dirname(), "manifest.js");
    // @ts-ignore
    const manifestModule = await import(manifestPath);

    return {
      manifest: manifestModule.manifest,
      prerendered: manifestModule.prerendered,
    } as Manifest;
  } catch (e) {
    throw new Error(`Unable to import manifest.js: ${e}`);
  }
}

export function get_origin(headers: Headers): string {
  const protocol_header = env.PROTOCOL_HEADER.toLowerCase();
  const host_header = env.HOST_HEADER.toLowerCase();
  const port_header = env.PORT_HEADER.toLowerCase();

  const protocol = (protocol_header && headers.get(protocol_header)) || "https";
  const host = headers.get(host_header) || "localhost";
  const port = port_header && headers.get(port_header);

  if (port) {
    return `${protocol}://${host}:${port}`;
  }

  return `${protocol}://${host}`;
}
