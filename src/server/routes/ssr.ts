import type { Server as KitServer } from "@sveltejs/kit";
import env from "../env";
import { get_origin } from "../utils";

export function handleSSRRequest(
  originalRequest: Request,
  bun_server: Bun.Server,
  kit_server: KitServer,
): Promise<Response> {
  const baseOrigin = env.ORIGIN || get_origin(originalRequest.headers);
  const url = originalRequest.url.slice(originalRequest.url.split("/", 3).join("/").length);

  const request = new Request(`${baseOrigin}${url}`, {
    method: originalRequest.method,
    headers: originalRequest.headers,
    body: originalRequest.body,
    redirect: originalRequest.redirect,
    // ...originalRequest,
  });

  return kit_server.respond(request, {
    getClientAddress() {
      return bun_server.requestIP(request)?.address || "127.0.0.1";
    },
    platform: {
      isBun: () => true,
    },
  });
}
