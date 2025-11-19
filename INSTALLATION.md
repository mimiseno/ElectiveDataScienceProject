# 🚀 Quick Installation Guide

## Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

## Installation Steps

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

**Note**: This will install:
- Flask (web framework)
- Flask-CORS (Cross-Origin Resource Sharing)
- pandas, numpy (data processing)
- scikit-learn (K-Means model)
- prophet (forecasting model)
- joblib (model loading)

### 2. Verify Models Exist
Make sure these files are in the `ai_models/` folder:
- `kmeans_model_customer_categorization.joblib`
- `prophet_model_sales_forecast.joblib`

### 3. Start the System

**Option A: Use the Launcher (Windows)**
```bash
# Double-click Start_Dashboard.bat
# Or run from command line:
Start_Dashboard.bat
```

**Option B: Manual Start**
```bash
# Terminal 1 - Start API Server
cd backend
python api.py

# Terminal 2 - Open Dashboard
# Then open frontend/dashboard.html in your browser
```

### 4. Test the System

**Test API Health:**
Open browser and go to: `http://localhost:5000/health`

**Test Customer Segmentation:**
1. Open dashboard in browser
2. Enter values:
   - Recency: 30
   - Frequency: 8
   - Monetary: 2500
3. Click "Predict Customer Segment"

**Test Sales Forecast:**
1. Select today's date
2. Enter 7 days
3. Click "Generate Forecast"

## Troubleshooting

### Error: "Module not found"
```bash
# Reinstall dependencies
pip install -r backend/requirements.txt
```

### Error: "Models not loaded"
Make sure the `ai_models/` folder contains both `.joblib` files.

### Error: "Cannot connect to API"
1. Check if Flask server is running (should show "Running on http://localhost:5000")
2. Make sure port 5000 is not being used by another application

### Error: "CORS policy error"
The Flask server has CORS enabled. Make sure you're opening the HTML file directly (not through a different web server).

## System Requirements

- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 500MB for models and dependencies
- **Internet**: Only needed for initial package installation
- **Browser**: Chrome, Firefox, Edge, or Safari (latest versions)

## Support

For issues or questions:
- Check README.md for full documentation
- Review API endpoints in the documentation
- Test models using sample_dashboard_data.json

---

**Team**: Sereno, Page, Dulce, Laudato  
**Teacher**: Sir Charlston Sean Gono
