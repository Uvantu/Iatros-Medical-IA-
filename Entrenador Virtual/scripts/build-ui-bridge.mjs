import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

await build({
  entryPoints: [path.join(root, "src/ui/browser-entry.js")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  outfile: path.join(root, "ui-bridge.js"),
  banner: {
    js: `/* Generated from Entrenador Virtual/src/ui/browser-entry.js - do not edit manually */`
  }
});

console.log("ui-bridge.js generado correctamente.");
