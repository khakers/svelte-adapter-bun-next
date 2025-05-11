import {existsSync} from "node:fs";
import path from "node:path";
import type {RouteReturn, RouteReturns} from "../types/RouteReturns";
import {getManifestFile} from "../utils";
import type {SSRManifest} from "@sveltejs/kit";

// TODO doesn't support additional filetypes that might be added to precompress
const PRECOMPRESSED_CONTENT_TYPES: Record<string, string> = {
  "html": "text/html",
  "js": "application/javascript",
  "json": "application/json",
  "css": "text/css",
  "svg": "image/svg+xml",
  "xml": "application/xml",
  "wasm": "application/wasm",
}


// Get the file from the path. returns a precompressed file if it exists and is accepted
async function getFile(path: string, brotli: boolean, gzip: boolean) {
  // check for precompressed files
  // return a precompressed file if exists and is accepted
  const brFile = Bun.file(path + ".br");
  const gzFile = Bun.file(path + ".gz");
  if (brotli && await brFile.exists()) {
    return brFile;
  } else if (gzip && await brFile.exists()) {
    return gzFile;
  } else {
    return Bun.file(path);
  }
}

async function serveAsset(folderPath: string, manifest: SSRManifest, req: Request) {
  try {
    const pathname = new URL(req.url).pathname;
    const filepath = path.join(folderPath, pathname);

    const acceptedEncoding = req.headers.get("accept-encoding") || "";

    const brotli = acceptedEncoding.includes("br") || acceptedEncoding.includes("brotli");
    const gzip = acceptedEncoding.includes("gzip");

    const file = await getFile(filepath, brotli, gzip);

    const eTag = `W/"${file.size}-${file.lastModified}"`;

    if (req.headers.get('if-none-match') === eTag) {
      return new Response(null, {
        status: 304
      });
    }

    if (req.headers.get('if-modified-since') !== null) {
      // return 304 if the file has not been modified since the if-modified-since date
      const ifModifiedSince = new Date(req.headers.get('if-modified-since') || 0);
      if (Math.floor(ifModifiedSince.getTime() / 1000) >= file.lastModified) {
        return new Response(null, {
          status: 304
        });
      }
    }

    const headers = new Headers({
      "ETag": eTag,
      "last-modified": new Date(file.lastModified).toUTCString(),
      "vary": "accept-encoding"
    });

    if (pathname.startsWith(`/${manifest.appPath}/immutable/`)) {
      headers.set('cache-control', 'public,max-age=31536000,immutable');
    }

    if (file.name?.slice(-3) === ".br") {
      headers.set("content-encoding", "br");
      // use the file extension that occurs before the .br
      headers.set("content-type", PRECOMPRESSED_CONTENT_TYPES[file.name?.slice(0, file.name.length - 3).split('.').pop() ?? ''] || "application/octet-stream");
    } else if (file.name?.slice(-3) === ".gz") {
      headers.set("content-encoding", 'gzip');
      headers.set("content-type", PRECOMPRESSED_CONTENT_TYPES[file.name?.slice(0, file.name.length - 3).split('.').pop() ?? ''] || "application/octet-stream");
    }

    return new Response(file, {
      headers,
      status: 200,
    });
  } catch (e) {
    console.error(e);

    return Response.json(
      {
        code: 500,
        message: "Oops! Error occurred while serving static content.",
        error: (e as Error).message,
      },
      {status: 500},
    );
  }
}

export async function buildStaticRoute(folderPath: string, isClient = false): Promise<RouteReturns> {
  if (!existsSync(folderPath)) {
    console.warn("assets directory does not exist, skipping serving static assets");
    return false;
  }

  const { manifest } = await getManifestFile();

  const appDir = manifest.appDir;
  const assets = manifest.assets;

  const appHandler: RouteReturn = {
    route: `/${appDir}/*`,
    handler: serveAsset.bind(null, folderPath, manifest),
  };

  const assetsHandler: RouteReturn[] = Array.from(assets).map((v) => ({
    route: `/${v}`,
    handler: serveAsset.bind(null, folderPath, manifest),
  }));

  return [appHandler, ...assetsHandler];
}

export async function buildDisabledStaticRoute(): Promise<RouteReturns> {
  const { manifest } = await getManifestFile();

  const immutableDir = manifest.appDir;
  return [
    {
      route: `/${immutableDir}/immutable/*`,
      handler: async () => {
        return Response.json(
          {
            message: "Static asset serving is disabled.",
          },
          {
            status: 501,
          },
        );
      },
    },
  ];
}
