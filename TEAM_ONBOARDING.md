# 📋 New Team Member Checklist

## Pre-Setup Requirements

- [ ] Install **Node.js 18+** from https://nodejs.org/
- [ ] Install **Python 3.8+** from https://www.python.org/
- [ ] Install **Git** from https://git-scm.com/
- [ ] Install **VS Code** (recommended) from https://code.visualstudio.com/
- [ ] Create **Supabase Account** at https://supabase.com/

## Initial Setup (One-Time)

- [ ] Clone repository: `git clone <repo-url>`
- [ ] Run `setup.bat` or `npm run setup`
- [ ] Create Supabase project (if not already created)
- [ ] Get Supabase credentials from Dashboard → Settings → API
- [ ] Copy `frontend/.env.local.example` to `frontend/.env.local`
- [ ] Add Supabase URL and anon key to `.env.local`
- [ ] Run `supabase_schema.sql` in Supabase SQL Editor
- [ ] Verify setup: `npm run check:env`

## First Run

- [ ] Start application: `npm start`
- [ ] Open frontend: http://localhost:3000
- [ ] Test API health: http://localhost:5000/health
- [ ] Register a test user account
- [ ] Login successfully
- [ ] Test customer segmentation feature
- [ ] Test sales forecasting feature

## Development Tools Setup

### VS Code Extensions (Recommended)

- [ ] **ES7+ React/Redux/React-Native snippets**
- [ ] **Tailwind CSS IntelliSense**
- [ ] **Python** (by Microsoft)
- [ ] **Pylance**
- [ ] **GitLens**
- [ ] **Prettier - Code formatter**

### Git Configuration

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Understanding the Codebase

### Read These Files First

- [ ] `QUICKSTART.md` - Quick setup guide
- [ ] `README.md` - Project overview
- [ ] `AUTH_SETUP.md` - Authentication documentation
- [ ] `.github/copilot-instructions.md` - Development patterns

### Key Directories

- [ ] `frontend/app/` - Next.js pages and routes
- [ ] `frontend/components/` - Reusable React components
- [ ] `frontend/lib/` - Utilities and API clients
- [ ] `backend/api.py` - Flask API endpoints
- [ ] `ai_models/` - Pre-trained ML models

### Important Files

- [ ] `frontend/lib/auth-context.tsx` - Authentication state
- [ ] `frontend/lib/flask-client.ts` - Backend API client
- [ ] `backend/api.py` - API implementation
- [ ] `supabase_schema.sql` - Database schema

## Common Tasks

### Running the Application

```bash
# Start both servers
npm start

# Or separately:
npm run backend  # Terminal 1
npm run dev      # Terminal 2
```

### Making Changes

```bash
# 1. Pull latest
git pull origin main

# 2. Create branch (optional)
git checkout -b feature/your-feature

# 3. Make changes...

# 4. Test changes
npm start

# 5. Commit
git add .
git commit -m "Descriptive message"
git push origin main
```

### Updating Dependencies

```bash
# Frontend dependencies changed
cd frontend
npm install

# Backend dependencies changed
cd backend
pip install -r requirements.txt
```

### Troubleshooting

- [ ] Ports in use? Change in `package.json` (frontend) or `api.py` (backend)
- [ ] Environment errors? Run `npm run check:env`
- [ ] Import errors? Reinstall: `npm run setup`
- [ ] Database errors? Rerun `supabase_schema.sql`

## Team Communication

- [ ] Join team chat/Slack/Discord (if applicable)
- [ ] Ask questions in team channel
- [ ] Share blockers early
- [ ] Review pull requests promptly

## Before Your First Commit

- [ ] Code runs without errors
- [ ] Test your changes locally
- [ ] No secrets in code (check .env.local not committed)
- [ ] Descriptive commit message
- [ ] Pull latest changes first

## Getting Help

### If You're Stuck:

1. Check documentation (`QUICKSTART.md`, `README.md`)
2. Search the codebase for similar implementations
3. Ask team members
4. Check GitHub issues (if applicable)
5. Review error messages in console/terminal

### Resources:

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Flask Docs**: https://flask.palletsprojects.com/
- **Prophet Docs**: https://facebook.github.io/prophet/

## Checklist Complete! 🎉

You're ready to start contributing!

**Next Steps:**
1. Pick a task from the project board/issues
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit for review

**Welcome to the team!** 👋
