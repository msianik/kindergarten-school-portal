# Project Rules for Anando Pathshala (আনন্দ পাঠশালা)

## MANDATORY END-OF-TURN AUTOMATION
Whenever code changes, fixes, or feature updates are completed in ANY chat session for this project:

1. **Deploy to Netlify (MANDATORY):**
   Execute the direct deployment script:
   ```powershell
   bun run deploy:netlify
   ```
   Ensure the build succeeds and uploads to `https://anandapathshala.netlify.app`.

2. **Commit and Push to GitHub (MANDATORY):**
   Stage all files (excluding `.env.local`), commit, and push:
   ```powershell
   git add -A
   git commit -m "feat/fix: <description>"
   git push origin main
   ```

3. **Status Reporting:**
   At the end of your response, always confirm both:
   - Netlify live deployment status for https://anandapathshala.netlify.app
   - GitHub commit ID and push status to `main`
