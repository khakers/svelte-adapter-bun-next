import type { SSRManifest, ServerInitOptions } from "@sveltejs/kit";
import type { Server as ServerType } from "@sveltejs/kit";

const SERVER_PATH = "server";

export async function buildKitServer(manifest: SSRManifest, init_options?: Omit<ServerInitOptions, "env">) {
  const { Server } = require(`./${SERVER_PATH}/index.js`) as { Server: new (manifest: SSRManifest) => ServerType };

  const server = new Server(manifest);
  await server.init({ env: Bun.env as Record<string, string>, ...init_options });

  return server;
}
