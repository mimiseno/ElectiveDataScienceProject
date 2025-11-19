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
# These are the actual RFM means from your training data
rfm_sample_data = np.array([
    [252.06, 1.47, 409.86],   # Cluster 0: Lost Customers
    [51.03, 2.32, 686.81],     # Cluster 1: At Risk
    [29.96, 7.31, 2745.84],    # Cluster 2: Loyal Customers
    [16.9, 16.39, 7564.54]     # Cluster 3: Champions
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

# Test examples
test_cases = [
    {"name": "Champion Customer", "rfm": [15, 20, 8500]},
    {"name": "Lost Customer", "rfm": [250, 1, 350]},
    {"name": "Loyal Customer", "rfm": [30, 8, 2500]},
    {"name": "At Risk Customer", "rfm": [100, 2, 500]}
]

for test in test_cases:
    rfm_array = np.array([test["rfm"]])
    rfm_scaled = scaler.transform(rfm_array)
    cluster = kmeans.predict(rfm_scaled)[0]
    
    cluster_names = {0: "Lost", 1: "At Risk", 2: "Loyal", 3: "Champions"}
    
    print(f"\n{test['name']}:")
    print(f"  RFM: Recency={test['rfm'][0]}, Frequency={test['rfm'][1]}, Monetary=£{test['rfm'][2]}")
    print(f"  Scaled: {rfm_scaled[0]}")
    print(f"  Predicted Cluster: {cluster} ({cluster_names[cluster]})")

print("\n" + "=" * 60)
print("✅ Setup Complete! Now update backend/api.py to use the scaler")
print("=" * 60)
