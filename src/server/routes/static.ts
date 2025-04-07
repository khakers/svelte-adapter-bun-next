import { existsSync } from "node:fs";
import path from "node:path";
import type { SSRManifest } from "@sveltejs/kit";

export function buildStaticRoute(
  folderPath: string,
  isClient = false,
): { route: string; handler: (req: Request) => Response | Promise<Response> } | false {
  if (!existsSync(folderPath)) {
    return false;
  }

  const { manifest }: { manifest: SSRManifest } =
    process.env.NODE_ENV === "production" ? require("./manifest.js").prerendered_routes : {};

  const appDir = manifest.appDir;

  return {
    route: `/${appDir}/*`,
    handler: async (req) => {
      const pathname = new URL(req.url).pathname;
      const filepath = path.join(folderPath, pathname);

      if (!existsSync(filepath)) {
        const body = JSON.stringify({
          code: 404,
          message: "File not found.",
        });
        return new Response(body, { status: 404 });
      }

      try {
        const file = Bun.file(filepath);

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
        console.log(e);

        return Response.json(
          {
            code: 500,
            message: "Oops! Error occurred while serving static content.",
            error: e,
          },
          { status: 500 },
        );
      }
    },
  };
}
