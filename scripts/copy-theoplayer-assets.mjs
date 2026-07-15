import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = resolve(projectRoot, "node_modules/theoplayer");
const targetDirectory = resolve(projectRoot, "public/theoplayer");
const files = [
  "THEOplayer.js",
  "THEOplayer.transmux.asmjs.js",
  "THEOplayer.transmux.js",
  "THEOplayer.transmux.wasm",
  "iframe.html",
  "theoplayer.d.js",
  "theoplayer.sw.js",
  "ui.css",
];

await rm(targetDirectory, { recursive: true, force: true });
await mkdir(targetDirectory, { recursive: true });
await Promise.all(
  files.map((file) => copyFile(resolve(sourceDirectory, file), resolve(targetDirectory, file)))
);
