# svelte-adapter-bun-next

A modern [adapter](https://kit.svelte.dev/docs/adapters) for SvelteKit apps that generates a standalone [Bun](https://github.com/oven-sh/bun) server.

This is basically ported from [svelte-adapter-bun](https://github.com/gornostay25/svelte-adapter-bun).

## :electric_plug: Features

- ✅ Full TypeScript support
- ✅ Up-to-date Bun features
- ✅ Safe `env` parsing and validation
- ✅ Route-specific handlers

## :zap: Usage

Install with `bun add -d svelte-adapter-bun-next`, then add the adapter to your `svelte.config.js`:

```js
// svelte.config.js
import adapter from "svelte-adapter-bun-next";

export default {
  kit: {
    adapter: adapter(),
  },
};
```

After building the server (`vite build`), use the following command to start:

```
# go to build directory
cd build/

# run Bun
bun run start
```

## :gear: Options

The adapter can be configured with various options:

```js
// svelte.config.js
import adapter from "svelte-adapter-bun-next";
export default {
  kit: {
    adapter: adapter({
      out: "build",
      // precompress: true,
      precompress: {
        brotli: true,
        gzip: true,
        files: ["htm", "html"],
      },
    }),
  },
};
```

### out

The directory to build the server to. Default: `build` — i.e. `bun run start` would start the server locally after it has been created.

### precompress

Enables precompressing using gzip and brotli for assets and prerendered pages. Default: `false`.

#### brotli

Enable brotli precompressing. Default: `false`.

#### gzip

Enable gzip precompressing. Default: `false`.

### development

This enables bun's error page. Default: `false`

## :desktop_computer: Environment variables

> Bun automatically reads configuration from `.env.local`, `.env.development` and `.env`. ([Documentation](https://bun.sh/docs/runtime/env))

Full schema is defined in [`env.ts`](https://github.com/TheOrdinaryWow/svelte-adapter-bun-next/blob/main/src/server/env.ts), parsed and validated using [`t3-env`](https://github.com/t3-oss/t3-env) and [`zod`](https://github.com/colinhacks/zod).

### `PORT` and `HOST`

Specify the port and host to listen on.

Default: `0.0.0.0`, `3000`

### `BODY_SIZE_LIMIT`

The maximum request body size to accept in bytes including while streaming.

Accepted inputs:

- Raw number in bytes, e.g. `1048576`.
- String with a unit suffix (`K`, `M`, `G`), e.g. `1M`.
- Literal string `"Infinity"` or number `0` to disable body size limit.

Default: `512K`

### `ORIGIN`, `PROTOCOL_HEADER` and `HOST_HEADER`

HTTP doesn't give SvelteKit a reliable way to know the URL that is currently being requested. The simplest way to tell SvelteKit where the app is being served is to set the `ORIGIN` environment variable.

With this, a request for the `/stuff` pathname will correctly resolve to `https://my.site/stuff`. Alternatively, you can specify headers that tell SvelteKit about the request protocol and host, from which it can construct the origin URL.

> [`x-forwarded-proto`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto) and [`x-forwarded-host`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Host) are de facto standard headers that forward the original protocol and host if you're using a reverse proxy (think load balancers and CDNs). You should only set these variables if your server is behind a trusted reverse proxy; otherwise, it'd be possible for clients to spoof these headers.

Default: `http://localhost:3000`, `X-Forwarded-Proto`, `X-Forwarded-Host`

### `DEV_MODE`
This enables bun's error page.

Default: `false`

## Acknowledgements

- [svelte-adapter-bun](https://github.com/gornostay25/svelte-adapter-bun)

## License

[MIT](LICENSE) © [TheOrdinaryWow](https://github.com/TheOrdinaryWow)
