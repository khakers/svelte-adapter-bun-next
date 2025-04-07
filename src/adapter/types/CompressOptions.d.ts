/**
 * Options for asset compression
 */
export declare type CompressOptions = {
  /** File extensions to compress (default: ["html", "js", "json", "css", "svg", "xml", "wasm"]) */
  files?: string[];
  /** Whether to use Brotli compression (default: false) */
  brotli?: boolean;
  /** Whether to use Gzip compression (default: false) */
  gzip?: boolean;
};
