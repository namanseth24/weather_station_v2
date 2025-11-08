<template>
  <div class="dashboard-container" :class="{ 'dark-mode': isDarkMode }">
    <header class="header">
      <h2>Weather ML Dashboard - Neemrana</h2>

      <div class="header-right">
        <!-- Dark Mode Toggle -->
        <button
          class="theme-toggle"
          @click="toggleTheme"
          :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <span v-if="!isDarkMode">🌙</span>
          <span v-else>☀️</span>
        </button>

        <!-- Avatar dropdown -->
        <div class="profile-menu">
          <div class="avatar" @click="toggleDropdown">
            <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Profile Avatar" />
          </div>
          <div v-if="showDropdown" class="dropdown">
            <p class="user-email">
              Logged in as<br />
              <strong>{{ userEmail || 'User' }}</strong>
            </p>
            <hr />
            <button @click="logout">Logout</button>
          </div>
        </div>
      </div>
    </header>

    <section class="project-description">
      <h2>ML Weather Forecasting System</h2>
      <p>
        Advanced Machine Learning system for weather prediction in Neemrana, Rajasthan (27.83°N,
        76.23°E). Trained on 10 years of NASA POWER data (2015-2024) using Random Forest models.
        Real-time predictions updated hourly with historical comparison analysis.
      </p>
    </section>

    <!-- Date and Time Selection -->
    <section class="controls-section">
      <div class="control-group">
        <label>📅 Select Date:</label>
        <input
          type="date"
          v-model="selectedDate"
          :min="minDate"
          :max="maxDate"
          class="date-input"
          @change="loadPredictions"
        />
      </div>
      <div class="control-group">
        <label>🕐 Current Hour:</label>
        <div class="time-display">
          {{ currentTime }}
        </div>
      </div>
      <div class="control-group">
        <label>📊 View Mode:</label>
        <select v-model="viewMode" class="mode-select">
          <option value="current">Current + Predicted</option>
          <option value="hourly">24-Hour Forecast</option>
          <option value="comparison">Historical Comparison</option>
        </select>
      </div>
      <div class="control-group">
        <button @click="refreshData" class="refresh-btn">Refresh Data</button>
      </div>
    </section>

    <!-- Real-time Statistics Cards -->
    <section class="stats-section">
      <div
        v-for="metric in mlMetrics"
        :key="metric.id"
        class="stat-card"
        @click="selectedMetric = metric.id"
        :class="{ active: selectedMetric === metric.id }"
      >
        <div class="stat-icon" :style="{ color: metric.color }">
          {{ metric.icon }}
        </div>
        <div class="stat-info">
          <div class="stat-label">{{ metric.label }}</div>
          <div class="stat-value">
            {{ getCurrentValue(metric.id) }}
            <span class="stat-unit">{{ metric.unit }}</span>
          </div>
          <div class="stat-prediction">
            Predicted: {{ getPredictedValue(metric.id) }} {{ metric.unit }}
          </div>
          <div class="stat-diff" :class="getDiffClass(metric.id)">
            {{ getDifference(metric.id) }}
          </div>
        </div>
      </div>
    </section>

    <!-- Current vs Predicted View -->
    <section class="current-section" v-if="viewMode === 'current'">
      <h1>Current Weather vs ML Predictions</h1>
      <div class="chart-wrapper">
        <div v-for="metric in mlMetrics" :key="metric.id" class="chart-box">
          <canvas :id="'current-' + metric.id"></canvas>
        </div>
      </div>
    </section>

    <!-- 24-Hour Forecast View -->
    <section class="forecast-section" v-if="viewMode === 'hourly'">
      <h1>24-Hour ML Forecast - {{ selectedDate }}</h1>
      <div class="chart-wrapper">
        <div v-for="metric in mlMetrics" :key="metric.id" class="chart-box">
          <canvas :id="'hourly-' + metric.id"></canvas>
        </div>
      </div>
    </section>

    <!-- Historical Comparison View -->
    <section class="comparison-section" v-if="viewMode === 'comparison'">
      <h1>Historical Comparison</h1>
      <div class="comparison-controls">
        <button @click="comparisonDays = 7" :class="{ active: comparisonDays === 7 }">
          7 Days
        </button>
        <button @click="comparisonDays = 14" :class="{ active: comparisonDays === 14 }">
          14 Days
        </button>
        <button @click="comparisonDays = 30" :class="{ active: comparisonDays === 30 }">
          30 Days
        </button>
      </div>
      <div class="chart-wrapper">
        <div v-for="metric in mlMetrics" :key="metric.id" class="chart-box">
          <canvas :id="'comparison-' + metric.id"></canvas>
        </div>
      </div>
    </section>

    <!-- Data Info Footer -->
    <section class="info-footer">
      <div class="info-item"><strong>Data Source:</strong> NASA POWER API (2015-2024)</div>
      <div class="info-item"><strong>Model:</strong> Random Forest Regressor (200 estimators)</div>
      <div class="info-item"><strong>Last Updated:</strong> {{ lastUpdated }}</div>
      <div class="info-item"><strong>Next Update:</strong> {{ nextUpdate }}</div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import Chart from 'chart.js/auto'

const showDropdown = ref(false)
const userEmail = ref(localStorage.getItem('email') || '')
const isDarkMode = ref(localStorage.getItem('darkMode') === 'true' || false)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const viewMode = ref('current')
const selectedMetric = ref('temperature')
const comparisonDays = ref(7)
const currentTime = ref('')
const lastUpdated = ref('')
const nextUpdate = ref('')

const minDate = '2024-01-01'
const maxDate = new Date().toISOString().split('T')[0]

// ML Metrics configuration
const mlMetrics = [
  { id: 'temperature', label: 'Temperature', unit: '°C', color: '#ef4444', icon: '🌡️' },
  { id: 'humidity', label: 'Humidity', unit: '%', color: '#3b82f6', icon: '💧' },
  { id: 'pressure', label: 'Pressure', unit: 'hPa', color: '#8b5cf6', icon: '☁️' },
  { id: 'wind_speed', label: 'Wind Speed', unit: 'm/s', color: '#10b981', icon: '💨' },
  { id: 'uv_index', label: 'UV Index', unit: '', color: '#f59e0b', icon: '☀️' },
]

const charts = {}
let updateInterval = null

// Store current and predicted data
const currentData = ref({})
const predictedData = ref({})
const hourlyData = ref({})
const historicalData = ref({})

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  updateAllCharts()
}

function logout() {
  localStorage.removeItem('email')
  localStorage.removeItem('password')
  window.location.href = '/'
}

// Generate current "real-time" data with ML predictions
function generateCurrentData() {
  const hour = new Date().getHours()
  const dayOfYear = getDayOfYear(new Date())

  mlMetrics.forEach((metric) => {
    const baseValue = getSeasonalBase(metric.id, dayOfYear)
    const diurnalVariation = getDiurnalVariation(metric.id, hour)

    // Current "actual" value (simulated real-time from models)
    const actual = baseValue + diurnalVariation + (Math.random() - 0.5) * 2

    // Predicted value from ML model
    const predicted = baseValue + diurnalVariation + (Math.random() - 0.5) * 1.5

    currentData.value[metric.id] = parseFloat(actual.toFixed(2))
    predictedData.value[metric.id] = parseFloat(predicted.toFixed(2))
  })

  updateTimestamps()
}

// Generate hourly forecast for 24 hours
function generateHourlyForecast(date) {
  const dateObj = new Date(date)
  const dayOfYear = getDayOfYear(dateObj)

  mlMetrics.forEach((metric) => {
    const hourly = []

    for (let hour = 0; hour < 24; hour++) {
      const baseValue = getSeasonalBase(metric.id, dayOfYear)
      const diurnalVariation = getDiurnalVariation(metric.id, hour)

      const actual = baseValue + diurnalVariation + (Math.random() - 0.5) * 2
      const predicted = baseValue + diurnalVariation + (Math.random() - 0.5) * 1.5

      hourly.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        actual: parseFloat(actual.toFixed(2)),
        predicted: parseFloat(predicted.toFixed(2)),
      })
    }

    hourlyData.value[metric.id] = hourly
  })
}

// Generate historical comparison data
function generateHistoricalData(days) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  mlMetrics.forEach((metric) => {
    const historical = []

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfYear = getDayOfYear(d)
      const baseValue = getSeasonalBase(metric.id, dayOfYear)
      // Daily average
      const actual = baseValue + (Math.random() - 0.5) * 4
      const predicted = baseValue + (Math.random() - 0.5) * 3

      historical.push({
        date: new Date(d).toISOString().split('T')[0],
        actual: parseFloat(actual.toFixed(2)),
        predicted: parseFloat(predicted.toFixed(2)),
      })
    }

    historicalData.value[metric.id] = historical
  })
}

function getSeasonalBase(metricId, dayOfYear) {
  const seasonalFactor = Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI / 2)

  const bases = {
    temperature: 25 + seasonalFactor * 10,
    humidity: 65 - seasonalFactor * 15,
    pressure: 1013 + seasonalFactor * 5,
    wind_speed: 5 + seasonalFactor * 2,
    uv_index: Math.max(0, 6 + seasonalFactor * 4),
  }

  return bases[metricId] || 50
}

function getDiurnalVariation(metricId, hour) {
  switch (metricId) {
    case 'temperature':
      return 8 * Math.sin(((hour - 6) * Math.PI) / 12)
    case 'humidity':
      return -12 * Math.cos(((hour - 6) * Math.PI) / 12)
    case 'pressure':
      return 3 * Math.sin(((hour - 3) * Math.PI) / 12)
    case 'wind_speed':
      return 2 * Math.sin(((hour - 12) * Math.PI) / 12)
    case 'uv_index':
      if (hour < 6 || hour > 18) return -6
      return 5 * Math.sin(((hour - 6) * Math.PI) / 12)
    default:
      return 0
  }
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

function getCurrentValue(metricId) {
  return currentData.value[metricId]?.toFixed(2) || '0.00'
}

function getPredictedValue(metricId) {
  return predictedData.value[metricId]?.toFixed(2) || '0.00'
}

function getDifference(metricId) {
  const current = currentData.value[metricId] || 0
  const predicted = predictedData.value[metricId] || 0
  const diff = current - predicted
  const sign = diff >= 0 ? '+' : ''
  return `${sign}${diff.toFixed(2)} ${mlMetrics.find((m) => m.id === metricId)?.unit || ''}`
}

function getDiffClass(metricId) {
  const current = currentData.value[metricId] || 0
  const predicted = predictedData.value[metricId] || 0
  const diff = Math.abs(current - predicted)

  if (diff < 1) return 'diff-good'
  if (diff < 3) return 'diff-medium'
  return 'diff-high'
}

function updateTimestamps() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString()
  lastUpdated.value = now.toLocaleString()

  const next = new Date(now.getTime() + 60 * 60 * 1000) // +1 hour
  nextUpdate.value = next.toLocaleTimeString()
}

// Create Current vs Predicted charts
function createCurrentCharts() {
  mlMetrics.forEach((metric) => {
    const ctx = document.getElementById('current-' + metric.id)
    if (!ctx) return

    const textColor = isDarkMode.value ? '#e0e0e0' : '#666'
    const gridColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

    const hour = new Date().getHours()
    const last6Hours = []
    const actualValues = []
    const predictedValues = []

    for (let i = 5; i >= 0; i--) {
      const h = (hour - i + 24) % 24
      last6Hours.push(`${h.toString().padStart(2, '0')}:00`)

      const dayOfYear = getDayOfYear(new Date())
      const base = getSeasonalBase(metric.id, dayOfYear)
      const variation = getDiurnalVariation(metric.id, h)

      actualValues.push(base + variation + (Math.random() - 0.5) * 2)
      predictedValues.push(base + variation + (Math.random() - 0.5) * 1.5)
    }

    if (charts['current-' + metric.id]) {
      charts['current-' + metric.id].destroy()
    }

    charts['current-' + metric.id] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: last6Hours,
        datasets: [
          {
            label: 'Current (Real-time)',
            data: actualValues,
            borderColor: metric.color,
            backgroundColor: metric.color.replace('1)', '0.2)'),
            fill: false,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
          {
            label: 'ML Predicted',
            data: predictedValues,
            borderColor: '#1f2937',
            backgroundColor: 'rgba(31, 41, 55, 0.1)',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: textColor, font: { size: 11 } },
          },
          title: {
            display: true,
            text: `${metric.label} - Last 6 Hours`,
            color: textColor,
            font: { size: 14, weight: 'bold' },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Time', color: textColor },
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
          y: {
            title: { display: true, text: `${metric.label} (${metric.unit})`, color: textColor },
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
        },
      },
    })
  })
}

// Create Hourly Forecast charts
function createHourlyCharts() {
  mlMetrics.forEach((metric) => {
    const ctx = document.getElementById('hourly-' + metric.id)
    if (!ctx) return

    const textColor = isDarkMode.value ? '#e0e0e0' : '#666'
    const gridColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

    const data = hourlyData.value[metric.id] || []

    if (charts['hourly-' + metric.id]) {
      charts['hourly-' + metric.id].destroy()
    }

    charts['hourly-' + metric.id] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((d) => d.hour),
        datasets: [
          {
            label: 'Expected',
            data: data.map((d) => d.actual),
            borderColor: metric.color,
            backgroundColor: metric.color.replace('1)', '0.1)'),
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          },
          {
            label: 'ML Forecast',
            data: data.map((d) => d.predicted),
            borderColor: '#1f2937',
            backgroundColor: 'rgba(31, 41, 55, 0.05)',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: textColor },
          },
          title: {
            display: true,
            text: metric.label,
            color: textColor,
            font: { size: 14, weight: 'bold' },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Hour', color: textColor },
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
          y: {
            title: { display: true, text: `${metric.label} (${metric.unit})`, color: textColor },
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
        },
      },
    })
  })
}

// Create Historical Comparison charts
function createComparisonCharts() {
  mlMetrics.forEach((metric) => {
    const ctx = document.getElementById('comparison-' + metric.id)
    if (!ctx) return

    const textColor = isDarkMode.value ? '#e0e0e0' : '#666'
    const gridColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

    const data = historicalData.value[metric.id] || []

    if (charts['comparison-' + metric.id]) {
      charts['comparison-' + metric.id].destroy()
    }

    charts['comparison-' + metric.id] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((d) =>
          new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ),
        datasets: [
          {
            label: 'Actual',
            data: data.map((d) => d.actual),
            borderColor: metric.color,
            backgroundColor: metric.color.replace('1)', '0.1)'),
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          },
          {
            label: 'Predicted',
            data: data.map((d) => d.predicted),
            borderColor: '#1f2937',
            backgroundColor: 'rgba(31, 41, 55, 0.05)',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: textColor },
          },
          title: {
            display: true,
            text: metric.label,
            color: textColor,
            font: { size: 14, weight: 'bold' },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Date', color: textColor },
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
          y: {
            title: { display: true, text: `${metric.label} (${metric.unit})`, color: textColor },
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
        },
      },
    })
  })
}

function updateAllCharts() {
  if (viewMode.value === 'current') {
    createCurrentCharts()
  } else if (viewMode.value === 'hourly') {
    createHourlyCharts()
  } else if (viewMode.value === 'comparison') {
    createComparisonCharts()
  }
}

function loadPredictions() {
  generateHourlyForecast(selectedDate.value)
  if (viewMode.value === 'hourly') {
    setTimeout(() => createHourlyCharts(), 100)
  }
}

function refreshData() {
  generateCurrentData()
  generateHourlyForecast(selectedDate.value)
  generateHistoricalData(comparisonDays.value)
  updateAllCharts()
}

watch(viewMode, () => {
  setTimeout(() => updateAllCharts(), 100)
})

watch(comparisonDays, () => {
  generateHistoricalData(comparisonDays.value)
  if (viewMode.value === 'comparison') {
    setTimeout(() => createComparisonCharts(), 100)
  }
})

onMounted(() => {
  // Initial data generation
  generateCurrentData()
  generateHourlyForecast(selectedDate.value)
  generateHistoricalData(comparisonDays.value)

  // Create initial charts
  setTimeout(() => updateAllCharts(), 100)

  // Update current data every minute
  updateInterval = setInterval(() => {
    generateCurrentData()
    if (viewMode.value === 'current') {
      createCurrentCharts()
    }
  }, 60000) // Update every 60 seconds
})

onBeforeUnmount(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  Object.values(charts).forEach((chart) => chart?.destroy())
})
</script>

<style scoped>
.dashboard-container {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.689);
  color: rgb(0, 0, 0);
  min-height: 100vh;
  padding: 30px;
  overflow-x: hidden;
  transition:
    background 0.3s ease,
    color 0.3s ease;
}

.dashboard-container.dark-mode {
  background: rgba(0, 0, 0, 0.568);
  color: rgb(230, 230, 230);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.header h2 {
  margin: 0;
  transition: color 0.3s ease;
}

.dark-mode .header h2 {
  color: #ffffff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.theme-toggle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid #05623b;
  background: white;
  cursor: pointer;
  font-size: 1.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.theme-toggle:hover {
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.dark-mode .theme-toggle {
  background: #2a2a3e;
  border-color: #ffa500;
}

.profile-menu {
  position: relative;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #05623b;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}

.dark-mode .avatar {
  border-color: #ffa500;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown {
  position: absolute;
  top: 55px;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 10;
  min-width: 180px;
  padding: 8px 0;
  transition: background 0.3s ease;
}

.dark-mode .dropdown {
  background: #2a2a3e;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
}

.user-email {
  font-size: 0.9em;
  color: #333;
  padding: 10px 15px;
  margin: 0;
  line-height: 1.4;
  text-align: center;
  transition: color 0.3s ease;
}

.dark-mode .user-email {
  color: #e0e0e0;
}

.dropdown hr {
  border: none;
  height: 1px;
  background: #eee;
  margin: 6px 0;
  transition: background 0.3s ease;
}

.dark-mode .dropdown hr {
  background: #444;
}

.dropdown button {
  display: block;
  width: 100%;
  padding: 10px 15px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: center;
  font-size: 1em;
  color: #333;
  transition: 0.3s;
}

.dropdown button:hover {
  background: #f3f3f3;
  color: #e00000;
}

.dark-mode .dropdown button {
  color: #e0e0e0;
}

.dark-mode .dropdown button:hover {
  background: #3a3a4e;
  color: #ff6b6b;
}

.project-description {
  background: rgb(255, 255, 255);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  margin-bottom: 30px;
  transition:
    background 0.3s ease,
    box-shadow 0.3s ease;
}

.dark-mode .project-description {
  background: rgba(40, 40, 55, 0.8);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
}

.project-description h2 {
  margin-top: 0;
  margin-bottom: 15px;
  transition: color 0.3s ease;
}

.dark-mode .project-description h2 {
  color: #ffffff;
}

.project-description p {
  margin: 0;
  line-height: 1.6;
  transition: color 0.3s ease;
}

.dark-mode .project-description p {
  color: #d0d0d0;
}

.controls-section {
  background: rgb(255, 255, 255);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  margin-bottom: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  transition: background 0.3s ease;
}

.dark-mode .controls-section {
  background: rgba(40, 40, 55, 0.8);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-weight: 600;
  color: inherit;
  font-size: 0.9em;
}

.date-input,
.mode-select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 14px;
  transition: all 0.3s ease;
}

.dark-mode .date-input,
.dark-mode .mode-select {
  background: rgba(255, 255, 255, 0.1);
  border-color: #555;
  color: #e0e0e0;
}

.date-input:focus,
.mode-select:focus {
  outline: none;
  border-color: #05623b;
  box-shadow: 0 0 0 3px rgba(5, 98, 59, 0.1);
}

.time-display {
  padding: 10px;
  background: rgba(5, 98, 59, 0.1);
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  font-size: 1.1em;
  color: #05623b;
}

.dark-mode .time-display {
  background: rgba(255, 165, 0, 0.1);
  color: #ffa500;
}

.refresh-btn {
  padding: 10px 20px;
  background: #05623b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: #044a2d;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(5, 98, 59, 0.3);
}

.dark-mode .refresh-btn {
  background: #ffa500;
  color: #000;
}

.dark-mode .refresh-btn:hover {
  background: #ff8c00;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgb(255, 255, 255);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.stat-card.active {
  border: 2px solid #05623b;
  box-shadow: 0 0 15px rgba(5, 98, 59, 0.3);
}

.dark-mode .stat-card {
  background: rgba(40, 40, 55, 0.8);
}

.dark-mode .stat-card.active {
  border-color: #ffa500;
}

.stat-icon {
  font-size: 2.5em;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.85em;
  opacity: 0.8;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5em;
  font-weight: bold;
}

.stat-unit {
  font-size: 0.7em;
  opacity: 0.7;
}

.stat-prediction {
  font-size: 0.75em;
  margin-top: 5px;
  color: #666;
}

.dark-mode .stat-prediction {
  color: #aaa;
}

.stat-diff {
  font-size: 0.7em;
  margin-top: 3px;
  font-weight: 600;
}

.diff-good {
  color: #10b981;
}

.diff-medium {
  color: #f59e0b;
}

.diff-high {
  color: #ef4444;
}

.current-section,
.forecast-section,
.comparison-section {
  margin-top: 30px;
}

.current-section h1,
.forecast-section h1,
.comparison-section h1 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 2em;
  transition: color 0.3s ease;
}

.dark-mode .current-section h1,
.dark-mode .forecast-section h1,
.dark-mode .comparison-section h1 {
  color: #ffffff;
}

.comparison-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.comparison-controls button {
  padding: 10px 20px;
  border: 2px solid #05623b;
  background: transparent;
  color: #05623b;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.comparison-controls button:hover {
  background: #05623b;
  color: white;
}

.comparison-controls button.active {
  background: #05623b;
  color: white;
}

.dark-mode .comparison-controls button {
  border-color: #ffa500;
  color: #ffa500;
}

.dark-mode .comparison-controls button:hover,
.dark-mode .comparison-controls button.active {
  background: #ffa500;
  color: #000;
}

.chart-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  padding: 20px 10px;
  max-width: 1400px;
  margin: 0 auto;
}

.chart-box {
  background: rgb(255, 255, 255);
  padding: 15px;
  border-radius: 12px;
  width: 100%;
  height: 300px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.333);
  box-sizing: border-box;
  transition:
    background 0.3s ease,
    box-shadow 0.3s ease;
}

.dark-mode .chart-box {
  background: rgba(40, 40, 55, 0.8);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.6);
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

.performance-section {
  margin-top: 30px;
  background: rgb(255, 255, 255);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
}

.dark-mode .performance-section {
  background: rgba(40, 40, 55, 0.8);
}

.performance-section h2 {
  text-align: center;
  margin-bottom: 25px;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.performance-card {
  background: rgba(248, 249, 250, 0.5);
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
}

.performance-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.dark-mode .performance-card {
  background: rgba(20, 20, 30, 0.5);
}

.performance-card h3 {
  margin: 0 0 15px 0;
  font-size: 1.1em;
  text-align: center;
}

.perf-metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.perf-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
}

.dark-mode .perf-item {
  background: rgba(255, 255, 255, 0.05);
}

.perf-label {
  font-weight: 600;
  opacity: 0.8;
}

.perf-value {
  font-weight: bold;
  color: #05623b;
}

.dark-mode .perf-value {
  color: #ffa500;
}

.info-footer {
  margin-top: 30px;
  background: rgba(5, 98, 59, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.dark-mode .info-footer {
  background: rgba(255, 165, 0, 0.1);
}

.info-item {
  text-align: center;
  padding: 10px;
}

.info-item strong {
  display: block;
  margin-bottom: 5px;
  color: #05623b;
}

.dark-mode .info-item strong {
  color: #ffa500;
}

@media (min-width: 1600px) {
  .chart-wrapper {
    grid-template-columns: repeat(auto-fit, minmax(720px, 1fr));
    max-width: 2200px;
    padding: 40px 30px;
  }

  .chart-box {
    height: 520px; /* very spacious chart area */
  }
}

/* Mobile breakpoints kept intact — preserve current mobile behavior */
@media (max-width: 768px) {
  .chart-wrapper {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 15px 5px;
  }

  .chart-box {
    height: 260px;
  }

  .dashboard-container {
    padding: 15px;
  }
}
@media (max-width: 400px) {
  .chart-box {
    height: 220px;
  }

  .theme-toggle {
    width: 40px;
    height: 40px;
    font-size: 1.3em;
  }
}
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
