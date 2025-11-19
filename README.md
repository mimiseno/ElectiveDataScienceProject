# Advanced Data Mining for Customer Segmentation and Sales Forecasting

**An Analytics Framework for E-commerce Optimization**

## 👥 Team Members
- Sereno, Micah T.
- Page, King Edward T.
- Dulce, Mielle Angelie, B.
- Laudato, Sir Lawrence C.

**Teacher:** Sir Charlston Sean Gono

---

## 📋 Project Overview

This project implements advanced data mining techniques to solve critical e-commerce business challenges:

1. **Customer Segmentation** using K-Means clustering with RFM (Recency, Frequency, Monetary) analysis
2. **Sales Forecasting** using Facebook Prophet algorithm
3. **Business Intelligence Dashboard** for actionable insights

---

## 🚀 Quick Start Guide

### Option 1: Run with npm (Recommended)

#### Step 1: Install Dependencies
```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt
cd ..

# Install Node dependencies
npm install
```

#### Step 2: Run Both Frontend & Backend
```bash
# Option A: Run both simultaneously
npm run both

# Option B: Run separately in 2 terminals
# Terminal 1 - Backend:
npm run backend
# Or: python backend/api.py

# Terminal 2 - Frontend:
npm run dev
```

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

## 📝 Usage Tips

1. **First Time Running:**
   - Start with Step 1 (Install libraries)
   - Run cells one by one to see outputs
   - Wait for Prophet training (may take 2-3 minutes)

2. **Troubleshooting:**
   - If imports fail, restart runtime and reinstall packages
   - Ensure dataset path is correct
   - Check that all cells run in order

3. **Customization:**
   - Adjust `optimal_k` in Step 5 based on elbow chart
   - Modify forecast period in Step 6 (change `periods=30`)
   - Add custom cluster labels based on your business

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
