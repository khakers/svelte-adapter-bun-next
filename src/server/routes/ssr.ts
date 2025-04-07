import type { Server as KitServer } from "@sveltejs/kit";
import env from "../env";
import { get_origin } from "../utils";

export function handleSSRRequest(originalRequest: Request, server: KitServer): Promise<Response> {
  const address_header = env.ADDRESS_HEADER.toLowerCase();
  const host_header = env.HOST_HEADER.toLowerCase();

  const baseOrigin = env.ORIGIN || get_origin(originalRequest.headers);
  const url = originalRequest.url.slice(originalRequest.url.split("/", 3).join("/").length);

  const request = new Request(`${baseOrigin}${url}`, {
    method: originalRequest.method,
    headers: originalRequest.headers,
    body: originalRequest.body,
    redirect: originalRequest.redirect,
    // ...originalRequest,
  });

  if (address_header && request.headers.get(host_header) !== "127.0.0.1" && !request.headers.has(address_header)) {
    throw new Error(`Address header was specified with ADDRESS_HEADER=${address_header} but is absent from request`);
  }

  return server.respond(request, {
    getClientAddress() {
      if (address_header && request.headers.get(host_header) !== "127.0.0.1") {
        const value = request.headers.get(address_header) || "";

        if (address_header === "x-forwarded-for") {
          const addresses = value.split(",");
          const xff_depth = env.XFF_DEPTH;

          if (xff_depth > addresses.length) {
            throw new Error(`XFF_DEPTH is ${xff_depth}, but only found ${addresses.length} addresses`);
          }

          const index = Math.min(addresses.length - xff_depth, addresses.length - 1);
          const address = addresses[index];
          if (!address) {
            throw new Error(`XFF_DEPTH is ${xff_depth}, but only found ${addresses.length} addresses`);
          }
          return address.trim();
        }

        return value;
      }

      return "127.0.0.1";
    },
    platform: {
      isBun: () => true,
    },
  });
}
