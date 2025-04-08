import type { CompressOptions } from "./CompressOptions";

export declare type AdapterOptions = {
  /** Output directory for the built application (default: "build") */
  out?: string;
  /** Whether and how to compress static assets (default: false) */
  precompress?: boolean | CompressOptions;
};
