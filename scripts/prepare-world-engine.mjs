// Keep Three.js same-origin: the site CSP deliberately disallows external scripts.
// The exact version matches the previously used CDN module. No lockfile mutation.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const destination = resolve("public/world-engine/three.module.js");
const directory = mkdtempSync(join(tmpdir(), "north-mob-three-"));
try {
  const packed = execFileSync("npm", ["pack", "three@0.165.0", "--silent", "--pack-destination", directory], {
    encoding: "utf8", timeout: 120000
  }).trim().split("\n").at(-1);
  if (!packed?.endsWith(".tgz")) throw new Error("Three.js npm package could not be downloaded");
  const module = execFileSync("tar", ["-xOzf", join(directory, packed), "package/build/three.module.js"], {
    maxBuffer: 12 * 1024 * 1024
  });
  if (!module.length) throw new Error("Three.js module was empty");
  mkdirSync(resolve("public/world-engine"), { recursive: true });
  writeFileSync(destination, module);
  console.log("Prepared same-origin Three.js module:", module.length, "bytes");
} finally {
  rmSync(directory, { recursive: true, force: true });
}
