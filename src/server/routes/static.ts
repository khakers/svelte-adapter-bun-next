import { existsSync } from "node:fs";
import path from "node:path";
import type { RouteReturn, RouteReturns } from "../types/RouteReturns";
import { getManifestFile } from "../utils";

export async function buildStaticRoute(folderPath: string, isClient = false): Promise<RouteReturns> {
  if (!existsSync(folderPath)) {
    console.warn("assets not exist, skipping serving static assets");
    return false;
  }

  const { manifest } = await getManifestFile();

  const appDir = manifest.appDir;
  const assets = manifest.assets;

  const appHandler: RouteReturn = {
    route: `/${appDir}/*`,
    handler: async (req) => {
      try {
        const pathname = new URL(req.url).pathname;
        const filepath = path.join(folderPath, pathname);

        const file = Bun.file(filepath);

        if (!(await file.exists())) {
          const body = JSON.stringify({
            code: 404,
            message: "File not found.",
          });
          return new Response(body, { status: 404 });
        }

        const headers = new Headers({
          "Content-Type": file.type,
        });

        if (isClient && pathname.startsWith(`/${manifest.appDir}/immutable/`)) {
          headers.set("cache-control", "public,max-age=31536000,immutable");
        }

        return new Response(await file.arrayBuffer(), {
          headers,
          status: 200,
        });
      } catch (e) {
        console.error(e);

        return Response.json(
          {
            code: 500,
            message: "Oops! Error occurred while serving static content.",
            error: (e as Error).message,
          },
          { status: 500 },
        );
      }
    },
  };

  const assetsHandler: RouteReturn[] = Array.from(assets).map((v) => ({
    route: `/${v}`,
    handler: async () => {
      try {
        const file = Bun.file(path.join(folderPath, v));

        if (!(await file.exists())) {
          return Response.json(
            {
              code: 404,
              message: "Asset not found.",
            },
            { status: 404 },
          );
        }

        const headers = new Headers({
          "Content-Type": file.type,
        });

        return new Response(await file.arrayBuffer(), {
          headers,
          status: 200,
        });
      } catch (e) {
        console.error(e);

        return Response.json(
          {
            code: 500,
            message: "Oops! Error occurred while serving static content.",
            error: (e as Error).message,
          },
          { status: 500 },
        );
      }
    },
  }));

  return [appHandler, ...assetsHandler];
}

export async function buildDisabledStaticRoute(): Promise<RouteReturns> {
  const { manifest } = await getManifestFile();

  const immutableDir = manifest.appDir;
  return [
    {
      route: `/${immutableDir}/immutable/*`,
      handler: async () => {
        return Response.json(
          {
            message: "Static assets serving is disabled.",
          },
          {
            status: 501,
          },
        );
      },
    },
  ];
}
