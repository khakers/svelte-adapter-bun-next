import type { RouterTypes } from "bun";
import { buildPrerenderRoutes } from "./prerender";
import { buildStaticRoute } from "./static";

type Routes = {
  [K in string]: RouterTypes.RouteValue<K>;
};

export function buildRoutes(): Routes {
  const routes: Routes = {};

  const staticFolderPath = "../client";
  const staticRoute = buildStaticRoute(staticFolderPath);

  if (staticRoute) {
    routes[staticRoute.route] = staticRoute.handler;
  }

  const prerenderFolderPath = "../prerendered";
  const prerenderRoutes = buildPrerenderRoutes(prerenderFolderPath);

  if (prerenderRoutes) {
    prerenderRoutes.map((v) => {
      routes[v.route] = v.handler;
    });
  }

  return routes;
}
