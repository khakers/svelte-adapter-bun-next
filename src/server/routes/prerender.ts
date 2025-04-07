import { existsSync } from "node:fs";
import path from "node:path";

export function buildPrerenderRoutes(
  folderPath: string,
): { route: string; handler: (req: Request) => Response | Promise<Response> }[] | false {
  if (!existsSync(folderPath)) {
    return false;
  }

  const { prerendered }: { prerendered: Set<string> } =
    process.env.NODE_ENV === "production" ? require("./manifest.js").prerendered_routes : {};

  return Array.from(prerendered).map((v) => {
    return {
      route: v,
      handler: async () => {
        const filepath = path.join(folderPath, "pages", `${v}.html`);

        if (!existsSync(filepath)) {
          const body = JSON.stringify({
            code: 404,
            message: "Page not found.",
          });
          return new Response(body, { status: 404 });
        }

        try {
          const file = Bun.file(filepath);

          const headers = new Headers({
            "Content-Type": file.type,
          });

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
  });
}
