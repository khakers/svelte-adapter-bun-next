import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/{adapter,server}/index.ts"],
  project: ["src/**/*.ts"],
};

export default config;
