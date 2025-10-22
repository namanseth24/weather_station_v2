<template>
  <div class="dashboard-container">
    <header class="header">
      <h2>IoT Sensor Dashboard</h2>
      <button @click="logout" class="logout-btn">Logout</button>
    </header>

    <section class="project-description">
      <h2>Project Description</h2>
      <p>
        This IoT project monitors environmental conditions using advanced sensors. It tracks
        temperature, humidity, and air quality in real-time, providing valuable insights for
        maintaining optimal living conditions.
      </p>
    </section>

    <section class="sensor-section">
      <h1>ThingSpeak Graph</h1>
      <div class="chart-wrapper">
        <div v-for="sensor in sensors" :key="sensor.id" class="chart-box">
          <canvas :id="sensor.id"></canvas>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'

const sensors = [
  { id: 'pressureChart', pin: 'v0', label: 'Pressure (Pa)', color: 'rgba(54, 162, 235, 1)' },
  { id: 'temperatureChart', pin: 'v1', label: 'Temperature (°C)', color: 'rgba(255, 99, 132, 1)' },
  { id: 'humidityChart', pin: 'v2', label: 'Humidity (%)', color: 'rgba(75, 192, 192, 1)' },
  { id: 'uvChart', pin: 'v3', label: 'UV Index', color: 'rgba(255, 206, 86, 1)' },
  { id: 'aqiChart', pin: 'v4', label: 'Air Quality Index (AQI)', color: 'rgba(153, 102, 255, 1)' },
  {
    id: 'altitudeChart',
    pin: 'dummy_altitude',
    label: 'Altitude (m)',
    color: 'rgba(255, 159, 64, 1)',
    dummy: true,
  },
  {
    id: 'hallChart',
    pin: 'dummy_hall',
    label: 'Hall Sensor Value',
    color: 'rgba(0, 204, 153, 1)',
    dummy: true,
  },
]

const charts = {}
const intervals = []

function createChart(sensor) {
  const ctx = document.getElementById(sensor.id)
  if (!ctx) {
    console.error(`Canvas element not found: ${sensor.id}`)
    return
  }

  const config = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: sensor.label,
          data: [],
          borderColor: sensor.color,
          backgroundColor: sensor.color.replace('1)', '0.2)'),
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Time' },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: sensor.label },
        },
      },
    },
  }

  charts[sensor.pin] = new Chart(ctx, config)
}

async function fetchSensorData(sensor) {
  const now = new Date().toLocaleTimeString()
  let value

  try {
    // Using dummy data for all sensors (same as HTML code)
    value = (Math.random() * 100 + (sensor.pin === 'dummy_altitude' ? 200 : 0)).toFixed(2)

    const chart = charts[sensor.pin]
    if (!chart) return

    chart.data.labels.push(now)
    chart.data.datasets[0].data.push(parseFloat(value))

    // Keep only last 10 data points
    if (chart.data.labels.length > 7) {
      chart.data.labels.shift()
      chart.data.datasets[0].data.shift()
    }

    chart.update()
  } catch (err) {
    console.error(`Error fetching ${sensor.label}`, err)
  }
}

function logout() {
  localStorage.removeItem('email')
  localStorage.removeItem('password')
  window.location.href = '/'
}

onMounted(() => {
  console.log('Dashboard mounted, creating charts...')

  // Create charts and start fetching data
  sensors.forEach((sensor) => {
    createChart(sensor)
    fetchSensorData(sensor) // Initial fetch
    const interval = setInterval(() => fetchSensorData(sensor), 2100) // Update every 2.1 seconds
    intervals.push(interval)
  })
})

onBeforeUnmount(() => {
  console.log('Dashboard unmounting, cleaning up...')

  // Clear all intervals
  intervals.forEach((interval) => clearInterval(interval))

  // Destroy all charts to prevent memory leaks
  Object.values(charts).forEach((chart) => {
    if (chart) chart.destroy()
  })
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
}

.header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap; /* allows wrapping when space is tight */
  align-items: center;
  margin-bottom: 30px;
}

.header h2 {
  margin: 0;
}

.logout-btn {
  background-color: #05623b;
  border: none;
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
  width: auto;
  flex-shrink: 0; /* prevent button from shrinking */
}

.logout-btn:hover {
  background-color: #e00000;
}

.project-description {
  background: rgb(255, 255, 255);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  margin-bottom: 30px;
}

.project-description h2 {
  margin-top: 0;
  margin-bottom: 15px;
}

.project-description p {
  margin: 0;
  line-height: 1.6;
}

.sensor-section {
  margin-top: 30px;
}

.sensor-section h1 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 2em;
}

.chart-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 3 columns for large screens */
  gap: 20px;
  padding: 30px 10px;
  max-width: 1400px;
  margin: 0 auto;
}

.chart-box {
  background: rgb(255, 255, 255);
  padding: 15px;
  border-radius: 12px;
  width: 100%;
  height: 280px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.333);
  box-sizing: border-box;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

/* --- Responsive Fixes --- */

/* Medium screens (2 columns) */
@media (min-width: 768px) {
  .chart-wrapper {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }

  .chart-box {
    height: 280px;
  }
}

/* Small tablets */
@media (max-width: 767px) and (min-width: 600px) {
  .chart-wrapper {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    padding: 20px 5px;
  }

  .chart-box {
    height: 240px;
  }

  .dashboard-container {
    padding: 20px;
  }
}

/* Mobile screens (1 column) */
@media (max-width: 599px) {
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

  /* ✅ Fix header stacking and alignment on mobile */
  .header {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .header h2 {
    text-align: center;
    font-size: 1.4em;
  }

  .logout-btn {
    width: 100%;
    max-width: 250px;
    align-self: center;
    margin: 0 auto;
  }

  .sensor-section h1 {
    font-size: 1.5em;
  }

  .project-description {
    padding: 15px;
  }
}

/* Extra small mobile */
@media (max-width: 400px) {
  .chart-box {
    height: 220px;
  }

  .sensor-section h1 {
    font-size: 1.3em;
  }
}
</style>