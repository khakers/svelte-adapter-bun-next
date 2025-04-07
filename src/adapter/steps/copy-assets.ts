import type { Builder } from "@sveltejs/kit";

export function copyAssets(builder: Builder, outDirectory: string) {
  builder.writeClient(`${outDirectory}/client${builder.config.kit.paths.base}`);
  builder.writePrerendered(`${outDirectory}/prerendered${builder.config.kit.paths.base}`);
}
