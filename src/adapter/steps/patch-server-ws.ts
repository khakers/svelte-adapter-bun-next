import fs from "node:fs/promises";
import path from "node:path";

export async function patchServerWebsocketHandler(out: string): Promise<void> {
  try {
    const serverFile = path.join(out, "index.js");
    const src = await fs.readFile(serverFile, "utf-8");

    // Add handleWebsocket hook
    const regexGetHook = /(this\.#options\.hooks\s+=\s+{)\s+(handle:)/gm;
    const substrGetHook = "$1 \nhandleWebsocket: module.handleWebsocket || null,\n$2";

    // Add websocket method
    const regexSetHook = /(this\.#options\s+=\s+options;)/gm;
    const substrSetHook = "$1\nthis.websocket = () => this.#options.hooks.handleWebsocket;";

    // Apply patches
    const patchedContent = src.replace(regexGetHook, substrGetHook).replace(regexSetHook, substrSetHook);

    await fs.writeFile(serverFile, patchedContent, "utf-8");
  } catch (e) {
    console.error(`Error patching server for WebSocket support: ${(e as Error).message}`);
    throw e;
  }
}
