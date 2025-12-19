# Deploy to GitHub + Netlify (automatic from VS Code)

This project can be deployed to Netlify and automatically updated when you push from VS Code to GitHub.

Steps (quick):

1) Initialize Git (if not already):

```bash
git init
git add .
git commit -m "Initial commit"
```

2) Create a GitHub repository and push (using `gh` CLI) or add a remote manually:

Using `gh`:

```bash
# install GitHub CLI if needed: https://cli.github.com/
gh repo create YOUR_USERNAME/REPO_NAME --public --source=. --remote=origin --push
```

Or manually:

```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

3) Create a Netlify site & get credentials (two options):

- Option A (recommended, UI):
  - Go to https://app.netlify.com/sites
  - Click "New site from Git" -> connect your GitHub repo -> set build/publish (defaults in `netlify.toml`).
  - Netlify will automatically deploy on pushes.

- Option B (netlify-cli):

```bash
npm i -g netlify-cli
netlify login
# create a new site in current directory
netlify init
# or create and get SITE_ID
netlify sites:create --name your-site-name --dir=.
```

4) Add GitHub repository secrets (if using the GitHub Action):

- `NETLIFY_AUTH_TOKEN` — create a Personal Access Token in Netlify (User Settings → Applications → Personal access tokens).
- `NETLIFY_SITE_ID` — from the Netlify site settings (Site details → Site ID) or returned by `netlify sites:create`.

Add these to GitHub repo: Settings → Secrets → Actions → New repository secret.

5) The provided GitHub Action `.github/workflows/deploy-netlify.yml` will run on pushes to `main` and call Netlify CLI to deploy the project root.

6) Edit files in VS Code and push to `main` to trigger a deployment:

```bash
git add .
git commit -m "Your change"
git push
```

Notes
- If your public site lives in a subfolder (e.g. `urban hub admin pannel/frontend`), change the `--dir` in the workflow and `publish` in `netlify.toml` to that folder.
- If you prefer Netlify's GitHub App + Auto-deploy (UI), you don't need the GitHub Action or secrets — Netlify will deploy directly.
