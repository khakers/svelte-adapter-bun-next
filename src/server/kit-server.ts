import type { SSRManifest, ServerInitOptions } from "@sveltejs/kit";
import { Server as KitServer } from "@sveltejs/kit";

export async function buildKitServer(manifest: SSRManifest, init_options?: Omit<ServerInitOptions, "env">) {
  const server = new KitServer(manifest);
  await server.init({ env: Bun.env as Record<string, string>, ...init_options });

  return server;
}
