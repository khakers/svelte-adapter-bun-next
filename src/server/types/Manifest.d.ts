import type { SSRManifest } from "@sveltejs/kit";

export declare type Manifest = {
  manifest: SSRManifest;
  prerendered: Set<string>;
};
