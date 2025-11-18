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

### Step 1: Run in Google Colab

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

### Step 2: Download Generated Files

After running the notebook, download these files:
- `dashboard_data.json` - Main data for the dashboard
- All PNG images (optional, for presentations)
- All CSV files (for detailed analysis)

### Step 3: View Results in Dashboard

1. Open `dashboard.html` in any web browser
2. Click "Choose JSON File" and upload `dashboard_data.json`
3. View interactive analytics and insights!

---

## 📊 Generated Outputs

### CSV Files
1. **cleaned_data.csv** - Preprocessed transaction data
2. **rfm_table.csv** - RFM metrics for all customers
3. **customer_segments.csv** - Customer cluster assignments
4. **segment_summary.csv** - Statistical summary by segment
5. **sales_forecast_30days.csv** - 30-day sales predictions

### Visualizations (PNG)
1. **rfm_distributions.png** - RFM metric distributions
2. **elbow_method.png** - Optimal cluster selection
3. **customer_segments_3d.png** - 3D cluster visualization
4. **sales_forecast.png** - Sales forecast with trends
5. **forecast_components.png** - Seasonal decomposition

### Dashboard Data
- **dashboard_data.json** - Structured data for HTML dashboard

---

## 🎯 Key Features

### Customer Segmentation
- ✅ RFM Analysis (Recency, Frequency, Monetary)
- ✅ K-Means Clustering with Elbow Method
- ✅ Silhouette Score Analysis
- ✅ 3D Cluster Visualization
- ✅ Business-friendly segment labels

### Sales Forecasting
- ✅ Facebook Prophet algorithm
- ✅ Daily, weekly, and yearly seasonality
- ✅ 30-day forecast with confidence intervals
- ✅ Model accuracy metrics (RMSE, MAE, MAPE)
- ✅ Trend and seasonal component breakdown

### Interactive Dashboard
- ✅ Real-time data loading
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
