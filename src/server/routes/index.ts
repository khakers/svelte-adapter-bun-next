import path from "node:path";
import env from "../env";
import type { Routes } from "../types/Routes";
import { __dirname } from "../utils";
import { buildPrerenderRoutes } from "./prerender";
import { buildDisabledStaticRoute, buildStaticRoute } from "./static";

export async function buildRoutes(): Promise<Routes> {
  const routes: Routes = {};

  const staticFolderPath = path.resolve(__dirname(), "client");
  const staticRoute = env.ASSETS ? await buildStaticRoute(staticFolderPath) : await buildDisabledStaticRoute();

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
