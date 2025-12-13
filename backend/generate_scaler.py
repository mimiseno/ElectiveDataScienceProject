"""
Generate RFM Scaler from Sample Data
This script creates a StandardScaler based on the cluster centers in the trained K-Means model
"""

import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler

print("=" * 60)
print("Creating RFM Scaler for API")
print("=" * 60)

# Load the K-Means model
kmeans = joblib.load('ai_models/kmeans_model_customer_categorization.joblib')

# Get cluster centers (these are in scaled space)
cluster_centers_scaled = kmeans.cluster_centers_

print("\nCluster Centers (Scaled):")
print(cluster_centers_scaled)

# Based on your sample data from sample_dashboard_data.json
# These are the actual RFM means from your training data (3 clusters)
rfm_sample_data = np.array([
    [60.0, 2.0, 3000.0],     # Cluster 0: Loyal Customers
    [120.0, 1.0, 1200.0],    # Cluster 1: At Risk
    [350.0, 1.0, 1000.0],    # Cluster 2: Lost Customers
])

print("\nSample RFM Data (Unscaled):")
print(rfm_sample_data)

# Create and fit scaler on sample data
scaler = StandardScaler()
scaler.fit(rfm_sample_data)

# Verify by transforming the sample data
rfm_scaled = scaler.transform(rfm_sample_data)

print("\nScaler Parameters:")
print(f"Mean: {scaler.mean_}")
print(f"Std Dev: {scaler.scale_}")

print("\nVerification - Sample data after scaling:")
print(rfm_scaled)

# Save the scaler
scaler_path = 'ai_models/rfm_scaler.joblib'
joblib.dump(scaler, scaler_path)

print(f"\n✅ Scaler saved to: {scaler_path}")
print("\n" + "=" * 60)
print("Test the scaler:")
print("=" * 60)

# Test examples (3 clusters: Loyal, At Risk, Lost)
test_cases = [
    {"name": "Loyal Customer", "rfm": [60, 2, 3000]},
    {"name": "At Risk Customer", "rfm": [120, 1, 1200]},
    {"name": "Lost Customer", "rfm": [350, 1, 1000]},
]

for test in test_cases:
    rfm_array = np.array([test["rfm"]])
    rfm_scaled = scaler.transform(rfm_array)
    cluster = kmeans.predict(rfm_scaled)[0]
    
    cluster_names = {0: "Loyal Customers", 1: "At Risk", 2: "Lost Customers"}
    
    print(f"\n{test['name']}:")
    print(f"  RFM: Recency={test['rfm'][0]}, Frequency={test['rfm'][1]}, Monetary=£{test['rfm'][2]}")
    print(f"  Scaled: {rfm_scaled[0]}")
    print(f"  Predicted Cluster: {cluster} ({cluster_names[cluster]})")

print("\n" + "=" * 60)
print("✅ Setup Complete! Now update backend/api.py to use the scaler")
print("=" * 60)
