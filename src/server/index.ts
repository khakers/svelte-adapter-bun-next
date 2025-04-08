import env from "./env";
import { buildKitServer } from "./kit-server";
import { buildRoutes } from "./routes";
import { handleSSRRequest } from "./routes/ssr";
import { getManifestFile } from "./utils";

async function getBunServeConfig(): Promise<Parameters<typeof Bun.serve>[0]> {
  const { manifest } = await getManifestFile();
  const kitServer = await buildKitServer(manifest);

  return {
    port: env.PORT,
    hostname: env.HOST,
    maxRequestBodySize: env.BODY_SIZE_LIMIT,
    development: env.DEV_MODE,
    routes: await buildRoutes(),
    async fetch(req, srv) {
      return await handleSSRRequest(req, srv, kitServer);
    },
    error(e: Error) {
      console.error(e);

      return Response.json(
        {
          code: 500,
          message: "Oops! An unexpected error occurred.",
          error: e.message,
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
