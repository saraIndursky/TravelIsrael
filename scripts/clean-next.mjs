import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const targets = [".next", join("node_modules", ".cache")];

for (const dir of targets) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    console.log(`Removed ${dir}`);
  }
}

console.log("Cache cleared — start with: npm run dev");
