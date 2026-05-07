#!/bin/bash
# FinLit AI — One-time deployment setup
# Run this once from your local machine to link Vercel and Railway.
# It prints every secret you need to add to GitHub.

set -e

echo ""
echo "======================================"
echo "  FinLit AI — Deployment Setup"
echo "======================================"
echo ""

# ── Check prerequisites ────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js is required. Install from nodejs.org"
  exit 1
fi

if ! command -v npm &>/dev/null; then
  echo "ERROR: npm is required."
  exit 1
fi

# ── Install CLIs ───────────────────────────────────────────────────────────
echo "Installing Vercel and Railway CLIs..."
npm install -g vercel @railway/cli 2>/dev/null
echo "✓ CLIs installed"
echo ""

# ── Railway setup ──────────────────────────────────────────────────────────
echo "--------------------------------------"
echo "STEP 1: Railway (backend)"
echo "--------------------------------------"
echo ""
echo "Opening Railway login... (browser will open)"
railway login
echo ""
echo "Creating Railway project..."
railway init --name finlit-ai-backend
RAILWAY_TOKEN=$(railway whoami --token 2>/dev/null || true)
echo ""
echo "Deploying backend to Railway now..."
cd backend && railway up --detach && cd ..
RAILWAY_URL=$(railway domain 2>/dev/null || echo "Check Railway dashboard for your URL")
echo ""
echo "✓ Backend deployed!"
echo "  Railway URL: $RAILWAY_URL"
echo ""

# ── Vercel setup ───────────────────────────────────────────────────────────
echo "--------------------------------------"
echo "STEP 2: Vercel (frontend)"
echo "--------------------------------------"
echo ""
echo "Opening Vercel login... (browser will open)"
cd frontend
vercel login
echo ""
echo "Linking Vercel project..."
vercel link --yes --project finlit-ai
VERCEL_ORG_ID=$(cat .vercel/project.json | python3 -c "import sys,json; print(json.load(sys.stdin)['orgId'])" 2>/dev/null || cat .vercel/project.json | grep orgId | sed 's/.*: "\(.*\)".*/\1/')
VERCEL_PROJECT_ID=$(cat .vercel/project.json | python3 -c "import sys,json; print(json.load(sys.stdin)['projectId'])" 2>/dev/null || cat .vercel/project.json | grep projectId | sed 's/.*: "\(.*\)".*/\1/')
echo ""
echo "Setting VITE_API_URL in Vercel..."
vercel env add VITE_API_URL production <<< "$RAILWAY_URL"
echo ""
echo "Deploying frontend to Vercel..."
vercel --prod --yes
VERCEL_URL=$(vercel ls --scope="$VERCEL_ORG_ID" 2>/dev/null | grep finlit | head -1 | awk '{print $2}' || echo "Check Vercel dashboard for your URL")
cd ..
echo ""
echo "✓ Frontend deployed!"
echo "  Vercel URL: https://$VERCEL_URL"
echo ""

# ── Print GitHub secrets ───────────────────────────────────────────────────
echo "======================================"
echo "  ADD THESE 4 SECRETS TO GITHUB:"
echo "  github.com/janiyanabinett/Game-plan"
echo "  → Settings → Secrets → Actions"
echo "======================================"
echo ""
RAILWAY_TOKEN_VAL=$(railway whoami 2>/dev/null || echo "get from railway.app/account/tokens")
echo "Secret name:  RAILWAY_TOKEN"
echo "Secret value: $RAILWAY_TOKEN_VAL"
echo ""
VERCEL_TOKEN_VAL=$(cat ~/.local/share/com.vercel.cli/auth.json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(list(d.values())[0].get('token',''))" 2>/dev/null || echo "get from vercel.com/account/tokens")
echo "Secret name:  VERCEL_TOKEN"
echo "Secret value: $VERCEL_TOKEN_VAL"
echo ""
echo "Secret name:  VERCEL_ORG_ID"
echo "Secret value: $VERCEL_ORG_ID"
echo ""
echo "Secret name:  VERCEL_PROJECT_ID"
echo "Secret value: $VERCEL_PROJECT_ID"
echo ""
echo "======================================"
echo "  Once you add those 4 secrets, every"
echo "  git push auto-deploys your site!"
echo "======================================"
echo ""
