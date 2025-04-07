import type { SSRManifest } from "@sveltejs/kit";

export type Manifest = {
  manifest: SSRManifest;
  prerendered: Set<string>;
};
