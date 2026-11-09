import { existsSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import AdmZip from "adm-zip";

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
execSync("bun run build", { stdio: "inherit" });
console.log("✅ Build finished successfully.");

// Clean any leftover .git inside dist
const distGit = join(process.cwd(), "dist", ".git");
if (existsSync(distGit)) {
  rmSync(distGit, { recursive: true, force: true });
}

console.log("📦 Creating POSIX-compliant zip archive with AdmZip...");
const zip = new AdmZip();
zip.addLocalFolder(join(process.cwd(), "dist"));
const zipBuffer = zip.toBuffer();
console.log(`📦 Archive created (${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB) with proper forward-slash paths.`);

console.log(`🚀 Deploying directly to Netlify (Site ID: ${siteId})...`);
try {
  const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/zip",
    },
    body: zipBuffer,
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
}
