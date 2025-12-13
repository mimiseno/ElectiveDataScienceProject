""" 
Flask API Backend for E-commerce Analytics Dashboard
Serves pre-trained ML models for customer segmentation and sales forecasting

Models:
- K-Means: Customer segmentation based on RFM analysis
- XGBoost: Feature-based sales prediction

Team: Sereno, Page, Dulce, Laudato
Teacher: Sir Charlston Sean Gono
"""

import sys
import os

# Check Python version
if sys.version_info < (3, 8):
    print("ERROR: Python 3.8 or higher is required")
    print(f"Current version: {sys.version}")
    sys.exit(1)

# Check required packages
required_packages = {
    'flask': 'Flask',
    'flask_cors': 'Flask-CORS',
    'joblib': 'joblib',
    'pandas': 'pandas',
    'numpy': 'numpy',
    'scipy': 'scipy',
    'sklearn': 'scikit-learn',
    'xgboost': 'xgboost'
}

missing_packages = []
for package, install_name in required_packages.items():
    try:
        __import__(package)
    except ImportError:
        missing_packages.append(install_name)

if missing_packages:
    print("=" * 70)
    print("ERROR: Missing required Python packages!")
    print("=" * 70)
    print("\nPlease install the following packages:\n")
    print(f"  pip install {' '.join(missing_packages)}")
    print("\nOr install all requirements:")
    print("  pip install -r requirements.txt")
    print("=" * 70)
    sys.exit(1)

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from scipy.spatial.distance import cdist

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Model paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KMEANS_MODEL_PATH = os.path.join(BASE_DIR, 'ai_models', 'kmeans_model_customer_categorization.joblib')
XGBOOST_MODEL_PATH = os.path.join(BASE_DIR, 'ai_models', 'xgboost_model_sales_forecast.joblib')
RFM_SCALER_PATH = os.path.join(BASE_DIR, 'ai_models', 'rfm_scaler.joblib')

# Load models at startup
kmeans_model = None
xgboost_model = None
rfm_scaler = None

try:
    kmeans_model = joblib.load(KMEANS_MODEL_PATH)
    print(f"✅ K-Means model loaded: {KMEANS_MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading K-Means model: {e}")

try:
    xgboost_model = joblib.load(XGBOOST_MODEL_PATH)
    print(f"✅ XGBoost model loaded: {XGBOOST_MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading XGBoost model: {e}")

try:
    rfm_scaler = joblib.load(RFM_SCALER_PATH)
    print(f"✅ RFM Scaler loaded: {RFM_SCALER_PATH}")
except Exception as e:
    print(f"❌ Error loading RFM Scaler: {e}")

# Currency settings
# Model is trained on Brazilian Real (BRL) from Olist dataset
# Display currency is Philippine Peso (PHP)
# 1 BRL = ~10.5 PHP (as of 2024)
BRL_TO_PHP = 10.5
MODEL_CURRENCY = 'BRL'
DISPLAY_CURRENCY = 'PHP'
CURRENCY_SYMBOL = '₱'

# Cluster mapping (3 clusters) - Based on retrained K-Means model:
# Cluster 0: Lost Customers (R=381, F=1.0, M=141 - highest recency, lowest engagement)
# Cluster 1: At Risk (R=130, F=1.0, M=147 - medium recency, declining activity)
# Cluster 2: Loyal Customers (R=220, F=2.0, M=224 - best frequency and spending)
CLUSTER_NAMES = {
    0: "Lost Customers",
    1: "At Risk",
    2: "Loyal Customers"
}

CLUSTER_DESCRIPTIONS = {
    0: "Customers who haven't purchased recently and have low engagement. They need win-back campaigns and special re-activation offers.",
    1: "Recent customers with declining activity showing early warning signs. Re-engage before they become lost customers.",
    2: "Customers with good spending and frequency. Focus on retention through loyalty programs."
}

CLUSTER_RECOMMENDATIONS = {
    0: [
        "Send win-back email with special discount (20-30% off)",
        "Offer exclusive 'we miss you' promotion",
        "Use retargeting ads on social media",
        "Provide loyalty points bonus for return",
        "Survey to understand why they left"
    ],
    1: [
        "Send reminder emails about new arrivals",
        "Personalized product recommendations",
        "Re-engage with limited-time offers",
        "First purchase anniversary celebration",
        "Survey to understand their needs"
    ],
    2: [
        "Implement loyalty rewards program",
        "Early access to new products",
        "Birthday/anniversary special offers",
        "Request reviews and referrals",
        "Invite to exclusive member events"
    ]
}

# Realistic input ranges based on Olist training data (in PHP)
# Olist data: Recency 1-400 days, Frequency 1-10, Monetary R$50-R$5000
# Converting to PHP: R$1 ≈ ₱10.5
INPUT_LIMITS = {
    'recency': {'min': 1, 'max': 400, 'unit': 'days'},
    'frequency': {'min': 1, 'max': 10, 'unit': 'purchases'},
    'monetary': {'min': 0, 'max': 50000, 'unit': 'PHP'}  # ~R$0 to ~R$5000 (allows free/low-cost items)
}


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API and models are running"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': {
            'kmeans': kmeans_model is not None,
            'xgboost': xgboost_model is not None,
            'rfm_scaler': rfm_scaler is not None
        },
        'timestamp': datetime.now().isoformat()
    })


@app.route('/predict/segment', methods=['POST'])
def predict_customer_segment():
    """
    Predict customer segment using K-Means model
    
    Expected JSON payload:
    {
        "recency": float (days since last purchase, 1-365),
        "frequency": float (number of purchases, 1-50),
        "monetary": float (total spending in PHP, 500-750000)
    }
    
    Returns:
    {
        "cluster": int,
        "cluster_name": str,
        "description": str,
        "recommendations": list,
        "rfm_values": dict (in PHP),
        "confidence": dict
    }
    """
    try:
        if kmeans_model is None:
            return jsonify({'error': 'K-Means model not loaded'}), 500
        
        data = request.get_json()
        
        # Validate input
        required_fields = ['recency', 'frequency', 'monetary']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        recency = float(data['recency'])
        frequency = float(data['frequency'])
        monetary_php = float(data['monetary'])
        
        # Input validation - realistic business limits based on training data
        if recency < INPUT_LIMITS['recency']['min'] or recency > INPUT_LIMITS['recency']['max']:
            return jsonify({'error': f"Recency must be between {INPUT_LIMITS['recency']['min']} and {INPUT_LIMITS['recency']['max']} days"}), 400
        if frequency < INPUT_LIMITS['frequency']['min'] or frequency > INPUT_LIMITS['frequency']['max']:
            return jsonify({'error': f"Frequency must be between {INPUT_LIMITS['frequency']['min']} and {INPUT_LIMITS['frequency']['max']} purchases"}), 400
        if monetary_php < INPUT_LIMITS['monetary']['min'] or monetary_php > INPUT_LIMITS['monetary']['max']:
            return jsonify({'error': f"Monetary must be between ₱{INPUT_LIMITS['monetary']['min']:,} and ₱{INPUT_LIMITS['monetary']['max']:,}"}), 400
        
        # Convert PHP to BRL for model (model was trained on BRL)
        monetary_brl = monetary_php / BRL_TO_PHP
        
        # Create input array and scale it
        X = np.array([[recency, frequency, monetary_brl]])
        
        # Scale the input using the same scaler from training
        if rfm_scaler is None:
            return jsonify({'error': 'RFM Scaler not loaded'}), 500
        
        X_scaled = rfm_scaler.transform(X)
        
        # Predict cluster on scaled data
        cluster = int(kmeans_model.predict(X_scaled)[0])
        
        # Calculate confidence level based on distance to cluster centroid
        # Get distances to all cluster centroids
        centroids = kmeans_model.cluster_centers_
        distances = cdist(X_scaled, centroids, metric='euclidean')[0]
        
        # Distance to assigned cluster centroid
        assigned_distance = distances[cluster]
        
        # Calculate confidence: closer to centroid = higher confidence
        # Using softmax-like approach: confidence based on inverse distance
        inv_distances = 1 / (distances + 1e-10)  # Avoid division by zero
        confidence_scores = inv_distances / inv_distances.sum()
        confidence = float(confidence_scores[cluster] * 100)
        
        # Also calculate silhouette-like score for this point
        # (distance to nearest other cluster vs distance to own cluster)
        other_distances = np.delete(distances, cluster)
        nearest_other = other_distances.min() if len(other_distances) > 0 else assigned_distance
        silhouette_score = (nearest_other - assigned_distance) / max(nearest_other, assigned_distance)
        
        # Convert silhouette to percentage (range -1 to 1 -> 0% to 100%)
        silhouette_confidence = float((silhouette_score + 1) / 2 * 100)
        
        # Combined confidence (average of both methods)
        combined_confidence = (confidence + silhouette_confidence) / 2
        
        # Prepare response (monetary shown in PHP)
        response = {
            'cluster': cluster,
            'cluster_name': CLUSTER_NAMES.get(cluster, f'Cluster {cluster}'),
            'description': CLUSTER_DESCRIPTIONS.get(cluster, 'No description available'),
            'recommendations': CLUSTER_RECOMMENDATIONS.get(cluster, []),
            'rfm_values': {
                'recency': recency,
                'recency_unit': 'days',
                'frequency': frequency,
                'frequency_unit': 'purchases',
                'monetary': monetary_php,
                'monetary_unit': 'PHP',
                'monetary_brl': round(monetary_brl, 2)
            },
            'confidence': {
                'overall': round(combined_confidence, 2),
                'centroid_proximity': round(confidence, 2),
                'cluster_separation': round(silhouette_confidence, 2),
                'distance_to_centroid': round(float(assigned_distance), 4)
            },
            'all_cluster_probabilities': {
                CLUSTER_NAMES.get(i, f'Cluster {i}'): round(float(confidence_scores[i] * 100), 2)
                for i in range(len(centroids))
            },
            'input_limits': INPUT_LIMITS,
            'currency': 'PHP',
            'model_currency': MODEL_CURRENCY,
            'exchange_rate': f'1 BRL = {BRL_TO_PHP} PHP',
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response), 200
        
    except ValueError as e:
        return jsonify({'error': f'Invalid input values: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500


@app.route('/predict/forecast', methods=['POST'])
def predict_sales_forecast():
    """
    Generate sales forecast using XGBoost model
    
    Expected JSON payload:
    {
        "start_date": "YYYY-MM-DD" (optional, defaults to tomorrow),
        "periods": int (number of days to forecast, default 7)
    }
    
    XGBoost uses feature engineering with lag and rolling statistics for predictions.
    """
    try:
        data = request.get_json() or {}
        
        # Get parameters with defaults
        start_date = data.get('start_date', None)
        periods = int(data.get('periods', 7))
        
        # Validate periods
        if periods < 1 or periods > 365:
            return jsonify({'error': 'Periods must be between 1 and 365'}), 400
        
        # Check if XGBoost model is loaded
        if xgboost_model is None:
            return jsonify({'error': 'XGBoost model not loaded'}), 500
        
        # Create future dataframe
        if start_date:
            try:
                start_date = pd.to_datetime(start_date)
            except Exception:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        else:
            start_date = pd.to_datetime('today') + timedelta(days=1)
        
        # Generate future dates for display
        future_dates = pd.date_range(start=start_date, periods=periods, freq='D')
        
        forecast_list = []
        
        # XGBoost predictions (requires feature engineering)
        # Create features for XGBoost
        xgb_features = pd.DataFrame({'Date': future_dates})
        xgb_features['DayOfWeek'] = xgb_features['Date'].dt.dayofweek
        xgb_features['Month'] = xgb_features['Date'].dt.month
        xgb_features['DayOfMonth'] = xgb_features['Date'].dt.day
        xgb_features['WeekOfYear'] = xgb_features['Date'].dt.isocalendar().week.astype(int)
        
        # For lag and rolling features, we need to use reasonable defaults
        # since we don't have historical data in this API call
        # Using average values as placeholders (Olist dataset averages)
        avg_daily_sales = 50000  # Reasonable average from Olist training data (R$)
        
        for lag in [1, 7, 14, 28]:
            xgb_features[f'Lag_{lag}'] = avg_daily_sales
        
        for window in [7, 14, 30]:
            xgb_features[f'Rolling_Mean_{window}'] = avg_daily_sales
            xgb_features[f'Rolling_Std_{window}'] = avg_daily_sales * 0.3  # ~30% std
        
        # Get feature columns (exclude Date)
        feature_cols = [c for c in xgb_features.columns if c != 'Date']
        X_future = xgb_features[feature_cols]
        
        # Make predictions and clip negative values
        xgb_pred = xgboost_model.predict(X_future)
        xgb_pred = np.clip(xgb_pred, 0, None)  # No negative sales
        
        forecast_df = pd.DataFrame({
            'ds': future_dates,
            'yhat': xgb_pred,
            # XGBoost doesn't have native uncertainty, estimate as ±15%
            'yhat_lower': xgb_pred * 0.85,
            'yhat_upper': xgb_pred * 1.15
        })
        model_used = 'XGBoost'
        
        # Convert to list of dicts with confidence metrics
        for idx, row in forecast_df.iterrows():
            ds = row['ds']
            if hasattr(ds, 'strftime'):
                ds_str = ds.strftime('%Y-%m-%d')
            else:
                ds_str = str(ds)
            
            yhat = float(row['yhat'])
            yhat_lower = float(row['yhat_lower'])
            yhat_upper = float(row['yhat_upper'])
            
            # Ensure non-negative values
            yhat = max(0, yhat)
            yhat_lower = max(0, yhat_lower)
            yhat_upper = max(0, yhat_upper)
            
            # Calculate confidence based on prediction interval width
            interval_width = yhat_upper - yhat_lower
            if yhat > 0:
                relative_uncertainty = (interval_width / yhat) * 100
            else:
                relative_uncertainty = 100  # Maximum uncertainty if prediction is 0
            
            # Confidence: narrower interval = higher confidence (capped at 95%, min 10%)
            # If relative uncertainty is 10%, confidence is 90%; if 50%, confidence is 50%
            confidence = max(10, min(95, 100 - relative_uncertainty))
            
            forecast_list.append({
                'ds': ds_str,
                'yhat': round(yhat, 2),
                'yhat_lower': round(yhat_lower, 2),
                'yhat_upper': round(yhat_upper, 2),
                'confidence': round(confidence, 2),
                'uncertainty_pct': round(relative_uncertainty, 2)
            })
        
        # Calculate summary statistics
        yhats = [f['yhat'] for f in forecast_list]
        confidences = [f['confidence'] for f in forecast_list]
        
        avg_sales = sum(yhats) / len(yhats)
        total_projected = sum(yhats)
        avg_confidence = sum(confidences) / len(confidences)
        avg_uncertainty = sum([f['uncertainty_pct'] for f in forecast_list]) / len(forecast_list)
        
        response = {
            'forecast': forecast_list,
            'model_used': model_used,
            'summary': {
                'avg_daily_sales': round(avg_sales, 2),
                'total_projected': round(total_projected, 2),
                'avg_confidence': round(avg_confidence, 2),
                'uncertainty_range': f'±{avg_uncertainty:.1f}%',
                'periods': periods,
                'start_date': start_date.strftime('%Y-%m-%d')
            },
            'models_available': {
                'xgboost': xgboost_model is not None
            },
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response), 200
        
    except ValueError as e:
        return jsonify({'error': f'Invalid input values: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Forecast error: {str(e)}'}), 500


@app.route('/models/info', methods=['GET'])
def get_models_info():
    """Get information about loaded models"""
    try:
        n_clusters = kmeans_model.n_clusters if kmeans_model is not None else 0
        
        info = {
            'kmeans_model': {
                'loaded': kmeans_model is not None,
                'path': KMEANS_MODEL_PATH,
                'clusters': n_clusters,
                'features': ['recency', 'frequency', 'monetary'],
                'cluster_names': CLUSTER_NAMES,
                'description': 'Customer segmentation using RFM analysis'
            },
            'xgboost_model': {
                'loaded': xgboost_model is not None,
                'path': XGBOOST_MODEL_PATH,
                'max_forecast_days': 365,
                'features': ['DayOfWeek', 'Month', 'DayOfMonth', 'WeekOfYear', 
                            'Lag_1', 'Lag_7', 'Lag_14', 'Lag_28',
                            'Rolling_Mean_7', 'Rolling_Mean_14', 'Rolling_Mean_30',
                            'Rolling_Std_7', 'Rolling_Std_14', 'Rolling_Std_30'],
                'output': ['yhat'],
                'description': 'Gradient boosting with feature engineering for sales forecasting'
            },
            'rfm_scaler': {
                'loaded': rfm_scaler is not None,
                'path': RFM_SCALER_PATH,
                'description': 'StandardScaler for RFM normalization'
            }
        }
        
        return jsonify(info), 200
        
    except Exception as e:
        return jsonify({'error': f'Error getting model info: {str(e)}'}), 500


@app.route('/predict/segment/bulk', methods=['POST'])
def predict_customer_segment_bulk():
    """
    Bulk predict customer segments using K-Means model (optimized for large datasets)
    
    Expected JSON payload:
    {
        "customers": [
            {"customer_id": "CUST001", "recency": float, "frequency": float, "monetary": float},
            {"customer_id": "CUST002", "recency": float, "frequency": float, "monetary": float},
            ...
        ]
    }
    
    Returns:
    {
        "results": [
            {"customer_id": "CUST001", "cluster": int, "cluster_name": str, "confidence": float, ...},
            ...
        ],
        "total": int,
        "success_count": int,
        "error_count": int
    }
    """
    try:
        if kmeans_model is None or rfm_scaler is None:
            return jsonify({'error': 'K-Means model or scaler not loaded'}), 500
        
        data = request.get_json()
        
        if 'customers' not in data:
            return jsonify({'error': 'Missing required field: customers'}), 400
        
        customers = data['customers']
        
        if not isinstance(customers, list) or len(customers) == 0:
            return jsonify({'error': 'customers must be a non-empty list'}), 400
        
        results = []
        success_count = 0
        error_count = 0
        
        # Process all customers in batch
        for customer in customers:
            try:
                # Validate required fields
                if not all(k in customer for k in ['customer_id', 'recency', 'frequency', 'monetary']):
                    results.append({
                        'customer_id': customer.get('customer_id', 'unknown'),
                        'error': 'Missing required fields',
                        'success': False
                    })
                    error_count += 1
                    continue
                
                customer_id = customer['customer_id']
                recency = float(customer['recency'])
                frequency = float(customer['frequency'])
                monetary_php = float(customer['monetary'])
                
                # Validate ranges
                if recency < INPUT_LIMITS['recency']['min'] or recency > INPUT_LIMITS['recency']['max']:
                    results.append({
                        'customer_id': customer_id,
                        'error': f"Recency out of range ({INPUT_LIMITS['recency']['min']}-{INPUT_LIMITS['recency']['max']})",
                        'success': False
                    })
                    error_count += 1
                    continue
                
                if frequency < INPUT_LIMITS['frequency']['min'] or frequency > INPUT_LIMITS['frequency']['max']:
                    results.append({
                        'customer_id': customer_id,
                        'error': f"Frequency out of range ({INPUT_LIMITS['frequency']['min']}-{INPUT_LIMITS['frequency']['max']})",
                        'success': False
                    })
                    error_count += 1
                    continue
                
                if monetary_php < INPUT_LIMITS['monetary']['min'] or monetary_php > INPUT_LIMITS['monetary']['max']:
                    results.append({
                        'customer_id': customer_id,
                        'error': f"Monetary out of range ({INPUT_LIMITS['monetary']['min']}-{INPUT_LIMITS['monetary']['max']})",
                        'success': False
                    })
                    error_count += 1
                    continue
                
                # Convert PHP to BRL
                monetary_brl = monetary_php / BRL_TO_PHP
                
                # Create input and scale
                X = np.array([[recency, frequency, monetary_brl]])
                X_scaled = rfm_scaler.transform(X)
                
                # Predict cluster
                cluster = int(kmeans_model.predict(X_scaled)[0])
                
                # Calculate confidence
                centroids = kmeans_model.cluster_centers_
                distances = cdist(X_scaled, centroids, metric='euclidean')[0]
                assigned_distance = distances[cluster]
                inv_distances = 1 / (distances + 1e-10)
                confidence_scores = inv_distances / inv_distances.sum()
                confidence = float(confidence_scores[cluster] * 100)
                
                results.append({
                    'customer_id': customer_id,
                    'cluster': cluster,
                    'cluster_name': CLUSTER_NAMES.get(cluster, f'Cluster {cluster}'),
                    'confidence': round(confidence, 2),
                    'recency': recency,
                    'frequency': frequency,
                    'monetary': monetary_php,
                    'monetary_brl': round(monetary_brl, 2),
                    'success': True
                })
                success_count += 1
                
            except Exception as e:
                results.append({
                    'customer_id': customer.get('customer_id', 'unknown'),
                    'error': str(e),
                    'success': False
                })
                error_count += 1
        
        return jsonify({
            'results': results,
            'total': len(customers),
            'success_count': success_count,
            'error_count': error_count,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Bulk prediction error: {str(e)}'}), 500


if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 E-commerce Analytics API Server")
    print("="*70)
    print(f"\n📊 API Base URL: http://localhost:5000")
    print(f"\n🔗 Endpoints:")
    print(f"   GET  /health                  - Health check")
    print(f"   GET  /models/info             - Model information")
    print(f"   POST /predict/segment         - Customer segmentation (single)")
    print(f"   POST /predict/segment/bulk    - Customer segmentation (batch)")
    print(f"   POST /predict/forecast        - Sales forecast (XGBoost)")
    print(f"\n🤖 Models Loaded:")
    print(f"   ✅ K-Means:  {kmeans_model is not None}")
    print(f"   ✅ XGBoost:  {xgboost_model is not None}")
    print(f"   ✅ Scaler:   {rfm_scaler is not None}")
    print("="*70 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
