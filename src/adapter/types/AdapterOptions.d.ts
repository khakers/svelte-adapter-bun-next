import type { CompressOptions } from "./CompressOptions";

export declare type AdapterOptions = {
  /** Output directory for the built application (default: "build") */
  out?: string;
  /** Whether and how to compress static assets (default: false) */
  precompress?: boolean | CompressOptions;
  /** Prefix for environment variables (default: "") */
  // envPrefix?: string;
  /** Whether to build in development mode (default: false) */
  development?: boolean;
  /** Whether to use dynamic origin resolution (default: false) */
  dynamic_origin?: boolean;
  /** Depth to use for X-Forwarded-For headers (default: 1) */
  xff_depth?: number;
  /** Whether to serve static assets (default: true) */
  assets?: boolean;
};
