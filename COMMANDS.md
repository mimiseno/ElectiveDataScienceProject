# 🚀 Quick Commands Reference

## Running the Application

### Run Both (Frontend + Backend)
```bash
npm run both
```
This starts:
- Backend API at http://localhost:5000
- Frontend at http://localhost:3000

---

### Run Separately

#### Backend Only:
```bash
npm run backend
# Or:
python backend/api.py
```
API runs at: http://localhost:5000

#### Frontend Only:
```bash
npm run dev
```
Dashboard opens at: http://localhost:3000

---

## First Time Setup

```bash
# 1. Install Python dependencies
cd backend
pip install -r requirements.txt
cd ..

# 2. Install Node dependencies
npm install
```

---

## Available npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server (port 3000) |
| `npm start` | Same as `npm run dev` |
| `npm run backend` | Start Python Flask API (port 5000) |
| `npm run both` | Run frontend + backend simultaneously |

---

## API Endpoints

- **Health Check**: GET http://localhost:5000/health
- **Customer Segmentation**: POST http://localhost:5000/predict/segment
- **Sales Forecast**: POST http://localhost:5000/predict/forecast
- **Model Info**: GET http://localhost:5000/models/info

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (Backend)
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Kill process on port 3000 (Frontend)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Module Not Found
```bash
# Reinstall Python dependencies
cd backend
pip install -r requirements.txt

# Reinstall Node dependencies
npm install
```

---

**Team**: Sereno, Page, Dulce, Laudato  
**Teacher**: Sir Charlston Sean Gono
