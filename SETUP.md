# 🚀 Setup Guide

Complete setup guide for the AI APIs Directory automation.

## Prerequisites

- A GitHub account
- A [Google AI Studio](https://aistudio.google.com/) account (free)
- Node.js 18+ (for local development)

---

## Step 1: Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/ai-apis-directory.git
cd ai-apis-directory
npm install
```

---

## Step 2: Get Your Gemini API Key

1. Visit [aistudio.google.com](https://aistudio.google.com/)
2. Click **"Get API Key"** → **"Create API key"**
3. Copy the key (starts with `AIza...`)

> The free tier gives you **15 requests/min** and **1M tokens/min** — more than enough for all automations.

---

## Step 3: Add Secret to GitHub

1. Go to your forked repo → **Settings**
2. **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `GEMINI_API_KEY`
5. Value: Your API key from Step 2
6. Click **"Add secret"**

---

## Step 4: Enable GitHub Actions

1. Go to **Actions** tab in your repo
2. Click **"I understand my workflows, go ahead and enable them"**

The following workflows are now active:

| Workflow | Schedule | What it does |
|----------|----------|--------------|
| `auto-update.yml` | Every Sunday midnight | Updates pricing, finds new APIs |
| `validate.yml` | Every Wednesday 6 AM | Checks all links are alive |
| `weekly-report.yml` | Every Saturday 8 AM | Generates weekly digest |
| `pr-automation.yml` | On every PR | Auto-labels, welcomes contributors |
| `changelog.yml` | On release | Auto-generates changelog |

---

## Step 5: Rename Workflow Directory (Important!)

The workflows are in `github_workflows/` in the zip — you need to rename it to `.github/workflows/`:

```bash
mkdir -p .github/workflows .github/ISSUE_TEMPLATE
mv github_workflows/* .github/workflows/
mv github_issue_template/* .github/ISSUE_TEMPLATE/
rm -rf github_workflows github_issue_template
git add .
git commit -m "chore: set up GitHub Actions workflows"
git push
```

---

## Step 6: Test the Automation

Trigger a manual run:
1. Go to **Actions** → **🤖 Auto-Update APIs**
2. Click **"Run workflow"**
3. Select update type: `all`
4. Click **"Run workflow"**

---

## Local Development

```bash
# Copy env file
cp .env.example .env
# Add your key to .env

# Run specific scripts:
npm run update          # Full update
npm run update:pricing  # Pricing only
npm run validate        # Check links
npm run report          # Weekly report
npm run analyze         # Quality analysis
npm run check-format    # Lint markdown tables
```

---

## Customization

### Change Update Schedule

Edit the `cron` line in any workflow file:

```yaml
# Examples:
- cron: "0 0 * * 0"    # Every Sunday midnight
- cron: "0 8 * * 1"    # Every Monday 8 AM
- cron: "0 0 1 * *"    # First of every month
```

### Add More APIs

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## Troubleshooting

**Workflow fails with "API key not found"**
→ Double-check the secret name is exactly `GEMINI_API_KEY`

**Links show as dead but are actually alive**
→ Some sites block bots. Add them to an allowlist in `validate-links.js`

**PRs not getting auto-labeled**
→ Make sure the `pull-requests: write` permission is in the workflow

---

*Questions? Open an issue!*
