"""
Flask API Backend for E-commerce Analytics Dashboard
Serves pre-trained ML models for customer segmentation and sales forecasting

Models:
- K-Means: Customer segmentation based on RFM analysis
- Prophet: Time-series sales forecasting

Team: Sereno, Page, Dulce, Laudato
Teacher: Sir Charlston Sean Gono
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Model paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KMEANS_MODEL_PATH = os.path.join(BASE_DIR, 'ai_models', 'kmeans_model_customer_categorization.joblib')
PROPHET_MODEL_PATH = os.path.join(BASE_DIR, 'ai_models', 'prophet_model_sales_forecast.joblib')
RFM_SCALER_PATH = os.path.join(BASE_DIR, 'ai_models', 'rfm_scaler.joblib')

# Load models at startup
try:
    kmeans_model = joblib.load(KMEANS_MODEL_PATH)
    prophet_model = joblib.load(PROPHET_MODEL_PATH)
    rfm_scaler = joblib.load(RFM_SCALER_PATH)
    print("✅ Models loaded successfully!")
    print(f"   - K-Means model: {KMEANS_MODEL_PATH}")
    print(f"   - Prophet model: {PROPHET_MODEL_PATH}")
    print(f"   - RFM Scaler: {RFM_SCALER_PATH}")
except Exception as e:
    print(f"❌ Error loading models: {e}")
    kmeans_model = None
    prophet_model = None
    rfm_scaler = None

# Cluster mapping
CLUSTER_NAMES = {
    0: "Lost Customers",
    1: "At Risk",
    2: "Loyal Customers",
    3: "Champions"
}

CLUSTER_DESCRIPTIONS = {
    0: "Customers who haven't purchased recently and have low engagement. Need win-back campaigns.",
    1: "Previously active customers showing declining engagement. Require re-engagement strategies.",
    2: "Frequent buyers with consistent spending. Focus on loyalty rewards and retention.",
    3: "High-value, recent buyers with frequent purchases. Target for VIP programs and upselling."
}

CLUSTER_RECOMMENDATIONS = {
    0: [
        "📧 Send win-back email with special discount (20-30% off)",
        "🎁 Offer exclusive 'we miss you' promotion",
        "📱 Use retargeting ads on social media",
        "💰 Provide loyalty points bonus for return"
    ],
    1: [
        "⏰ Send reminder emails about abandoned carts",
        "🎯 Personalized product recommendations",
        "📊 Survey to understand declining engagement",
        "🔔 Re-engage with limited-time offers"
    ],
    2: [
        "⭐ Implement loyalty rewards program",
        "🎁 Early access to new products",
        "💝 Birthday/anniversary special offers",
        "📢 Request reviews and referrals"
    ],
    3: [
        "👑 VIP tier with exclusive benefits",
        "💎 Premium customer service",
        "🎪 Exclusive event invitations",
        "💰 Upsell premium products"
    ]
}


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API and models are running"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': {
            'kmeans': kmeans_model is not None,
            'prophet': prophet_model is not None
        },
        'timestamp': datetime.now().isoformat()
    })


@app.route('/predict/segment', methods=['POST'])
def predict_customer_segment():
    """
    Predict customer segment using K-Means model
    
    Expected JSON payload:
    {
        "recency": float,
        "frequency": float,
        "monetary": float
    }
    
    Returns:
    {
        "cluster": int,
        "cluster_name": str,
        "description": str,
        "recommendations": list,
        "rfm_values": dict
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
        monetary = float(data['monetary'])
        
        # Input validation - reasonable business limits
        if recency < 0 or recency > 1000:
            return jsonify({'error': 'Recency must be between 0 and 1000 days'}), 400
        if frequency < 1 or frequency > 1000:
            return jsonify({'error': 'Frequency must be between 1 and 1000 purchases'}), 400
        if monetary <= 0 or monetary > 1000000:
            return jsonify({'error': 'Monetary must be between £0.01 and £1,000,000'}), 400
        
        # Create input array and scale it
        X = np.array([[recency, frequency, monetary]])
        
        # Scale the input using the same scaler from training
        if rfm_scaler is None:
            return jsonify({'error': 'RFM Scaler not loaded'}), 500
        
        X_scaled = rfm_scaler.transform(X)
        
        # Predict cluster on scaled data
        cluster = int(kmeans_model.predict(X_scaled)[0])
        
        # Prepare response
        response = {
            'cluster': cluster,
            'cluster_name': CLUSTER_NAMES.get(cluster, f'Cluster {cluster}'),
            'description': CLUSTER_DESCRIPTIONS.get(cluster, 'No description available'),
            'recommendations': CLUSTER_RECOMMENDATIONS.get(cluster, []),
            'rfm_values': {
                'recency': recency,
                'frequency': frequency,
                'monetary': monetary
            },
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
    Generate sales forecast using Prophet model
    
    Expected JSON payload:
    {
        "start_date": "YYYY-MM-DD" (optional, defaults to tomorrow),
        "periods": int (number of days to forecast, default 7)
    }
    
    Returns:
    {
        "forecast": [
            {
                "ds": "YYYY-MM-DD",
                "yhat": float,
                "yhat_lower": float,
                "yhat_upper": float
            }
        ],
        "summary": {
            "avg_daily_sales": float,
            "total_projected": float,
            "uncertainty_range": str
        }
    }
    """
    try:
        if prophet_model is None:
            return jsonify({'error': 'Prophet model not loaded'}), 500
        
        data = request.get_json()
        
        # Get parameters with defaults
        start_date = data.get('start_date', None)
        periods = int(data.get('periods', 7))
        
        # Validate periods
        if periods < 1 or periods > 365:
            return jsonify({'error': 'Periods must be between 1 and 365'}), 400
        
        # Create future dataframe
        if start_date:
            try:
                start_date = pd.to_datetime(start_date)
            except:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        else:
            start_date = pd.to_datetime('today') + timedelta(days=1)
        
        # Generate future dates
        future_dates = pd.date_range(start=start_date, periods=periods, freq='D')
        future_df = pd.DataFrame({'ds': future_dates})
        
        # Make predictions
        forecast = prophet_model.predict(future_df)
        
        # Extract relevant columns and convert to list of dicts
        forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].copy()
        forecast_data['ds'] = forecast_data['ds'].dt.strftime('%Y-%m-%d')
        forecast_list = forecast_data.to_dict('records')
        
        # Calculate summary statistics
        avg_sales = float(forecast['yhat'].mean())
        total_projected = float(forecast['yhat'].sum())
        avg_uncertainty = float(((forecast['yhat_upper'] - forecast['yhat_lower']) / forecast['yhat']).mean() * 100)
        
        response = {
            'forecast': forecast_list,
            'summary': {
                'avg_daily_sales': avg_sales,
                'total_projected': total_projected,
                'uncertainty_range': f'±{avg_uncertainty:.1f}%',
                'periods': periods,
                'start_date': start_date.strftime('%Y-%m-%d')
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
        info = {
            'kmeans_model': {
                'loaded': kmeans_model is not None,
                'path': KMEANS_MODEL_PATH,
                'clusters': 4,
                'features': ['recency', 'frequency', 'monetary'],
                'cluster_names': CLUSTER_NAMES
            },
            'prophet_model': {
                'loaded': prophet_model is not None,
                'path': PROPHET_MODEL_PATH,
                'max_forecast_days': 365,
                'features': ['date'],
                'output': ['yhat', 'yhat_lower', 'yhat_upper']
            }
        }
        
        return jsonify(info), 200
        
    except Exception as e:
        return jsonify({'error': f'Error getting model info: {str(e)}'}), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 E-commerce Analytics API Server")
    print("="*60)
    print(f"📊 API Base URL: http://localhost:5000")
    print(f"🔗 Health Check: http://localhost:5000/health")
    print(f"🎯 Customer Segmentation: POST /predict/segment")
    print(f"📈 Sales Forecast: POST /predict/forecast")
    print(f"ℹ️  Model Info: GET /models/info")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
