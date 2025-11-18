# 🚀 Google Colab Quick Start Guide

## Step-by-Step Instructions

### 1️⃣ Upload to Google Colab

1. Go to [Google Colab](https://colab.research.google.com/)
2. Click **File → Upload notebook**
3. Select `Customer_Segmentation_and_Sales_Forcasting(Ser_Pag_Lau_Dul).ipynb`

### 2️⃣ Get the Dataset

**Option A: Upload to Colab (Faster)**
1. Download dataset: [Online Retail Dataset](https://archive.ics.uci.edu/ml/machine-learning-databases/00352/Online%20Retail.xlsx)
2. In Colab, click the folder icon (📁) on the left sidebar
3. Click upload button and select `Online-Retail.xlsx`
4. In the notebook, use this path:
   ```python
   file_path = 'Online-Retail.xlsx'
   ```

**Option B: Use Google Drive (Recommended for reuse)**
1. Download the dataset (link above)
2. Upload to your Google Drive
3. In the notebook, uncomment these lines in Step 2:
   ```python
   from google.colab import drive
   drive.mount('/content/drive')
   file_path = '/content/drive/MyDrive/Online-Retail.xlsx'
   ```
4. Update the path to match your Drive location

### 3️⃣ Run the Notebook

1. Click **Runtime → Run all** (or press Ctrl+F9)
2. Or run each cell one by one using Shift+Enter

**Expected Runtime:** 5-10 minutes (depending on connection speed)

### 4️⃣ Download Results

After all cells finish running:

1. Click the folder icon (📁) on the left sidebar
2. Download these files (right-click → Download):
   - ✅ `dashboard_data.json` (REQUIRED for dashboard)
   - ✅ All `.png` files (visualizations)
   - ✅ All `.csv` files (data outputs)

### 5️⃣ View Dashboard

1. Open `dashboard.html` in your browser
2. Click "Choose JSON File"
3. Select the downloaded `dashboard_data.json`
4. 🎉 Enjoy your interactive dashboard!

---

## ⚠️ Troubleshooting

### Problem: "ModuleNotFoundError"
**Solution:** Make sure to run the first cell that installs packages:
```python
!pip install pandas numpy scikit-learn matplotlib seaborn prophet openpyxl -q
```

### Problem: "FileNotFoundError"
**Solution:** Check your file path is correct. If using uploaded file:
```python
file_path = 'Online-Retail.xlsx'  # No path prefix needed
```

### Problem: Prophet takes too long
**Solution:** This is normal! Prophet training can take 2-5 minutes. Just wait.

### Problem: Out of memory
**Solution:** 
1. Click **Runtime → Restart runtime**
2. Run cells again
3. Or use **Runtime → Change runtime type → GPU** for more RAM

---

## 💡 Pro Tips

1. **Save to Drive:** After running, save outputs to Google Drive:
   ```python
   # Add this at the end of Step 8
   !cp *.csv *.json *.png /content/drive/MyDrive/project_outputs/
   ```

2. **Check Progress:** Watch the cell execution counter [*] → [1], [2], etc.

3. **Cell-by-Cell:** Run step-by-step to see each output clearly

4. **Re-run Specific Cells:** You can re-run any cell without running all

---

## 📊 Expected Outputs

After successful run, you should see:

✅ **11 files created:**
- 6 CSV files (data)
- 5 PNG files (charts)
- 1 JSON file (dashboard data)

✅ **Console outputs showing:**
- Data cleaning summary
- RFM statistics
- Cluster analysis results
- Forecast accuracy metrics
- Business recommendations

✅ **Visualizations displayed:**
- RFM distributions (3 histograms)
- Elbow method chart
- 3D cluster plot
- Sales forecast chart
- Forecast components

---

## 🎯 What Each Step Does

| Step | What It Does | Time |
|------|-------------|------|
| 1 | Installs required packages | 30s |
| 2 | Loads the dataset | 5s |
| 3 | Cleans and preprocesses data | 10s |
| 4 | Calculates RFM metrics | 5s |
| 5 | Finds optimal clusters | 30s |
| 6 | Performs K-Means clustering | 10s |
| 7 | Trains Prophet model | 2-3min |
| 8 | Evaluates forecast accuracy | 10s |
| 9 | Generates insights | 5s |
| 10 | Exports dashboard data | 5s |

**Total: ~5-7 minutes**

---

## ✅ Success Checklist

Before submitting/presenting, verify:

- [ ] All cells executed without errors
- [ ] `dashboard_data.json` downloaded
- [ ] Dashboard loads the data correctly
- [ ] You can see 4 customer clusters
- [ ] Forecast shows next 7 days
- [ ] All visualizations generated
- [ ] CSV files contain data

---

## 🆘 Need Help?

1. **Read error messages carefully** - they often tell you what's wrong
2. **Google the error** - someone likely had the same issue
3. **Check file paths** - most common issue
4. **Restart runtime** - fixes many mysterious errors
5. **Ask your team** - collaboration is key!

---

**Good luck with your presentation! 🎓📊**
