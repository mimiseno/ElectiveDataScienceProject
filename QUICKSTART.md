# ================================================================
# QUICK START GUIDE - PRAEDION E-COMMERCE DASHBOARD
# ================================================================
# Follow these steps to get the project running on your machine
# ================================================================

## Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

## Step 1: Clone Repository
```bash
git clone <repository-url>
cd ElectiveDataScienceProject
```

## Step 2: Setup Environment Variables

### Frontend Environment Variables
```bash
cd frontend
copy .env.local.example .env.local
```

Edit `frontend/.env.local` and add your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Get these from**: Supabase Dashboard → Project Settings → API

### Root Environment Variables (Optional)
```bash
cd ..
copy .env.example .env.local
```

## Step 3: Install Dependencies

### Frontend Dependencies
```bash
cd frontend
npm install
```

### Backend Dependencies
```bash
cd ../backend
pip install -r requirements.txt
```

## Step 4: Setup Database

1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase_schema.sql` from the root directory
3. Verify tables are created in Table Editor

## Step 5: Start Development Servers

### Option A: Start Both Frontend & Backend Together (Recommended)
```bash
# From root directory
npm install
npm run both
```

### Option B: Start Separately

**Terminal 1 - Backend:**
```bash
cd backend
python api.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 6: Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## Default Login Credentials

After running the SQL schema, use these test accounts:
- **Admin**: admin@praedion.com (set password after registration)
- **User**: user@praedion.com (set password after registration)

## Troubleshooting

### Port Already in Use
- Frontend (3000): Change in `frontend/package.json` → `"dev": "next dev -p 3001"`
- Backend (5000): Change in `backend/api.py` → `app.run(port=5001)`

### Missing Environment Variables
- Ensure `.env.local` exists in `frontend/` directory
- Check Supabase credentials are correct
- Restart development servers after changing .env

### Database Connection Issues
- Verify Supabase URL and anon key
- Check RLS policies are enabled (run supabase_schema.sql)
- Confirm tables exist in Supabase dashboard

### Import Errors (Python)
```bash
cd backend
pip install -r requirements.txt --upgrade
```

### Module Not Found (Node)
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Project Structure
```
ElectiveDataScienceProject/
├── frontend/          # Next.js 14 app
│   ├── app/          # App router pages
│   ├── components/   # React components
│   └── lib/          # Utilities & API clients
├── backend/          # Flask API
│   ├── api.py       # Main API server
│   └── requirements.txt
├── ai_models/        # Pre-trained ML models
└── supabase_schema.sql  # Database schema
```

## Team Workflow

### Before Making Changes
```bash
git pull origin main
npm install  # if package.json changed
pip install -r backend/requirements.txt  # if requirements changed
```

### After Making Changes
```bash
git add .
git commit -m "Your descriptive message"
git push origin main
```

## Need Help?

- Check `AUTH_SETUP.md` for authentication issues
- Check `INSTALLATION.md` for detailed setup
- Check `README.md` for project overview
- Contact: Team Lead / Sir Charlston Sean Gono

## Quick Commands Reference

```bash
# Install all dependencies (run once)
npm install && cd frontend && npm install && cd ../backend && pip install -r requirements.txt && cd ..

# Start development (daily use)
npm run both

# Backend only
npm run backend

# Frontend only  
npm run dev
```
