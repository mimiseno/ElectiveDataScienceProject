# 🎯 Praedion - E-commerce Analytics Dashboard

> **AI-Powered Customer Segmentation & Sales Forecasting Platform**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 👥 Team Members
- **Sereno, Micah T.**
- **Page, King Edward T.**
- **Dulce, Mielle Angelie B.**
- **Laudato, Sir Lawrence C.**

**Instructor:** Sir Charlston Sean Gono  
**Institution:** [Your Institution Name]  
**Course:** Data Science Elective Project

---

## 📋 Project Overview

Praedion is a production-ready analytics platform that leverages machine learning to provide actionable insights for e-commerce businesses. Built with modern web technologies and trained on the Brazilian E-commerce dataset (Olist).

### Key Features

✅ **Customer Segmentation** - K-Means clustering with RFM analysis (4 segments)  
✅ **Sales Forecasting** - Prophet + XGBoost ensemble (7-365 days ahead)  
✅ **User Authentication** - Supabase-powered secure auth with RLS  
✅ **Real-time Analytics** - Live dashboard with ML predictions  
✅ **RESTful API** - Flask backend serving pre-trained models  
✅ **Modern UI** - Next.js 14 + Tailwind CSS + Shadcn UI

---

## 🚀 Quick Start for Team Members

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **Git**
- **Supabase Account** (free tier works)

### Setup Steps

#### 1️⃣ Clone Repository
```bash
git clone <repository-url>
cd ElectiveDataScienceProject
```

#### 2️⃣ Run Automated Setup (Windows)
```bash
setup.bat
```

Or manually:

#### 3️⃣ Install All Dependencies
```bash
npm run setup
```

This installs:
- Root dependencies (concurrently)
- Frontend dependencies (Next.js, React, etc.)
- Backend dependencies (Flask, Prophet, XGBoost, etc.)

#### 4️⃣ Configure Environment Variables

**Frontend:**
```bash
cd frontend
copy .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000
```

Get Supabase credentials from: **Dashboard → Project Settings → API**

#### 5️⃣ Setup Database

1. Go to **Supabase SQL Editor**
2. Run `supabase_schema.sql` (in root directory)
3. Verify 9 tables created

#### 6️⃣ Start Development Servers

```bash
# Start both frontend + backend
npm start

# Or separately:
npm run backend  # Flask API on :5000
npm run dev      # Next.js on :3000
```

#### 7️⃣ Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

---

## 📦 Project Structure

The dashboard will automatically open at **http://localhost:3000**  
The API runs at **http://localhost:5000**

#### Step 4: Make Predictions
- **Customer Segmentation**: Enter Recency, Frequency, Monetary values → Click "Predict Customer Segment"
- **Sales Forecast**: Select date and days → Click "Generate Forecast"

The dashboard will automatically use the pre-trained models in `ai_models/` folder!

---

### Option 2: Train Models from Scratch (Advanced)

#### Step 1: Run in Google Colab

1. **Upload the notebook** `Customer_Segmentation_and_Sales_Forcasting(Ser_Pag_Lau_Dul).ipynb` to Google Colab
2. **Download the dataset** from [UCI Machine Learning Repository](https://archive.ics.uci.edu/ml/machine-learning-databases/00352/Online%20Retail.xlsx)
3. **Upload the dataset** to your Google Drive or Colab environment
4. **Update the file path** in Step 2 of the notebook:
   ```python
   # For Google Colab:
   from google.colab import drive
   drive.mount('/content/drive')
   file_path = '/content/drive/MyDrive/Online-Retail.xlsx'
   ```
5. **Run all cells** sequentially from top to bottom
6. **Download** the generated `ai_models/` folder with trained models

---

## � Project Structure

```
ElectiveDataScienceProject/
├── ai_models/                                    # Pre-trained ML models
│   ├── kmeans_model_customer_categorization.joblib
│   └── prophet_model_sales_forecast.joblib
├── backend/                                      # Flask API server
│   ├── api.py                                   # Main API endpoints
│   └── requirements.txt                         # Python dependencies
├── frontend/                                     # Web interface
│   └── dashboard.html                           # AI-powered dashboard
├── Customer_Segmentation_and_Sales_Forcasting.ipynb  # Training notebook
├── Online-Retail.csv                            # Dataset
├── sample_dashboard_data.json                   # Sample data with model info
└── README.md                                    # Documentation
```

---

## 🔌 API Endpoints

### 1. Customer Segmentation
```http
POST http://localhost:5000/predict/segment
Content-Type: application/json

{
  "recency": 30,
  "frequency": 5,
  "monetary": 1500
}
```

**Response:**
```json
{
  "cluster": 2,
  "cluster_name": "Loyal Customers",
  "description": "Frequent buyers with consistent spending...",
  "recommendations": ["Implement loyalty rewards program", "..."],
  "rfm_values": { "recency": 30, "frequency": 5, "monetary": 1500 }
}
```

### 2. Sales Forecast
```http
POST http://localhost:5000/predict/forecast
Content-Type: application/json

{
  "start_date": "2025-11-20",
  "periods": 7
}
```

**Response:**
```json
{
  "forecast": [
    {
      "ds": "2025-11-20",
      "yhat": 27410.02,
      "yhat_lower": 12096.25,
      "yhat_upper": 42895.54
    }
  ],
  "summary": {
    "avg_daily_sales": 21917.68,
    "total_projected": 153423.76,
    "uncertainty_range": "±15.2%"
  }
}
```

### 3. Health Check
```http
GET http://localhost:5000/health
```

### 4. Model Information
```http
GET http://localhost:5000/models/info
```

---

## 📊 Pre-trained Models

### K-Means Customer Segmentation Model
- **File**: `ai_models/kmeans_model_customer_categorization.joblib`
- **Features**: Recency, Frequency, Monetary
- **Clusters**: 4 (Lost, At Risk, Loyal, Champions)
- **Silhouette Score**: 0.42

### Prophet Sales Forecast Model
- **File**: `ai_models/prophet_model_sales_forecast.joblib`
- **Algorithm**: Facebook Prophet
- **MAPE**: 12.34%
- **R² Score**: 0.86

---

## 📊 Generated Outputs (From Notebook)

### CSV Files
1. **rfm_table.csv** - RFM metrics for all customers
2. **customer_segments.csv** - Customer cluster assignments
3. **segment_summary.csv** - Statistical summary by segment
4. **sales_forecast_30days.csv** - 30-day sales predictions

### Visualizations (PNG)
1. **rfm_distributions.png** - RFM metric distributions
2. **elbow_method.png** - Optimal cluster selection
3. **customer_segments_3d.png** - 3D cluster visualization
4. **sales_forecast.png** - Sales forecast with trends
5. **forecast_components.png** - Seasonal decomposition

---

## 🎯 Key Features

### AI-Powered Analytics
- ✅ **Real-time Predictions** using pre-trained models
- ✅ **RESTful API** with Flask backend
- ✅ **Interactive Dashboard** with live AI integration
- ✅ **Production-ready** deployment architecture

### Customer Segmentation
- ✅ RFM Analysis (Recency, Frequency, Monetary)
- ✅ K-Means Clustering (4 segments)
- ✅ Silhouette Score: 0.42
- ✅ Business recommendations per segment
- ✅ Real-time cluster prediction

### Sales Forecasting
- ✅ Facebook Prophet algorithm
- ✅ Daily, weekly, and yearly seasonality
- ✅ Customizable forecast periods (1-365 days)
- ✅ MAPE: 12.34%, R²: 0.86
- ✅ Confidence intervals with uncertainty quantification

### Interactive Dashboard
- ✅ Customer input forms for RFM analysis
- ✅ Date picker for sales forecasting
- ✅ Real-time API calls to backend
- ✅ Visual result displays with recommendations
- ✅ Summary metrics and KPIs
- ✅ Customer segment profiles
- ✅ 7-day sales forecast table
- ✅ Actionable business recommendations

---

## 🔧 Technical Requirements

### For Google Colab (Recommended)
- Python 3.7+
- Libraries (auto-installed in notebook):
  - pandas
  - numpy
  - scikit-learn
  - matplotlib
  - seaborn
  - prophet
  - openpyxl

### For Dashboard
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software needed!

---

## 📈 Business Impact

### Marketing Teams
- Target high-value customers with personalized campaigns
- Re-engage at-risk customers with retention strategies
- Optimize customer acquisition costs

### Operations Teams
- Accurate inventory planning based on sales forecasts
- Reduce stockouts and overstock situations
- Improve resource allocation

### Executive Leadership
- Data-driven strategic decision making
- Revenue projection and budgeting
- Market trend identification

---

## 💡 Key Insights

The analysis provides:

1. **Customer Behavior Patterns**
   - Champions: High value, recent purchases
   - Loyal: Frequent buyers
   - At Risk: Declining engagement
   - Lost: Need re-engagement

2. **Sales Predictions**
   - Daily sales forecasts with 85%+ accuracy
   - Seasonal trend identification
   - Peak period anticipation

3. **Actionable Recommendations**
   - Optimal inventory levels
   - Customer-specific marketing strategies
   - Revenue optimization opportunities

---

## �‍💻 Team Collaboration Workflow

### For Team Members Cloning This Repo

#### First Time Setup
```bash
# 1. Clone the repository
git clone <repo-url>
cd ElectiveDataScienceProject

# 2. Run setup script (Windows)
setup.bat

# Or manually:
npm run setup

# 3. Configure environment
cd frontend
copy .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Setup database
# Run supabase_schema.sql in Supabase SQL Editor
```

#### Daily Development
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies (if needed)
npm install
cd frontend && npm install && cd ..
cd backend && pip install -r requirements.txt && cd ..

# 3. Start development
npm start

# 4. Make your changes...

# 5. Commit and push
git add .
git commit -m "Your descriptive message"
git push origin main
```

#### Common Commands
```bash
npm start              # Start both frontend + backend
npm run dev            # Start frontend only
npm run backend        # Start backend only
npm run check:env      # Verify environment configuration
npm run build          # Build production version
```

#### Branch Strategy (Optional)
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Work on your feature...

# Push feature branch
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Important Notes for Team

⚠️ **Never commit these files:**
- `.env.local` (contains secrets)
- `node_modules/` (too large)
- `__pycache__/` (Python cache)
- `.next/` (build output)

✅ **Always commit:**
- Source code changes
- Documentation updates
- New dependencies (update package.json or requirements.txt)

📝 **Use descriptive commit messages:**
- ✅ `"Add user authentication to dashboard"`
- ✅ `"Fix forecast chart rendering bug"`
- ✅ `"Update RFM validation ranges"`
- ❌ `"fix bug"`
- ❌ `"update"`

---

## 📝 Usage Tips

1. **First Time Running:**
   - Follow QUICKSTART.md for detailed instructions
   - Ensure Supabase credentials are configured
   - Run database schema before starting app

2. **Troubleshooting:**
   - Check `npm run check:env` for environment issues
   - Verify Python/Node versions meet requirements
   - See AUTH_SETUP.md for authentication problems
   - Restart servers after changing .env files

3. **Development:**
   - Frontend changes auto-reload (Next.js hot reload)
   - Backend requires restart after code changes
   - Use `/health` endpoint to verify API is running

---

## 📚 References

- UCI Machine Learning Repository - Online Retail Dataset
- Huang, S., & Fildes, R. (2023). Time series forecasting
- Kumar et al. (2021). E-commerce analytics
- Facebook Prophet Documentation

---

## 🎓 Academic Integrity

This project is submitted as part of our Data Science coursework. All analyses are original work by our team, using publicly available datasets and open-source libraries.

---

## 📞 Contact

For questions or collaboration:
- **Primary Contact:** Sereno, Micah T.
- **Course:** Data Science Elective 4
- **Institution:** Lyceum of the Philippines, Cavite

---

## ✅ Project Checklist

- [x] Data loading and preprocessing
- [x] RFM analysis implementation
- [x] K-Means clustering
- [x] Elbow method optimization
- [x] Prophet forecasting model
- [x] Model evaluation metrics
- [x] Visualization generation
- [x] Business insights extraction
- [x] Interactive dashboard
- [x] Complete documentation

---

**Last Updated:** November 7, 2025  
**Version:** 1.0  
**Status:** ✅ Complete and Ready for Presentation
