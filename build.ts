import { copyFile, mkdir, rm } from "node:fs/promises";
import getDtsBunPlugin from "./src/build/bun-dts-plugin";

// clean directory
await rm("./dist", { recursive: true, force: true });

// build adapter
await Bun.build({
  entrypoints: ["src/adapter/index.ts"],
  root: "src/adapter",
  outdir: "dist/adapter",
  splitting: true,
  packages: "bundle",
  format: "esm",
  target: "node",
  external: ["@sveltejs/kit"],
  minify: false,
  sourcemap: "none",
  plugins: [getDtsBunPlugin()],
});

// build server
await Bun.build({
  entrypoints: ["src/server/index.ts"],
  root: "src/server",
  outdir: "dist/server",
  splitting: true,
  packages: "bundle",
  env: "NODE_ENV*",
  target: "bun",
  minify: { whitespace: true },
  sourcemap: "external",
});
await copyFile("src/server/.env.example", "dist/adapter/.env.example");
