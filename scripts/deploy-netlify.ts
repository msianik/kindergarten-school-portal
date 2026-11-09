import { existsSync, readFileSync, unlinkSync } from "fs";
import { join } from "path";

// Read environment variables from process or .env.local
let token = process.env.NETLIFY_AUTH_TOKEN;
let siteId = process.env.NETLIFY_SITE_ID;

if (!token || !siteId) {
  const envLocalPath = join(process.cwd(), ".env.local");
  if (existsSync(envLocalPath)) {
    const lines = readFileSync(envLocalPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("NETLIFY_AUTH_TOKEN=")) {
        token = trimmed.replace("NETLIFY_AUTH_TOKEN=", "").trim();
      } else if (trimmed.startsWith("NETLIFY_SITE_ID=")) {
        siteId = trimmed.replace("NETLIFY_SITE_ID=", "").trim();
      }
    }
  }
}

if (!token || !siteId) {
  console.error("❌ NETLIFY_AUTH_TOKEN or NETLIFY_SITE_ID is missing!");
  process.exit(1);
}

console.log("🔨 Building production bundle...");
const buildProc = Bun.spawnSync(["bun", "run", "build"]);
if (buildProc.exitCode !== 0) {
  console.error("❌ Build failed:", buildProc.stderr.toString());
  process.exit(1);
}
console.log("✅ Build finished successfully.");

console.log("📦 Compressing dist folder for deployment...");
const zipFile = join(process.cwd(), "dist.zip");
if (existsSync(zipFile)) {
  unlinkSync(zipFile);
}

// Compress using PowerShell on Windows
const zipProc = Bun.spawnSync([
  "powershell",
  "-NoProfile",
  "-Command",
  `Compress-Archive -Path dist/* -DestinationPath "${zipFile}" -Force`,
]);

if (zipProc.exitCode !== 0 || !existsSync(zipFile)) {
  console.error("❌ Failed to create dist.zip:", zipProc.stderr.toString());
  process.exit(1);
}

console.log("🚀 Deploying directly to Netlify (Site ID:", siteId, ")...");
const zipBytes = readFileSync(zipFile);

try {
  const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/zip",
    },
    body: zipBytes,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Netlify API responded with ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as any;
  console.log("🎉 Successfully deployed to Netlify!");
  console.log(`🌐 Live URL: ${data.ssl_url || "https://anandapathshala.netlify.app"}`);
  console.log(`🆔 Deploy ID: ${data.id}`);
  console.log(`⚡ Deploy State: ${data.state}`);
} catch (err: any) {
  console.error("❌ Deployment failed:", err.message);
  process.exit(1);
} finally {
  if (existsSync(zipFile)) {
    unlinkSync(zipFile);
  }
}
