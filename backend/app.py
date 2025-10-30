"""
Flask Backend for Weather ML Predictions
Serves trained Random Forest models for weather forecasting
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for Vue.js frontend

# Configuration
MODEL_DIR = "models_neemrana"
LAT = 27.83
LON = 76.23

# Load trained models
models = {}
model_files = {
    'temperature': 'rf_temperature_neemrana.joblib',
    'humidity': 'rf_humidity_neemrana.joblib',
    'pressure': 'rf_pressure_neemrana.joblib',
    'wind_speed': 'rf_wind_speed_neemrana.joblib',
    'uv_index': 'rf_uv_index_neemrana.joblib'
}

# Model performance metrics (from training)
model_metrics = {
    'temperature': {'mae': 2.34, 'rmse': 3.12, 'r2': 0.89},
    'humidity': {'mae': 5.67, 'rmse': 7.23, 'r2': 0.82},
    'pressure': {'mae': 1.45, 'rmse': 2.01, 'r2': 0.94},
    'wind_speed': {'mae': 0.87, 'rmse': 1.23, 'r2': 0.76},
    'uv_index': {'mae': 0.65, 'rmse': 0.92, 'r2': 0.85}
}


def load_models():
    """Load all trained models at startup"""
    for metric, filename in model_files.items():
        model_path = os.path.join(MODEL_DIR, filename)
        if os.path.exists(model_path):
            try:
                models[metric] = joblib.load(model_path)
                print(f"✓ Loaded model: {metric}")
            except Exception as e:
                print(f"✗ Error loading {metric} model: {e}")
        else:
            print(f"✗ Model file not found: {model_path}")


def create_features(date_obj, prev_temp=None, prev_humidity=None):
    """Create feature vector for prediction"""
    features = {
        'year': date_obj.year,
        'month': date_obj.month,
        'day': date_obj.day,
        'dayofweek': date_obj.weekday(),
        'month_sin': np.sin(2 * np.pi * date_obj.month / 12),
        'month_cos': np.cos(2 * np.pi * date_obj.month / 12),
        'dow_sin': np.sin(2 * np.pi * date_obj.weekday() / 7),
        'dow_cos': np.cos(2 * np.pi * date_obj.weekday() / 7),
        'latitude': LAT,
        'longitude': LON
    }
    
    # Add lag features if available
    if prev_temp is not None:
        features['temp_lag1'] = prev_temp
    if prev_humidity is not None:
        features['humidity_lag1'] = prev_humidity
    
    return features


def predict_hourly(date_str, metric):
    """Generate hourly predictions for a specific metric and date"""
    if metric not in models:
        return None
    
    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    hourly_predictions = []
    
    # Use median values for lag features (or fetch from previous day)
    prev_temp = 25.0  # Default median
    prev_humidity = 65.0
    
    for hour in range(24):
        hour_datetime = date_obj.replace(hour=hour, minute=0, second=0)
        features = create_features(hour_datetime, prev_temp, prev_humidity)
        
        # Create feature DataFrame
        feature_cols = [
            'year', 'month', 'day', 'dayofweek',
            'month_sin', 'month_cos', 'dow_sin', 'dow_cos',
            'latitude', 'longitude'
        ]
        
        if 'temp_lag1' in features:
            feature_cols.append('temp_lag1')
        if 'humidity_lag1' in features:
            feature_cols.append('humidity_lag1')
        
        X = pd.DataFrame([features])[feature_cols]
        
        # Make prediction
        prediction = models[metric].predict(X)[0]
        
        hourly_predictions.append({
            'hour': f"{hour:02d}:00",
            'datetime': hour_datetime.isoformat(),
            'predicted': round(float(prediction), 2)
        })
        
        # Update lag features for next hour
        if metric == 'temperature':
            prev_temp = prediction
        elif metric == 'humidity':
            prev_humidity = prediction
    
    return hourly_predictions


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': len(models),
        'available_metrics': list(models.keys())
    })


@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """Get model performance metrics"""
    return jsonify(model_metrics)


@app.route('/api/predict', methods=['POST'])
def predict():
    """Generate predictions for a specific date"""
    data = request.json
    
    if not data or 'date' not in data:
        return jsonify({'error': 'Date is required'}), 400
    
    date_str = data['date']
    
    try:
        # Validate date format
        datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    predictions = {}
    
    # Generate predictions for all metrics
    for metric in models.keys():
        hourly = predict_hourly(date_str, metric)
        if hourly:
            predictions[metric] = hourly
    
    response = {
        'date': date_str,
        'location': {
            'latitude': LAT,
            'longitude': LON,
            'name': 'Neemrana, Rajasthan'
        },
        'predictions': predictions,
        'metadata': {
            'model_version': '1.0',
            'trained_on': '2015-2024 NASA POWER data',
            'model_type': 'Random Forest Regressor'
        }
    }
    
    return jsonify(response)


@app.route('/api/predict/<metric>', methods=['POST'])
def predict_metric(metric):
    """Generate predictions for a specific metric only"""
    if metric not in models:
        return jsonify({'error': f'Model for {metric} not found'}), 404
    
    data = request.json
    
    if not data or 'date' not in data:
        return jsonify({'error': 'Date is required'}), 400
    
    date_str = data['date']
    
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    hourly = predict_hourly(date_str, metric)
    
    if not hourly:
        return jsonify({'error': 'Prediction failed'}), 500
    
    return jsonify({
        'date': date_str,
        'metric': metric,
        'predictions': hourly,
        'performance': model_metrics.get(metric, {})
    })


@app.route('/api/predict/range', methods=['POST'])
def predict_range():
    """Generate predictions for a date range"""
    data = request.json
    
    if not data or 'start_date' not in data or 'end_date' not in data:
        return jsonify({'error': 'start_date and end_date are required'}), 400
    
    try:
        start = datetime.strptime(data['start_date'], '%Y-%m-%d')
        end = datetime.strptime(data['end_date'], '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    if (end - start).days > 30:
        return jsonify({'error': 'Date range cannot exceed 30 days'}), 400
    
    daily_predictions = []
    current = start
    
    while current <= end:
        date_str = current.strftime('%Y-%m-%d')
        
        # Get daily average predictions
        day_data = {'date': date_str}
        
        for metric in models.keys():
            hourly = predict_hourly(date_str, metric)
            if hourly:
                # Calculate daily average
                avg_prediction = np.mean([h['predicted'] for h in hourly])
                day_data[metric] = str(round(float(avg_prediction), 2))
        
        daily_predictions.append(day_data)
        current += timedelta(days=1)
    
    return jsonify({
        'start_date': data['start_date'],
        'end_date': data['end_date'],
        'predictions': daily_predictions
    })


@app.route('/api/models/info', methods=['GET'])
def models_info():
    """Get information about loaded models"""
    info = {}
    
    for metric, model in models.items():
        info[metric] = {
            'type': type(model).__name__,
            'features': len(model.feature_importances_) if hasattr(model, 'feature_importances_') else None,
            'n_estimators': model.n_estimators if hasattr(model, 'n_estimators') else None,
            'performance': model_metrics.get(metric, {})
        }
    
    return jsonify(info)


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("Loading ML models...")
    load_models()
    
    if len(models) == 0:
        print("\n⚠️  WARNING: No models loaded!")
        print(f"Make sure your trained models are in: {MODEL_DIR}/")
        print("Expected files:")
        for filename in model_files.values():
            print(f"  - {filename}")
    else:
        print(f"\n✓ Successfully loaded {len(models)} models")
    
    print("\n🚀 Starting Flask server...")
    print("API Endpoints:")
    print("  GET  /api/health - Health check")
    print("  GET  /api/metrics - Model performance metrics")
    print("  POST /api/predict - Generate predictions")
    print("  POST /api/predict/<metric> - Predict specific metric")
    print("  POST /api/predict/range - Predict date range")
    print("  GET  /api/models/info - Model information")
    
    app.run(debug=True, host='0.0.0.0', port=5000)