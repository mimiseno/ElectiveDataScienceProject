# 📖 COMMAND REFERENCE - Setup Commands

> **Copy and paste these commands in chronological order**

---

## INITIAL SETUP (One-Time Only)

### 1. Check Prerequisites
```bash
node --version
npm --version
python --version
git --version
```

### 2. Clone Repository
```bash
git clone <your-repository-url>
cd ElectiveDataScienceProject
```

### 3. Install Dependencies

**Option A - Automated (Windows):**
```bash
setup.bat
```

**Option B - Manual:**
```bash
npm install
cd frontend
npm install
cd ..
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Setup Environment

**Windows:**
```bash
cd frontend
copy .env.local.example .env.local
notepad .env.local
```

**Mac/Linux:**
```bash
cd frontend
cp .env.local.example .env.local
nano .env.local
```

Edit and add:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

Return to root:
```bash
cd ..
```

### 5. Setup Database
1. Go to Supabase → SQL Editor
2. Paste contents of `supabase_schema.sql`
3. Click Run

### 6. Start Application
```bash
npm start
```

### 7. Open Browser
```
http://localhost:3000
```

---

## DAILY WORKFLOW

### Start Working
```bash
git pull origin main
npm start
```

### Save Changes
```bash
git status
git add .
git commit -m "Your message"
git push origin main
```

---

## COMMON COMMANDS

### Start Both Servers
```bash
npm start
```

### Start Backend Only
```bash
npm run backend
```

### Start Frontend Only
```bash
npm run dev
```

### Check Environment
```bash
npm run check:env
```

### Reinstall Dependencies
```bash
npm run setup
```

### Stop Servers
Press `Ctrl + C`

---

## TROUBLESHOOTING

### Kill Port 3000
```bash
npx kill-port 3000
```

### Kill Port 5000 (Windows)
```bash
netstat -ano | findstr :5000
taskkill /PID <process-id> /F
```

### Reinstall Frontend
```bash
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
cd ..
```

### Reinstall Backend
```bash
cd backend
pip install -r requirements.txt --upgrade
cd ..
```

### Disable RLS (Supabase SQL Editor)
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_forecasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_stats DISABLE ROW LEVEL SECURITY;
```

---

## QUICK REFERENCE

| Command | Purpose |
|---------|---------|
| `npm start` | Start both frontend + backend |
| `npm run dev` | Frontend only |
| `npm run backend` | Backend only |
| `npm run setup` | Install all dependencies |
| `npm run check:env` | Verify environment config |
| `git pull origin main` | Get latest changes |
| `git push origin main` | Push your changes |

---

**Need detailed help?** See `QUICKSTART.md` or `README.md`
