import type { Adapter } from "@sveltejs/kit";

import { compressAll } from "./steps/compress";
import { copyAssets } from "./steps/copy-assets";
import { copyServer } from "./steps/copy-server";
import { generateManifest } from "./steps/generate-manifest";
import { createPackageJson } from "./steps/package-json";
import { patchServerWebsocketHandler } from "./steps/patch-server-ws";
import type { AdapterOptions } from "./types/AdapterOptions";

const ADAPTER_NAME = "adapter-bun";

/**
 * Create Bun Adapter
 * @param {AdapterOptions} [options] - Adapter options
 * @returns {Adapter} Returns an adapter object
 */
const adapter = (options?: AdapterOptions): Adapter => {
  return {
    name: ADAPTER_NAME,
    adapt: async (builder) => {
      const _options = { out: "build", ...options };

      // Step: Clean and create output directory
      builder.rimraf(_options.out);
      builder.mkdirp(_options.out);

      // Step: Copy assets
      builder.log.minor("Copying assets");
      copyAssets(builder, _options.out);

      // Step: Pre-compress
      if (_options.precompress) {
        builder.log.minor("Compressing assets");
        const basePath = builder.config.kit.paths.base;
        await compressAll([
          [`${_options.out}/client${basePath}`, _options.precompress],
          [`${_options.out}/prerendered${basePath}`, _options.precompress],
        ]);
      }

      // Step: Build server
      builder.log.minor("Building server");
      builder.writeServer(`${_options.out}/server`);

      // Step: Generate manifest file
      await generateManifest(builder, _options.out);

      // Step: Patch server for websocket support
      builder.log.minor("Patching server (websocket support)");
      patchServerWebsocketHandler(`${_options.out}/server`);

      // Step: Generate package.json with dependencies
      const { out, ...derivedOptions } = _options;
      await createPackageJson(builder, _options.out, "", derivedOptions);

      // Step: Copy server
      builder.log.minor("Copying server");
      copyServer(builder, _options.out);

      builder.log.success(`Start server with: bun run ./${_options.out}/index.js`);
    },
    supports: {
      read: () => true,
    },
  };
};

export default adapter;
