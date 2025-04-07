import type { SSRManifest } from "@sveltejs/kit";
import env from "./env";
import { buildKitServer } from "./kit-server";
import { buildRoutes } from "./routes";
import { handleSSRRequest } from "./routes/ssr";

async function getBunServeConfig(): Promise<Parameters<typeof Bun.serve>[0]> {
  const { manifest }: { manifest: SSRManifest } = process.env.NODE_ENV === "production" ? require("./manifest.js").prerendered_routes : {};

  const kitServer = await buildKitServer(manifest);

  return {
    port: env.PORT,
    hostname: env.HOST,
    maxRequestBodySize: env.BODY_SIZE_LIMIT,
    development: env.DEV_MODE,
    routes: buildRoutes(),
    async fetch(req: Request) {
      return await handleSSRRequest(req, kitServer);
    },
    error(e: Error) {
      console.error(e);

      return Response.json(
        {
          code: 500,
          message: "Oops! An unexpected error occurred.",
          error: e,
        },
        { status: 500 },
      );
    },
  };
}

async function serve() {
  console.info(`Listening on ${env.HOST}:${env.PORT}`);
  Bun.serve(await getBunServeConfig());
}

export default serve();
