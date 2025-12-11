# AI Coding Assistant Instructions

## Project Overview
This is a production-ready **E-commerce Analytics Dashboard** with ML-powered customer segmentation and sales forecasting. The project uses **pre-trained models** for real-time predictions via a Flask API and vanilla JS frontend.

## Architecture

### Three-Layer Structure
- **Frontend**: [`frontend/dashboard.html`](../frontend/dashboard.html) - Single-page dashboard with AJAX API calls
- **Backend**: [`backend/api.py`](../backend/api.py) - Flask REST API serving pre-trained ML models  
- **Models**: [`ai_models/`](../ai_models/) - Joblib-serialized models (K-Means, Prophet, XGBoost)

### Key Data Flow
1. User inputs → Frontend forms → POST to Flask API
2. API loads models from `ai_models/` using `joblib.load()`
3. Input validation → Model inference → JSON response
4. Frontend renders results dynamically

## Critical Development Patterns

### Model Loading Strategy
Models are loaded **once at startup** (not per request):
```python
# In api.py - Global scope
kmeans_model = joblib.load(KMEANS_MODEL_PATH)
prophet_model = joblib.load(PROPHET_MODEL_PATH)
```
- Check `model is not None` before predictions
- Use `ai_models/` directory relative to project root

### Currency Conversion Logic
The system handles **dual currency display**:
- Models trained on Brazilian Real (BRL) from Olist dataset
- Frontend displays Philippine Peso (PHP) for users
- Conversion: `1 BRL = 10.5 PHP` (see `BRL_TO_PHP` constant)
- Always convert PHP→BRL before model inference

### RFM Scaling Pattern
Customer segmentation requires **preprocessing**:
```python
# Convert PHP to BRL, then scale with training scaler
X = np.array([[recency, frequency, monetary_brl]])
X_scaled = rfm_scaler.transform(X)
cluster = kmeans_model.predict(X_scaled)[0]
```

### Prophet Date Mapping
Sales forecasting uses **training-period mapping**:
- Prophet trained on 2016-2018 dates from Olist
- Map user-requested future dates to training-relative dates
- Use `training_end = '2018-07-30'` for consistent seasonal patterns

## Essential Commands

### Development Workflow
```bash
# Start both frontend & backend
npm run both

# Separate terminals
npm run backend  # Starts Flask API on :5000
npm run dev      # Starts live-server on :3000
```

### Model Dependencies
All ML models require these exact versions:
- `prophet==1.1.5` (Facebook's time series library)
- `scikit-learn==1.3.2` (for K-Means and scaling)
- `joblib==1.3.2` (model serialization)

### API Testing
```bash
# Customer segmentation
curl -X POST http://localhost:5000/predict/segment \
  -H "Content-Type: application/json" \
  -d '{"recency": 30, "frequency": 5, "monetary": 1500}'

# Sales forecast  
curl -X POST http://localhost:5000/predict/forecast \
  -d '{"start_date": "2025-12-15", "periods": 7}'
```

## Project-Specific Conventions

### Error Handling Pattern
- **Input validation**: Check ranges against `INPUT_LIMITS` constants
- **Model availability**: Return 500 if models fail to load
- **Graceful degradation**: Ensemble falls back to single model if needed

### File Organization
- **No subdirectories** in `ai_models/` (models directly in root)
- **Single HTML file** approach (no build system)
- **Relative imports** from project root in Python

### Business Logic Clusters
Customer segments use **domain-specific mapping**:
- Cluster 0: "Loyal Customers" (high monetary, low frequency)
- Cluster 1: "Lost Customers" (high recency, low engagement)
- Cluster 2: "Champions" (best frequency and spending)
- Cluster 3: "At Risk" (recent but declining)

Each cluster has predefined recommendations in `CLUSTER_RECOMMENDATIONS` dict.

## Integration Points

### Frontend↔Backend Communication
- **No authentication** (internal use)
- **CORS enabled** for localhost development
- **JSON-only** communication
- **Sync AJAX** calls with loading states

### Model Ensemble Logic
Sales forecasting supports **weighted ensemble**:
- Prophet (60%) + XGBoost (40%) when both available
- Automatic fallback to single model
- Combined uncertainty intervals

### External Dependencies
- **Dataset**: Olist e-commerce data (Brazilian market)
- **Live-server**: Auto-reload during development
- **Concurrently**: Run frontend/backend simultaneously

## Development Gotchas

- **Windows paths**: Use `os.path.join()` for cross-platform model loading
- **Negative predictions**: Always clip sales forecasts to `>= 0`
- **Missing models**: Check model loading status in `/health` endpoint
- **Date formats**: Prophet expects 'YYYY-MM-DD', validate in API
- **Scaling order**: RFM values must be scaled **after** currency conversion

## Quick Start for New Features
1. **API endpoints**: Add to `api.py` with proper error handling
2. **Frontend updates**: Modify `dashboard.html` JavaScript sections
3. **Model updates**: Replace files in `ai_models/` and restart backend
4. **Testing**: Use `/health` and `/models/info` endpoints for debugging