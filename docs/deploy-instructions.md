Deploy instructions — GitHub + Netlify

This file shows step-by-step instructions to create a GitHub repository for this project, push the current code, and connect Netlify to deploy from GitHub.

Prerequisites
- Git installed and on PATH
- GitHub CLI (`gh`) installed and authenticated (run `gh auth login`)
- Netlify account
- Netlify CLI optionally installed for local dev (`npm install -g netlify-cli`)

1) Create GitHub repository (automated)
- Run the helper PowerShell script in the repo root to create a new repo and push the current files. The script uses `gh` and `git`.

PowerShell (run from this project root):
```powershell
.
\scripts\create_and_push_repo.ps1 -RepoName "bingo-nights" -Visibility public
```

The script will:
- initialize git if needed
- add all files, commit, create a GitHub repo via `gh`, and push to origin

2) Connect Netlify
- Go to https://app.netlify.com/sites -> "Add new site" -> "Import an existing project"
- Choose GitHub and authorize if needed
- Select the `bingo-nights` repository and the desired branch (usually `main` or `master`)
- Set build settings:
  - Build command: (none) or as required
  - Publish directory: `web-admin` (Netlify will host serverless functions and static)
  - Functions directory: `web-admin/netlify/functions`
- Deploy site. Netlify will run the deploy and show logs.

3) Environment variables (very important)
In Netlify site settings -> Build & deploy -> Environment:
- SUPABASE_URL = https://your-project.supabase.co
- SUPABASE_ANON_KEY = your-public-anon-key (used for client apps if you host anything server-side that needs it)
- SUPABASE_SERVICE_ROLE_KEY = your-service-role-key (ONLY set this for server-side functions; keep this secret)

4) Optional: Use Netlify CLI locally
```powershell
netlify login
netlify dev
```

Security notes
- Never commit service role keys to source control. Always use Netlify environment variable settings or a secrets manager.
- Use `SUPABASE_SERVICE_ROLE_KEY` only in server-side functions. Do not expose it to the mobile client.

If you'd like, I can:
- Run the `gh` commands for you (I cannot access your GitHub account; you'll need to run the script locally), or
- Create a GitHub repo via a personal access token (you'll need to provide it) — not recommended here.

Next steps after linking Netlify
- Configure automatic deploys on pushes to `main`.
- Add Netlify deploy badges to README.
- Add CI tests that run on push.

CI / GitHub Actions
 - A GitHub Actions workflow has been added at `.github/workflows/netlify-deploy.yml` which uses the Netlify CLI to deploy the `web-admin` folder and functions on push to `main` or `master`.
 - Required repository secrets (set in GitHub repo -> Settings -> Secrets):
   - `NETLIFY_AUTH_TOKEN` — a Netlify personal access token. Create one at https://app.netlify.com/user/applications#personal-access-tokens
   - `NETLIFY_SITE_ID` — the Netlify Site ID for your site. Find it in Site settings -> Site information -> Site details -> API ID.

How to get `NETLIFY_SITE_ID`
 - After creating the site (importing the repo) in Netlify, open the Site settings -> Site information. Copy the "API ID" value and paste it into the `NETLIFY_SITE_ID` GitHub secret.

After adding both secrets, pushes to `main` will automatically trigger the workflow and deploy to Netlify.
