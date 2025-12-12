# Setup Prompt for Team Members

Copy and paste this entire prompt to Claude to set up the Praedion system on your machine:

---

## Project Setup Request

I'm setting up **Praedion**, an E-commerce Analytics Dashboard with ML-powered customer segmentation and sales forecasting. This is a team project with Sereno, Page, Dulce, and Laudato under Sir Charlston Sean Gono.

**Tech Stack:**
- Frontend: Next.js 14 (TypeScript) + Shadcn UI + Tailwind CSS
- Backend: Flask API (Python 3.8+)
- Database: Supabase (PostgreSQL)
- ML Models: K-Means (customer segmentation), XGBoost (sales forecasting)

**Current Workspace:** I have cloned the project repository to my local machine.

**What I need help with:**

### 1. Environment Setup
Help me verify and install all required dependencies:
- Node.js and npm (for Next.js frontend)
- Python 3.8+ and pip (for Flask backend)
- Check if all packages can be installed successfully

### 2. Frontend Setup (Next.js)
Navigate to the `frontend/` directory and:
- Install npm dependencies: `npm install`
- Create `.env.local` file with these variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000
  ```
- Verify all TypeScript configurations are correct
- Check for any missing dependencies or build errors

### 3. Backend Setup (Flask)
Navigate to the `backend/` directory and:
- Install Python dependencies: `pip install -r requirements.txt`
- Verify all ML models exist in `ai_models/` folder:
  - `kmeans_model_customer_categorization.joblib`
  - `xgboost_model_sales_forecast.joblib`
  - `rfm_scaler.joblib`
- Verify Flask API can load without errors

### 4. Database Setup (Supabase)
I need to:
- Create a Supabase account (if I don't have one)
- Create a new project
- Run the SQL schema from `supabase_schema.sql` in the Supabase SQL Editor
- Get the connection credentials (URL and anon key)
- Update my `.env.local` file with the credentials

Please guide me through the Supabase setup step-by-step.

### 5. Start Development Servers
Help me:
- Start both servers concurrently using: `npm run both` (from root directory)
- OR start them separately:
  - Backend: `npm run backend` (starts Flask on port 5000)
  - Frontend: `npm run dev` (starts Next.js on port 3000)
- Troubleshoot any startup errors

### 6. Verify System Health
Once running, help me verify:
- Flask API health: `curl http://localhost:5000/health`
- Models loaded correctly: `curl http://localhost:5000/models/info`
- Next.js frontend accessible: `http://localhost:3000`
- Can navigate to login page and dashboard

### 7. Common Issues to Check
Please help me troubleshoot if I encounter:
- **Port already in use** errors (5000 or 3000)
- **Module not found** errors in Python or Node.js
- **Model not loaded** errors (missing .joblib files)
- **Supabase connection errors** (wrong credentials)
- **CORS errors** between frontend and backend
- **NumPy compatibility issues** (should be using numpy<2.0)

### 8. Testing the System
Guide me to test:
- **Customer Segmentation:** Navigate to `/dashboard/segments`, enter RFM values, predict segment
- **Sales Forecasting:** Navigate to `/dashboard/forecast`, generate 7-day forecast
- **Bulk Upload:** Test CSV upload for customer analysis
- Verify data is saved to Supabase database

### Important Notes:
- The system uses **XGBoost ONLY** for sales forecasting (Prophet has been removed)
- ML models are trained on Brazilian Real (BRL) but API accepts Philippine Peso (PHP)
- Conversion rate: 1 BRL = 10.5 PHP
- All models are loaded once at Flask startup (not per request)

**Please help me set this up step by step, checking for errors at each stage. If you need to see any specific files or error messages, let me know and I'll provide them.**

---

## Additional Context (Optional)

If you encounter specific errors, you can also provide Claude with:

### File Structure
```
ElectiveDataScienceProject/
├── frontend/               # Next.js application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities (Supabase, Flask client)
│   ├── package.json
│   └── .env.local        # CREATE THIS
├── backend/               # Flask API
│   ├── api.py            # Main Flask app
│   ├── requirements.txt
│   └── .env (optional)
├── ai_models/             # Pre-trained ML models
│   ├── kmeans_model_customer_categorization.joblib
│   ├── xgboost_model_sales_forecast.joblib
│   └── rfm_scaler.joblib
├── supabase_schema.sql    # Database schema
├── package.json           # Root package (for npm run both)
└── README.md
```

### Quick Commands Reference
```bash
# From project root
npm install                          # Install root dependencies
npm run both                         # Start both servers
npm run backend                      # Start Flask only
npm run dev                          # Start Next.js only
npm run check:env                    # Verify .env.local exists

# Frontend only
cd frontend
npm install
npm run dev                          # Start on port 3000

# Backend only
cd backend
pip install -r requirements.txt
python api.py                        # Start on port 5000
```

### Environment Variables Template
Create `frontend/.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Flask API Configuration
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000
```

### Supabase Setup Steps
1. Go to https://supabase.com and create account
2. Click "New Project"
3. Fill in:
   - Project name: `praedion-dashboard` (or any name)
   - Database password: (create a strong password)
   - Region: Choose closest to your location
4. Wait for project to provision (~2 minutes)
5. Go to Project Settings → API
6. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Go to SQL Editor
8. Create new query, paste entire `supabase_schema.sql` content
9. Run query (should create 9 tables)
10. Verify tables exist in Table Editor

### Testing User Access
After setup, you can:
1. Navigate to `http://localhost:3000/register`
2. Create a test user account
3. Login and access dashboard
4. Try customer segmentation with sample data:
   - Recency: 60, Frequency: 2, Monetary: 30000 (Loyal Customer)
   - Recency: 10, Frequency: 8, Monetary: 35000 (Champion)
5. Try sales forecast: generate 7-day prediction

---

## Team Members
If you get stuck, coordinate with:
- **Sereno**
- **Page**
- **Dulce**
- **Laudato**

**Teacher:** Sir Charlston Sean Gono

---

**Save this prompt and share it with your teammates. They can copy the main section and paste it to Claude for guided setup assistance.**
