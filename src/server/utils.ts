import env from "./env";

export function get_origin(headers: Headers): string {
  const protocol_header = env.PROTOCOL_HEADER.toLowerCase();
  const host_header = env.HOST_HEADER.toLowerCase();
  const port_header = env.PORT_HEADER.toLowerCase();

  const protocol = (protocol_header && headers.get(protocol_header)) || "https";
  const host = headers.get(host_header) || "localhost";
  const port = port_header && headers.get(port_header);

  if (port) {
    return `${protocol}://${host}:${port}`;
  }

  return `${protocol}://${host}`;
}
