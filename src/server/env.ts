import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const env = createEnv({
  server: {
    HOST: z.union([z.string().ip(), z.string().url()]).default("0.0.0.0"),
    PORT: z.coerce.number().int().gte(1).lte(65535).default(3000),
    ORIGIN: z.string().url().default("http://localhost:3001"),
    XFF_DEPTH: z.coerce.number().int().gt(0).default(1),
    BODY_SIZE_LIMIT: z.coerce.number().int().gt(0).optional(),
    ADDRESS_HEADER: z.string().default("X-Forwarded-For"),
    PROTOCOL_HEADER: z.string().default("X-Forwarded-Proto"),
    HOST_HEADER: z.string().default("X-Forwarded-Host"),
    PORT_HEADER: z.string().default("X-Forwarded-Port"),
    ASSETS: z.boolean().default(true),
    DEV_MODE: z.boolean().default(false),
  },
  shared: {
    NODE_ENV: z.string().default("production"),
  },
  runtimeEnv: process.env,
});

export default env;
