import { createReadStream, createWriteStream, existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import zlib from "node:zlib";
import glob from "tiny-glob";

import type { CompressOptions } from "../types/CompressOptions";

const pipe = promisify(pipeline);

export async function compressAll(to_compress: Parameters<typeof compress>[]) {
  await Promise.all(to_compress.map((params) => compress(...params)));
}

async function compress(directory: string, options: boolean | CompressOptions) {
  if (!existsSync(directory)) {
    return;
  }

  // Convert boolean options to object
  const optionsObj = typeof options === "boolean" ? {} : options;

  // Get file extensions to compress
  const filesExt = optionsObj.files ?? ["html", "js", "json", "css", "svg", "xml", "wasm"];

  // Find matching files
  const files = await glob(`**/*.{${filesExt.join(",")}}`, {
    cwd: directory,
    dot: true,
    absolute: true,
    filesOnly: true,
  });

  // Determine compression formats to use
  const doBr = options === true || optionsObj.brotli === true;
  const doGz = options === true || optionsObj.gzip === true;

  // Compress files in parallel
  try {
    const compressionTasks = files.flatMap((file) => {
      const tasks = [];
      if (doGz) tasks.push(compress_file(file, "gz"));
      if (doBr) tasks.push(compress_file(file, "br"));
      return tasks;
    });

    await Promise.all(compressionTasks);
  } catch (error) {
    console.error(`Error compressing files: ${(error as Error).message}`);
  }
}

async function compress_file(file: string, format: "gz" | "br" = "gz") {
  try {
    const fileSize = statSync(file).size;

    // Create appropriate compressor
    const compress =
      format === "br"
        ? zlib.createBrotliCompress({
            params: {
              [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
              [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
              [zlib.constants.BROTLI_PARAM_SIZE_HINT]: fileSize,
            },
          })
        : zlib.createGzip({ level: zlib.constants.Z_BEST_COMPRESSION });

    // Setup stream pipeline
    const source = createReadStream(file);
    const destination = createWriteStream(`${file}.${format}`);

    await pipe(source, compress, destination);
  } catch (error) {
    console.error(`Error compressing ${file} to ${format}: ${(error as Error).message}`);
    // Re-throw or handle as needed
    throw error;
  }
}
