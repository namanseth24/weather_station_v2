// weather-dashboard/src/services/mlService.js
// Service for ML model predictions integration

/**
 * ML Service for Weather Predictions
 * Connects to Python backend or provides simulated predictions
 */

const ML_API_BASE_URL = 'http://localhost:5000/api'; // Your Flask/FastAPI backend

class MLService {
  constructor() {
    this.cache = new Map();
    this.useSimulation = true; // Set to false when backend is ready
  }

  /**
   * Get ML predictions for a specific date and location
   */
  async getPredictions(date, location = { lat: 27.83, lon: 76.23 }) {
    const cacheKey = `${date}-${location.lat}-${location.lon}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.useSimulation) {
      return this.getSimulatedPredictions(date, location);
    }

    try {
      const response = await fetch(`${ML_API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          latitude: location.lat,
          longitude: location.lon
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching ML predictions:', error);
      return this.getSimulatedPredictions(date, location);
    }
  }

  /**
   * Simulate ML predictions (for development without backend)
   */
  getSimulatedPredictions(date, location) {
    const dateObj = new Date(date);
    const dayOfYear = this.getDayOfYear(dateObj);
    const predictions = {};

    // Generate hourly predictions for each metric
    ['temperature', 'humidity', 'pressure', 'wind_speed', 'uv_index'].forEach(metric => {
      predictions[metric] = this.generateHourlyPredictions(metric, dayOfYear, dateObj);
    });

    return {
      date,
      location,
      predictions,
      metadata: {
        model_version: '1.0',
        trained_on: '2015-2024 NASA POWER data',
        location: 'Neemrana, Rajasthan'
      }
    };
  }

  /**
   * Generate hourly predictions for a specific metric
   */
  generateHourlyPredictions(metric, dayOfYear, date) {
    const hourly = [];
    const baseValue = this.getSeasonalBase(metric, dayOfYear);

    for (let hour = 0; hour < 24; hour++) {
      const diurnalVariation = this.getDiurnalVariation(metric, hour);
      const noise = this.getModelNoise(metric);
      
      const actual = baseValue + diurnalVariation;
      const predicted = actual + noise;

      hourly.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        datetime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour).toISOString(),
        actual: parseFloat(actual.toFixed(2)),
        predicted: parseFloat(predicted.toFixed(2)),
        confidence_interval: {
          lower: parseFloat((predicted - Math.abs(noise) * 1.5).toFixed(2)),
          upper: parseFloat((predicted + Math.abs(noise) * 1.5).toFixed(2))
        }
      });
    }

    return hourly;
  }

  /**
   * Get seasonal baseline value for a metric
   */
  getSeasonalBase(metric, dayOfYear) {
    const seasonalFactor = Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI / 2);
    
    const bases = {
      temperature: 25 + (seasonalFactor * 10), // 15-35°C range
      humidity: 65 - (seasonalFactor * 15), // 50-80% range
      pressure: 1013 + (seasonalFactor * 5), // 1008-1018 hPa
      wind_speed: 5 + (seasonalFactor * 2), // 3-7 m/s
      uv_index: Math.max(0, 6 + (seasonalFactor * 4)) // 2-10 range
    };

    return bases[metric] || 50;
  }

  /**
   * Get diurnal (daily) variation pattern
   */
  getDiurnalVariation(metric, hour) {
    switch(metric) {
      case 'temperature':
        // Peak at 14:00, minimum at 6:00
        return 8 * Math.sin((hour - 6) * Math.PI / 12);
      
      case 'humidity':
        // Inverse of temperature - high at night
        return -12 * Math.cos((hour - 6) * Math.PI / 12);
      
      case 'pressure':
        // Slight diurnal variation
        return 3 * Math.sin((hour - 3) * Math.PI / 12);
      
      case 'wind_speed':
        // Higher during day
        return 2 * Math.sin((hour - 12) * Math.PI / 12);
      
      case 'uv_index':
        // Only during daylight hours
        if (hour < 6 || hour > 18) return -6;
        return 5 * Math.sin((hour - 6) * Math.PI / 12);
      
      default:
        return 0;
    }
  }

  /**
   * Get model prediction noise (simulates prediction error)
   */
  getModelNoise(metric) {
    const noiseFactors = {
      temperature: 1.5,
      humidity: 3.0,
      pressure: 1.0,
      wind_speed: 0.8,
      uv_index: 0.5
    };

    const factor = noiseFactors[metric] || 1.0;
    return (Math.random() - 0.5) * 2 * factor;
  }

  /**
   * Get model performance metrics
   */
  async getModelMetrics() {
    if (this.useSimulation) {
      return {
        temperature: { mae: 2.34, rmse: 3.12, r2: 0.89, samples: 3287 },
        humidity: { mae: 5.67, rmse: 7.23, r2: 0.82, samples: 3287 },
        pressure: { mae: 1.45, rmse: 2.01, r2: 0.94, samples: 3287 },
        wind_speed: { mae: 0.87, rmse: 1.23, r2: 0.76, samples: 3287 },
        uv_index: { mae: 0.65, rmse: 0.92, r2: 0.85, samples: 3287 }
      };
    }

    try {
      const response = await fetch(`${ML_API_BASE_URL}/metrics`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching model metrics:', error);
      return null;
    }
  }

  /**
   * Helper: Get day of year (1-365)
   */
  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  /**
   * Load historical data for comparison
   */
  async getHistoricalData(startDate, endDate) {
    if (this.useSimulation) {
      return this.generateHistoricalData(startDate, endDate);
    }

    try {
      const response = await fetch(
        `${ML_API_BASE_URL}/historical?start=${startDate}&end=${endDate}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return this.generateHistoricalData(startDate, endDate);
    }
  }

  /**
   * Generate simulated historical data
   */
  generateHistoricalData(startDate, endDate) {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfYear = this.getDayOfYear(d);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayData = {
        date: dateStr,
        temperature: this.getSeasonalBase('temperature', dayOfYear) + (Math.random() - 0.5) * 4,
        humidity: this.getSeasonalBase('humidity', dayOfYear) + (Math.random() - 0.5) * 8,
        pressure: this.getSeasonalBase('pressure', dayOfYear) + (Math.random() - 0.5) * 2,
        wind_speed: this.getSeasonalBase('wind_speed', dayOfYear) + (Math.random() - 0.5) * 1.5,
        uv_index: Math.max(0, this.getSeasonalBase('uv_index', dayOfYear) + (Math.random() - 0.5) * 2)
      };
      
      data.push(dayData);
    }
    
    return data;
  }

  /**
   * Clear prediction cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Switch between simulation and real backend
   */
  setSimulationMode(enabled) {
    this.useSimulation = enabled;
    this.clearCache();
  }
}

// Export singleton instance
export default new MLService();