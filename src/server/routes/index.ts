import path from "node:path";
import type { RouterTypes } from "bun";
import { __dirname } from "../utils";
import { buildPrerenderRoutes } from "./prerender";
import { buildStaticRoute } from "./static";

type Routes = {
  [K in string]: RouterTypes.RouteValue<K>;
};

export async function buildRoutes(): Promise<Routes> {
  const routes: Routes = {};

  const staticFolderPath = path.resolve(__dirname(), "client");
  const staticRoute = await buildStaticRoute(staticFolderPath);

  if (staticRoute) {
    staticRoute.map((v) => {
      routes[v.route] = v.handler;
    });
  }

  const prerenderFolderPath = path.resolve(__dirname(), "prerendered");
  const prerenderRoutes = await buildPrerenderRoutes(prerenderFolderPath);

  if (prerenderRoutes) {
    prerenderRoutes.map((v) => {
      routes[v.route] = v.handler;
    });
  }

  return routes;
}
