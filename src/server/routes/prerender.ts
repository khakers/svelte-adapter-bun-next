import { existsSync } from "node:fs";
import path from "node:path";
import type { RouteReturns } from "../types/RouteReturns";
import { getManifestFile } from "../utils";

export async function buildPrerenderRoutes(folderPath: string): Promise<RouteReturns> {
  if (!existsSync(folderPath)) {
    return false;
  }

  const { prerendered } = await getManifestFile();

  return Array.from(prerendered).map((v) => ({
    route: v,
    handler: async () => {
      try {
        const file = Bun.file(path.join(folderPath, `${v}.html`));

        if (!(await file.exists())) {
          const body = JSON.stringify({
            code: 404,
            message: "Page not found.",
          });
          return new Response(body, { status: 404 });
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
}
