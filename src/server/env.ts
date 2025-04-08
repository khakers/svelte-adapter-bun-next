import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const env = createEnv({
  server: {
    // Server binding address
    HOST: z.union([z.string().ip(), z.string().url()]).default("0.0.0.0"),
    // Server port number
    PORT: z.coerce.number().int().gte(1).lte(65535).default(3000),
    // Maximum request body size (optional)
    BODY_SIZE_LIMIT: z.coerce.number().int().gt(0).optional(),
    // Application origin URL
    ORIGIN: z.string().url().default("http://localhost:3001"),
    // Header for forwarded protocol
    PROTOCOL_HEADER: z.string().default("X-Forwarded-Proto"),
    // Header for forwarded host
    HOST_HEADER: z.string().default("X-Forwarded-Host"),
    // Header for forwarded port
    PORT_HEADER: z.string().default("X-Forwarded-Port"),
    // Enable static asset serving
    ASSETS: z
      .preprocess((v) => {
        return typeof v === "string" ? v.toLowerCase() === "true" || v === "1" : v;
      }, z.boolean())
      .default(true),
    // Enable development mode
    DEV_MODE: z
      .preprocess((v) => {
        return typeof v === "string" ? v.toLowerCase() === "true" || v === "1" : v;
      }, z.boolean())
      .default(false),
  },
  shared: {
    // Node environment
    NODE_ENV: z.string().default("production"),
  },
  runtimeEnv: Bun.env,
});

export default env;
