# 🌦️ Weather ML Forecasting Dashboard

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

##  Overview
The **Weather ML Forecasting Dashboard** is an advanced machine learning-powered weather prediction system for **Neemrana, Rajasthan (27.83°N, 76.23°E)**. Built with Vue.js and Python Flask, it uses Random Forest models trained on 10 years of NASA POWER data (2015-2024) to provide accurate hourly weather forecasts.

This project demonstrates the integration of machine learning models with modern web technologies to create a real-time weather forecasting system with interactive visualizations and historical comparison analysis.

##  Key Features
-  **User Authentication** — Secure login, signup, and password recovery
-  **ML-Powered Predictions** — Random Forest models for 5 weather parameters
-  **Real-time Dashboard** — Live predictions updated every 60 seconds
-  **Interactive Charts** — Dynamic visualizations using Chart.js
-  **24-Hour Forecasts** — Hourly predictions for any selected date
-  **Historical Analysis** — Compare predictions vs actual data (7/14/30 days)
-  **Dark Mode** — Toggle between light and dark themes
-  **PWA Support** — Installable as a Progressive Web App

##  Predicted Parameters
| Parameter | Unit | ML Model Accuracy (R²) |
|-----------|------|------------------------|
| 🌡️ Temperature | °C | 0.89 |
| 💧 Humidity | % | 0.82 |
| ☁️ Pressure | hPa | 0.94 |
| 💨 Wind Speed | m/s | 0.76 |
| ☀️ UV Index | - | 0.85 |

## 🖥️ Tech Stack

### Frontend
| Component | Technology |
|-----------|------------|
| **Framework** | Vue.js 3 (Composition API) |
| **Build Tool** | Vite |
| **Routing** | Vue Router |
| **Charts** | Chart.js |
| **Styling** | Tailwind CSS + Custom CSS |
| **State Management** | Pinia (optional) |

### Backend
| Component | Technology |
|-----------|------------|
| **Framework** | Flask 3.0 |
| **ML Library** | scikit-learn |
| **Data Processing** | pandas, numpy |
| **Model Storage** | joblib |
| **CORS** | flask-cors |

### Deployment
| Service | Purpose |
|---------|---------|
| **Frontend Hosting** | Vercel |
| **Backend API** | Vercel Serverless |
| **Version Control** | GitHub |
| **CI/CD** | Vercel Auto-deploy |

## 🧩 Project Structure
```bash
weather-ml-dashboard/
├── frontend/                           # Vue.js Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginPage.vue          # Authentication - Login
│   │   │   ├── SignupPage.vue         # Authentication - Signup
│   │   │   ├── ForgotPage.vue         # Password Recovery
│   │   │   ├── DashboardPage.vue      # Main ML Dashboard
│   │   │   ├── PWAInstallPrompt.vue   # PWA Installation
│   │   │   └── ChartCard.vue          # Reusable Chart Component
│   │   ├── services/
│   │   │   └── mlService.js           # ML API Service Layer
│   │   ├── router/
│   │   │   └── index.js               # Vue Router Configuration
│   │   ├── assets/
│   │   │   └── main.css               # Global Styles
│   │   ├── App.vue                    # Root Component
│   │   └── main.js                    # App Entry Point
│   ├── public/
│   │   ├── favicon.ico
│   │   └── manifest.json              # PWA Manifest
│   ├── package.json
│   ├── vite.config.js
│   └── .env.production                # Production Environment
│
├── backend/                            # Flask Backend API
│   ├── app.py                         # Main Flask Application
│   ├── requirements.txt               # Python Dependencies
│   ├── vercel.json                    # Vercel Configuration
│   ├── .env                           # Local Environment Variables
│   └── models_neemrana/               # Trained ML Models
│       ├── rf_temperature_neemrana.joblib
│       ├── rf_humidity_neemrana.joblib
│       ├── rf_pressure_neemrana.joblib
│       ├── rf_wind_speed_neemrana.joblib
│       └── rf_uv_index_neemrana.joblib
│
├── .gitignore
├── README.md
├── deploy.sh                          # Linux/Mac Deployment Script
└── deploy.bat                         # Windows Deployment Script
```

## ️ Screenshots

###  Login Page
![Login Page](https://github.com/user-attachments/assets/af2e5968-8ebe-48f8-823a-45b192e1a5ca)

###  ML Dashboard - Current View
![Dashboard Current](https://github.com/user-attachments/assets/fed61d82-71b9-4feb-8eaf-43860f6fc28c)

###  24-Hour Forecast View
*Shows hourly predictions with expected vs ML forecast comparison*

###  Historical Comparison View
*Compare model predictions against actual data over 7, 14, or 30 days*

## ⚙ Setup Instructions

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.10 or higher) - [Download](https://www.python.org/)
- **Git** - [Download](https://git-scm.com/)
- **npm** (comes with Node.js)

###  Quick Start

####  Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: **http://localhost:5173/**

####  Backend Setup

**For Linux/Mac:**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

**For Windows:**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

The backend API will be available at: **http://localhost:5000/**

####  Verify Installation

**Test Backend API:**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "models_loaded": 5,
  "available_metrics": ["temperature", "humidity", "pressure", "wind_speed", "uv_index"]
}
```

**Test Frontend:**
- Open browser to `http://localhost:5173/`
- Login with any credentials (stored in localStorage)
- Navigate to Dashboard
- Verify charts and predictions are loading

---
### Features
- **Real-time Updates:** Dashboard refreshes every 60 seconds
- **Metric Selection:** Click on any metric card to focus
- **Dark Mode:** Toggle theme using moon/sun icon
- **Refresh Data:** Force immediate update with refresh button
- **Profile Menu:** Access account settings and logout

##  Machine Learning Models

### Training Details
- **Algorithm:** Random Forest Regressor
- **Data Source:** NASA POWER API (10 years, 2015-2024)
- **Location:** Neemrana, Rajasthan (27.83°N, 76.23°E)
- **Features:** Year, Month, Day, Day of Week, Cyclical Encodings, Lag Features, Location
- **Training Split:** 2015-2023 (training), 2024 (testing)
- **Estimators:** 200 trees per model

### Model Performance
| Metric | MAE | RMSE | R² Score |
|--------|-----|------|----------|
| Temperature | 2.34°C | 3.12°C | 0.89 |
| Humidity | 5.67% | 7.23% | 0.82 |
| Pressure | 1.45 hPa | 2.01 hPa | 0.94 |
| Wind Speed | 0.87 m/s | 1.23 m/s | 0.76 |
| UV Index | 0.65 | 0.92 | 0.85 |

## 🔧 Configuration

### Environment Variables

**Frontend** (`frontend/.env.production`):
```env
VITE_API_URL=https://your-backend.vercel.app/api
```

**Backend** (`backend/.env`):
```env
FLASK_ENV=development
MODEL_DIR=models_neemrana
LAT=27.83
LON=76.23
```

### API Endpoints

#### Generate Predictions
```bash
POST /api/predict
Content-Type: application/json

{
  "date": "2024-01-15"
}
```

#### Predict Specific Metric
```bash
POST /api/predict/temperature
Content-Type: application/json

{
  "date": "2024-01-15"
}
```

#### Date Range Predictions
```bash
POST /api/predict/range
Content-Type: application/json

{
  "start_date": "2024-01-01",
  "end_date": "2024-01-30"
}
```

##  Deployment

### Manual Deployment

#### Deploy Backend to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to backend: `cd backend`
3. Deploy: `vercel --prod`
4. Note your backend URL

#### Deploy Frontend to Vercel
1. Update `frontend/.env.production` with backend URL
2. Commit changes to Git
3. Push to GitHub
4. Import repository in Vercel Dashboard
5. Configure:
   - Root Directory: `frontend`
   - Framework: Vite
   - Environment Variable: `VITE_API_URL`
6. Deploy

### Post-Deployment
- Update CORS settings in `backend/app.py`
- Test all API endpoints
- Verify frontend-backend connectivity
- Check browser console for errors


##  Documentation

- [Vue.js Documentation](https://vuejs.org/guide/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [scikit-learn Documentation](https://scikit-learn.org/stable/)
- [NASA POWER API](https://power.larc.nasa.gov/docs/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA POWER** for providing free weather data API
- **scikit-learn** team for excellent ML library
- **Vue.js** community for amazing framework
- **Chart.js** for beautiful data visualizations
- **Vercel** for free hosting and deployment

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

Made with ❤️ and ☕

[Report Bug](https://github.com/namanseth24/weather-ml-dashboard/issues) · [Request Feature](https://github.com/namanseth24/weather-ml-dashboard/issues) · [Documentation](https://github.com/namanseth24/weather-ml-dashboard/wiki)

</div>