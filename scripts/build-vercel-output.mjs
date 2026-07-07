import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "dist-vercel");
const websiteDist = path.join(root, "artifacts/website/dist");
const appDist = path.join(root, "artifacts/trustkeyper/dist");

const combined =
  process.env.COMBINED_MARKETING_DEPLOY === "1" ||
  process.env.VERCEL_GIT_COMMIT_REF === "staging";

function rmrf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const sourcePath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

rmrf(outDir);
fs.mkdirSync(outDir, { recursive: true });

if (combined) {
  console.log("Building combined marketing + app output for staging...");
  execSync("pnpm --filter @workspace/website run build", { cwd: root, stdio: "inherit" });
  execSync("pnpm --filter @workspace/trustkeyper run build", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, BASE_PATH: "/_app/" },
  });
  if (!fs.existsSync(path.join(websiteDist, "index.html"))) {
    throw new Error("Marketing website build missing index.html");
  }
  if (!fs.existsSync(path.join(appDist, "index.html"))) {
    throw new Error("App build missing index.html");
  }
  copyDir(websiteDist, outDir);
  copyDir(appDist, path.join(outDir, "_app"));
} else {
  console.log("Building app-only output...");
  execSync("pnpm --filter @workspace/trustkeyper run build", { cwd: root, stdio: "inherit" });
  if (!fs.existsSync(path.join(appDist, "index.html"))) {
    throw new Error("App build missing index.html");
  }
  copyDir(appDist, outDir);
}

console.log(`Vercel output ready at ${outDir} (combined=${combined})`);
