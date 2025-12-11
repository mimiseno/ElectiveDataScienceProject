# 🗂️ DATABASE & AI INTEGRATION CHECKLIST

## Project: Analytix - E-commerce Analytics Dashboard
**Team:** Sereno, Page, Dulce, Laudato  
**Teacher:** Sir Charlston Sean Gono

---

## 📋 COMPLETE PAGE INVENTORY

### 🔐 Authentication Pages (2)
- [ ] **1. Login Page** - `app/(auth)/login/page.tsx`
  - **Database:** Query `users` table for authentication
  - **Features:** Email/password validation, session creation
  - **API Needed:** Login endpoint (Supabase Auth)
  - **Integration:** Activity logging on successful login

- [ ] **2. Register Page** - `app/(auth)/register/page.tsx`
  - **Database:** Insert new user into `users` table
  - **Features:** Form validation, password hashing
  - **API Needed:** Registration endpoint (Supabase Auth)
  - **Integration:** Create initial user preferences

---

### 📊 Main Dashboard Pages (7)

- [ ] **3. Main Dashboard** - `app/dashboard/page.tsx`
  - **Database Tables:**
    - `dashboard_stats` - Real-time metrics
    - `activity_logs` - Recent activity
    - `v_user_statistics` - User stats view
  - **Features:** System overview, user counts, activity summary
  - **API Needed:** 
    - GET `/api/stats/dashboard`
    - GET `/api/activity/recent`
  - **Integration:** Real-time stat updates from Supabase

- [ ] **4. Customer Segmentation** - `app/dashboard/segments/page.tsx`
  - **Database Tables:**
    - `customers` - Store RFM data and segments
    - `segment_distributions` - Distribution analytics
    - `customer_recommendations` - AI recommendations
    - `dataset_uploads` - Track CSV uploads
    - `activity_logs` - Log segmentation actions
  - **Features:** 
    - Single customer RFM analysis
    - Bulk CSV upload & processing
    - Segment distribution charts
  - **AI Model:** K-Means (Flask backend `/predict/segment`)
  - **API Needed:**
    - POST `/api/customers/analyze` (single)
    - POST `/api/customers/bulk-upload` (dataset)
    - GET `/api/customers/segments`
    - GET `/api/segments/distribution`
  - **Integration:** 
    - Connect to Flask API for predictions
    - Save results to Supabase
    - Generate recommendations
    - Log activity

- [ ] **5. Sales Forecasting** - `app/dashboard/forecast/page.tsx`
  - **Database Tables:**
    - `sales` - Historical sales data
    - `sales_forecasts` - Store predictions
    - `dataset_uploads` - Track sales CSV uploads
    - `v_monthly_sales` - Sales summary view
    - `activity_logs` - Log forecast actions
  - **Features:**
    - Single forecast generation
    - Historical sales upload
    - Forecast visualization
    - Confidence intervals
  - **AI Models:** Prophet + XGBoost Ensemble (Flask `/predict/forecast`)
  - **API Needed:**
    - POST `/api/forecast/generate`
    - POST `/api/sales/bulk-upload`
    - GET `/api/sales/historical`
    - GET `/api/forecast/history`
  - **Integration:**
    - Connect to Flask ensemble API
    - Save predictions to Supabase
    - Display historical trends
    - Log activity

- [ ] **6. User Management** - `app/dashboard/users/page.tsx`
  - **Database Tables:**
    - `users` - All user accounts
    - `activity_logs` - User activity tracking
  - **Features:** View, edit, delete users (Admin only)
  - **API Needed:**
    - GET `/api/users/all` (admin)
    - PUT `/api/users/:id`
    - DELETE `/api/users/:id`
    - POST `/api/users/create`
  - **Integration:** Real-time user list from Supabase
  - **Security:** Admin-only access (RLS policies)

- [ ] **7. Profile Page** - `app/dashboard/profile/page.tsx`
  - **Database Tables:**
    - `users` - Current user data
  - **Features:** View and edit profile, display permissions
  - **API Needed:**
    - GET `/api/users/me`
    - PUT `/api/users/me`
  - **Integration:** Update user info in Supabase

- [ ] **8. Settings Page** - `app/dashboard/settings/page.tsx`
  - **Database Tables:**
    - `users` - Update preferences
  - **Features:** Notifications, display, currency, password
  - **API Needed:**
    - PUT `/api/users/preferences`
    - PUT `/api/users/password`
  - **Integration:** Store preferences in Supabase

- [ ] **9. Admin Panel** - `app/dashboard/admin/page.tsx`
  - **Database Tables:**
    - `dashboard_stats` - System metrics
    - `activity_logs` - System logs
    - All tables (monitoring)
  - **Features:** 
    - System health monitoring
    - ML model management
    - Database operations
    - API configuration
  - **API Needed:**
    - GET `/api/admin/health`
    - GET `/api/admin/models`
    - POST `/api/admin/backup`
    - POST `/api/admin/retrain`
  - **Integration:** System-wide monitoring
  - **Security:** Admin-only access

---

## 🔗 INTEGRATION COMPONENTS

### 📡 API Integration Points

#### Flask Backend (Python - Existing)
- [x] **K-Means Segmentation API** - `backend/api.py`
  - Endpoint: `POST http://localhost:5000/predict/segment`
  - Input: `{recency, frequency, monetary (PHP)}`
  - Output: `{cluster, cluster_name, recommendations, confidence}`

- [x] **Sales Forecast API** - `backend/api.py`
  - Endpoint: `POST http://localhost:5000/predict/forecast`
  - Input: `{start_date, periods, model}`
  - Output: `{forecast[], summary, confidence}`

- [x] **Health Check** - `backend/api.py`
  - Endpoint: `GET http://localhost:5000/health`

- [x] **Model Info** - `backend/api.py`
  - Endpoint: `GET http://localhost:5000/models/info`

#### Supabase API (To Be Created)
- [ ] **Authentication APIs**
  - `/api/auth/login`
  - `/api/auth/register`
  - `/api/auth/logout`

- [ ] **User Management APIs**
  - `/api/users/all`
  - `/api/users/:id`
  - `/api/users/me`

- [ ] **Customer APIs**
  - `/api/customers/analyze` (calls Flask API)
  - `/api/customers/bulk-upload`
  - `/api/customers/list`
  - `/api/segments/distribution`

- [ ] **Sales & Forecast APIs**
  - `/api/sales/bulk-upload`
  - `/api/sales/historical`
  - `/api/forecast/generate` (calls Flask API)
  - `/api/forecast/history`

- [ ] **Dashboard APIs**
  - `/api/stats/dashboard`
  - `/api/activity/recent`

- [ ] **Admin APIs**
  - `/api/admin/health`
  - `/api/admin/backup`

---

## 🗄️ DATABASE SETUP CHECKLIST

### Supabase Configuration
- [x] **Schema Created** - `supabase_schema.sql` ready
- [ ] **Schema Deployed** - Run SQL in Supabase dashboard
- [ ] **Test Data Inserted** - Add sample records
- [ ] **RLS Policies Verified** - Test access controls
- [ ] **API Keys Configured** - Get Supabase public & anon keys
- [ ] **Environment Variables Set**
  ```
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

### Database Tables Status
- [x] `users` - User authentication & profiles
- [x] `customers` - RFM segmentation data
- [x] `sales` - Transaction history
- [x] `sales_forecasts` - Prediction results
- [x] `dataset_uploads` - File upload tracking
- [x] `activity_logs` - Audit trail
- [x] `segment_distributions` - Analytics
- [x] `dashboard_stats` - Cached metrics
- [x] `customer_recommendations` - AI suggestions

---

## 🔧 INTEGRATION WORKFLOW

### Phase 1: Setup & Configuration
1. [ ] Deploy `supabase_schema.sql` to Supabase
2. [ ] Install Supabase client: `npm install @supabase/supabase-js`
3. [ ] Create `.env.local` with Supabase credentials
4. [ ] Create `lib/supabase.ts` client wrapper
5. [ ] Test database connection

### Phase 2: Authentication Flow
6. [ ] Integrate Supabase Auth in login page
7. [ ] Update `lib/auth-context.tsx` to use Supabase
8. [ ] Add activity logging on login/logout
9. [ ] Test user registration and login
10. [ ] Implement protected routes

### Phase 3: Customer Segmentation
11. [ ] Create API route: `app/api/customers/analyze/route.ts`
12. [ ] Connect to Flask backend for predictions
13. [ ] Save results to `customers` table
14. [ ] Implement CSV upload handler
15. [ ] Generate segment distributions
16. [ ] Add activity logging
17. [ ] Test single & bulk analysis

### Phase 4: Sales Forecasting
18. [ ] Create API route: `app/api/forecast/generate/route.ts`
19. [ ] Connect to Flask ensemble API
20. [ ] Save forecasts to `sales_forecasts` table
21. [ ] Implement historical sales upload
22. [ ] Create sales visualization queries
23. [ ] Add activity logging
24. [ ] Test forecast generation

### Phase 5: Dashboard & Stats
25. [ ] Create dashboard stats API
26. [ ] Implement real-time stat updates
27. [ ] Connect activity log display
28. [ ] Add user statistics view
29. [ ] Test stat calculations

### Phase 6: User Management
30. [ ] Create user CRUD APIs (admin only)
31. [ ] Implement user list with search
32. [ ] Add edit/delete functionality
33. [ ] Test RLS policies

### Phase 7: Profile & Settings
34. [ ] Create profile update API
35. [ ] Implement preference storage
36. [ ] Add password change functionality
37. [ ] Test profile updates

### Phase 8: Admin Panel
38. [ ] Create admin health API
39. [ ] Implement system monitoring
40. [ ] Add database backup functionality
41. [ ] Test admin operations

### Phase 9: Testing & Optimization
42. [ ] End-to-end testing all pages
43. [ ] Load testing with sample data
44. [ ] Optimize database queries
45. [ ] Add error handling everywhere
46. [ ] Performance profiling

### Phase 10: Production Ready
47. [ ] Security audit
48. [ ] Documentation updates
49. [ ] Deployment preparation
50. [ ] Final testing

---

## 📚 KEY FILES TO CREATE

### API Routes (Next.js App Router)
```
frontend/app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   └── logout/route.ts
├── customers/
│   ├── analyze/route.ts
│   ├── bulk-upload/route.ts
│   └── list/route.ts
├── forecast/
│   ├── generate/route.ts
│   └── history/route.ts
├── sales/
│   ├── bulk-upload/route.ts
│   └── historical/route.ts
├── users/
│   ├── all/route.ts
│   ├── me/route.ts
│   └── [id]/route.ts
├── stats/
│   └── dashboard/route.ts
└── admin/
    ├── health/route.ts
    └── backup/route.ts
```

### Utility Libraries
- [ ] `lib/supabase.ts` - Supabase client initialization
- [ ] `lib/api-client.ts` - Centralized API calls
- [ ] `lib/flask-client.ts` - Flask backend connector
- [ ] `lib/db-helpers.ts` - Database query helpers
- [ ] `lib/validators.ts` - Input validation

---

## 🎯 PRIORITY ORDER

### High Priority (Core Functionality)
1. ✅ Supabase schema deployment
2. 🔄 Authentication flow (Login/Register)
3. 🔄 Customer Segmentation + Flask API
4. 🔄 Sales Forecasting + Flask API
5. 🔄 Dashboard stats display

### Medium Priority (User Experience)
6. User Management (Admin)
7. Profile & Settings
8. Activity logging
9. Dataset upload handling

### Low Priority (Admin Features)
10. Admin panel monitoring
11. System health checks
12. Database backups

---

## 📝 TESTING CHECKLIST

### Unit Tests
- [ ] API routes respond correctly
- [ ] Database queries return expected data
- [ ] Flask API integration works
- [ ] RLS policies enforce access control

### Integration Tests
- [ ] User can register and login
- [ ] Customer segmentation end-to-end
- [ ] Sales forecast end-to-end
- [ ] Admin operations work correctly

### User Acceptance Tests
- [ ] All pages load without errors
- [ ] Forms submit successfully
- [ ] Charts display properly
- [ ] Permissions work correctly

---

## 🚀 SUCCESS CRITERIA

- ✅ All 9 pages fully functional
- ✅ Supabase database connected
- ✅ Flask AI models integrated
- ✅ Authentication working
- ✅ Real data flowing through system
- ✅ No hardcoded mock data
- ✅ RLS policies enforced
- ✅ Activity logging operational
- ✅ Admin panel functional
- ✅ Error handling in place

---

## 📞 SUPPORT RESOURCES

- **Supabase Docs:** https://supabase.com/docs
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Flask Backend:** `backend/api.py`
- **Database Schema:** `supabase_schema.sql`
- **Project Instructions:** `.github/copilot-instructions.md`

---

**Last Updated:** December 11, 2025  
**Status:** Ready for Integration Phase 🚀
