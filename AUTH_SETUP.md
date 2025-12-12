# Authentication & Database Setup Guide

## 🚀 Quick Setup

### 1. Supabase Configuration

1. **Create a Supabase Project** (if you haven't already):
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details

2. **Get Your Credentials**:
   - Go to Project Settings → API
   - Copy the `Project URL` and `anon/public` key

3. **Set Environment Variables**:
   ```bash
   # Copy the template
   cp frontend/.env.local.template frontend/.env.local
   
   # Edit .env.local with your credentials
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 2. Database Schema Setup

Run the SQL schema in your Supabase project:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire `supabase_schema.sql` file
3. Paste and click "Run"
4. Verify tables are created in Database → Tables

### 3. Authentication Features

#### ✅ What's Implemented:

**User Registration:**
- ✅ Email/password authentication
- ✅ Password strength validation (8+ chars, uppercase, number)
- ✅ Automatic user profile creation
- ✅ Activity logging
- ✅ Dashboard stats updates

**User Login:**
- ✅ Secure authentication via Supabase
- ✅ Session management
- ✅ Login activity tracking
- ✅ Last login timestamp
- ✅ IP and user agent logging

**User Logout:**
- ✅ Session cleanup
- ✅ Logout activity logging
- ✅ Local storage cleanup

**Session Management:**
- ✅ Automatic session restoration
- ✅ Token refresh
- ✅ Auth state synchronization

**Security:**
- ✅ Row Level Security (RLS) enabled
- ✅ Email validation
- ✅ Password hashing (Supabase)
- ✅ Role-based access control (admin/user)
- ✅ Account status checks (active/inactive/suspended)

### 4. API Endpoints

All authentication endpoints are functional:

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/session
```

### 5. Database Tables Used

- `users` - User profiles and roles
- `activity_logs` - Login/logout tracking
- `dashboard_stats` - System statistics

### 6. Test the System

1. **Start the development server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Register a new user:**
   - Navigate to `/register`
   - Fill in name, email, password
   - Submit form

3. **Login:**
   - Navigate to `/login`
   - Use registered credentials
   - Should redirect to `/dashboard`

4. **Check database:**
   - Go to Supabase → Database → Tables
   - Verify `users` table has your user
   - Check `activity_logs` for login events
   - Check `dashboard_stats` for updated counts

### 7. Admin User Setup

To create an admin user:

```sql
-- In Supabase SQL Editor
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 8. Troubleshooting

**Issue: "Supabase credentials not found"**
- Solution: Check `.env.local` file exists and has correct values
- Restart dev server after adding env variables

**Issue: "Failed to create user profile"**
- Solution: Verify RLS policies are set up correctly
- Check if user already exists in auth.users

**Issue: "Network error"**
- Solution: Check Supabase project is active
- Verify API URL and key are correct

**Issue: "Account is inactive"**
- Solution: Update user status in database:
  ```sql
  UPDATE public.users SET status = 'active' WHERE email = 'user@example.com';
  ```

### 9. Activity Logging

All auth actions are automatically logged:
- User registration → `activity_logs` table
- User login → `activity_logs` table + `last_login_at` update
- User logout → `activity_logs` table

View logs:
```sql
SELECT * FROM public.activity_logs 
WHERE activity_category = 'auth' 
ORDER BY created_at DESC;
```

### 10. Next Steps

After authentication is working:
1. ✅ Users can register and login
2. ✅ Sessions are persisted
3. ✅ Activity is logged
4. → Connect customer segmentation API
5. → Connect sales forecasting API
6. → Implement file uploads
7. → Add user management dashboard (admin only)

---

**Need Help?**
- Check Supabase logs: Dashboard → Logs
- View browser console for client errors
- Check terminal for server errors
