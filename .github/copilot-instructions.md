# AI Coding Assistant Instructions - Praedion

## Project Overview
**Praedion** is a production-ready E-commerce Analytics Dashboard with ML-powered customer segmentation and sales forecasting. Built with **Next.js 14 + Flask**, featuring pre-trained models (K-Means, XGBoost) for real-time predictions via REST API.

**Team:** Sereno, Page, Dulce, Laudato | **Teacher:** Sir Charlston Sean Gono

## Architecture

### Dual-Stack Application
- **Frontend:** Next.js 14 (TypeScript) + Shadcn UI + Tailwind CSS - Server/client components with App Router
- **Backend:** Flask API (Python 3.8+) - Serves ML models, stateless REST endpoints
- **Database:** Supabase (PostgreSQL) - User auth, customer data, sales, forecasts, activity logs
- **ML Models:** [`ai_models/`](../ai_models/) - Pre-trained Joblib models (loaded once at startup)

### Three-Layer Data Flow
```
User → Next.js Page → Next.js API Route → Flask ML API → Supabase DB
                    ↓                      ↓
              Server Actions        Model Inference
              (DB operations)      (predictions)
```

**Critical Pattern:** Next.js API routes act as orchestration layer - they call Flask for ML predictions, then persist results to Supabase.

## Essential Commands

### Development Setup
```bash
# First time setup
npm install                    # Root dependencies
cd frontend && npm install     # Next.js dependencies
cd ../backend && pip install -r requirements.txt  # Python ML stack

# Start development (from root)
npm run both                   # Runs both servers concurrently
npm run backend                # Flask on :5000 only
npm run dev                    # Next.js on :3000 only

# Environment check
npm run check:env              # Validates .env.local exists
```

### Database Setup
1. Create Supabase project at supabase.com
2. Run `supabase_schema.sql` in SQL Editor (creates 9 tables)
3. Configure `frontend/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000
   ```

## Critical Development Patterns

### 1. ML Model Integration (Flask ↔ Next.js)

**Flask Backend** ([backend/api.py](../backend/api.py)):
- Models loaded **globally at startup** (not per request):
  ```python
  kmeans_model = joblib.load(KMEANS_MODEL_PATH)  # Loaded once
  xgboost_model = joblib.load(XGBOOST_MODEL_PATH)
  ```
- **Stateless endpoints** - no session/auth (Next.js handles that)
- **Currency conversion** - Models trained on BRL, API accepts PHP (1 BRL = 10.5 PHP)

**Next.js API Routes** ([frontend/app/api/](../frontend/app/api/)):
```typescript
// Pattern: Validate → Call Flask → Save to Supabase → Log Activity
// Example: frontend/app/api/customers/analyze/route.ts
1. Validate input (RFM ranges)
2. predictCustomerSegment() → Flask /predict/segment
3. Save to supabaseAdmin.from('customers').upsert()
4. Log to 'activity_logs' table
5. Return enriched response to frontend
```

**Key Files:**
- `frontend/lib/flask-client.ts` - Typed Flask API client (predictCustomerSegment, predictSalesForecast)
- `frontend/lib/supabase.ts` - Client-side Supabase client
- `frontend/lib/supabase-server.ts` - Server-side admin client (bypasses RLS)

### 2. RFM Scaling & Currency Pattern
```python
# CRITICAL ORDER in Flask:
monetary_brl = monetary_php / BRL_TO_PHP  # 1. Convert currency
X = np.array([[recency, frequency, monetary_brl]])
X_scaled = rfm_scaler.transform(X)        # 2. Scale AFTER conversion
cluster = kmeans_model.predict(X_scaled)[0]
```

**Input Limits** (enforced in both Flask + Next.js):
- Recency: 1-400 days
- Frequency: 1-10 orders
- Monetary: ₱0-₱50,000 PHP

### 3. Next.js Page Patterns

**Server Components** (default):
- Fetch initial data server-side
- Use `supabaseAdmin` from `lib/supabase-server.ts`
- Example: Dashboard stats in `app/dashboard/page.tsx`

**Client Components** (`"use client"`):
- Interactive forms, charts, real-time UI
- Use `supabase` from `lib/supabase.ts`
- Example: Customer segmentation form in `app/dashboard/segments/page.tsx`

**API Route Pattern** ([app/api/](../frontend/app/api/)):
```typescript
export async function POST(request: Request) {
  const data = await request.json()
  // Validate input
  // Call Flask API via flask-client
  // Save to Supabase
  // Log activity
  return NextResponse.json({ success: true, data })
}
```

### 4. Supabase Integration
**Tables Structure:**
- `users` - Extends auth.users with role/status
- `customers` - RFM data + segment predictions (cluster 0-2)
- `sales` - Transaction data
- `sales_forecasts` - XGBoost predictions
- `activity_logs` - Audit trail (segment_analysis, sales_forecast)

**RLS (Row Level Security):**
- Enabled on all tables
- Admin users see all data
- Regular users see own data only
- API routes use `supabaseAdmin` to bypass RLS

### 5. Bulk Processing Pattern
```typescript
// Optimized for large datasets
// Example: frontend/app/api/customers/bulk-upload/route.ts
1. Upload CSV via FormData
2. Parse with csv-parser/papaparse
3. Batch call Flask /predict/segment/bulk (NOT individual requests)
4. Bulk insert to Supabase (single transaction)
5. Return distribution stats
```

## Business Logic

### Customer Segments (K-Means Clusters)
Based on Olist training data (3 clusters):
- **Cluster 0 - Loyal Customers:** High monetary value, moderate frequency
- **Cluster 1 - At Risk:** Declining activity, early warning signs - need re-engagement
- **Cluster 2 - Lost Customers:** High recency, low engagement - need win-back campaigns

**Mapping:** `CLUSTER_NAMES` dict in [backend/api.py](../backend/api.py) and `segmentInfo` in [frontend/app/dashboard/segments/page.tsx](../frontend/app/dashboard/segments/page.tsx).

### Sales Forecasting Model
- **XGBoost:** Gradient boosting with feature engineering (lag, rolling stats, seasonality features)
- **Training data:** Olist Brazilian E-commerce (2016-2018)

## Project-Specific Conventions

### File Organization
- **No nested routes** in Flask - flat structure in `api.py`
- **Next.js App Router** - folder = route (`app/dashboard/segments/page.tsx` → `/dashboard/segments`)
- **Component Library** - Shadcn UI in `components/ui/` (installed via CLI, committed to repo)
- **Type Safety** - TypeScript strict mode, no `any` types in API routes

### Error Handling Strategy
```typescript
// Next.js API routes
try {
  // Validate → Call Flask → Save DB
} catch (error) {
  console.error('Context:', error)
  return NextResponse.json({ 
    error: 'User-friendly message',
    message: error.message  // Debug info
  }, { status: 500 })
}
```

**Flask graceful degradation:**
- Returns partial results with warning if some operations fail
- Always clips predictions to valid ranges (sales ≥ 0)

### Testing & Debugging

**Health Checks:**
```bash
# Flask API
curl http://localhost:5000/health
curl http://localhost:5000/models/info

# Next.js
curl http://localhost:3000/api/health
```

**Common Issues:**
- **"Model not loaded"** → Check `ai_models/` exists and contains .joblib files
- **Supabase errors** → Verify `.env.local` credentials, run `npm run check:env`
- **CORS errors** → Ensure Flask CORS enabled for localhost:3000
- **Negative predictions** → Check if clipping logic is applied (`np.clip(pred, 0, None)`)

## Development Gotchas

1. **Windows Paths:** Use `os.path.join()` in Python (Flask uses `os.path.join(BASE_DIR, 'ai_models', ...)`)
2. **Model Scaling Order:** ALWAYS convert PHP→BRL BEFORE scaling with `rfm_scaler`
3. **Supabase Client:** Use `supabaseAdmin` in API routes (server-side), `supabase` in client components
4. **Env Variables:** Prefix with `NEXT_PUBLIC_` for client-side access
5. **Bulk Operations:** Use `/bulk` endpoints in Flask for >10 records (avoid N+1 queries)

## Quick Start for New Features

### Adding a New ML Model
1. Train model, export as `.joblib` → save to `ai_models/`
2. Load in Flask `api.py` global scope
3. Create Flask endpoint (e.g., `/predict/churn`)
4. Add function to `flask-client.ts`
5. Create Next.js API route in `app/api/`
6. Build UI component in `app/dashboard/`

### Adding a New Page
1. Create `app/dashboard/newpage/page.tsx`
2. Add route to sidebar in `components/dashboard/sidebar.tsx`
3. Fetch data via API route or server component
4. Use existing Shadcn components from `components/ui/`

### Database Schema Changes
1. Update `supabase_schema.sql`
2. Run new migrations in Supabase SQL Editor
3. Update TypeScript types if using generated types
4. Update API routes to use new columns

## External Dependencies

- **Dataset:** Olist Brazilian E-commerce (2016-2018, ~500K transactions)
- **ML Libraries:** `scikit-learn==1.3.2`, `xgboost`, `joblib==1.3.2`
- **UI Components:** Shadcn UI (Radix primitives), Recharts (charts), Lucide (icons)
- **Package Manager:** npm (root + frontend), pip (backend)
- **Concurrency:** `concurrently` npm package for `npm run both`