<template>
  <div class="dashboard-container" :class="{ 'dark-mode': isDarkMode }">
    <header class="header">
      <h2>IoT Sensor Dashboard</h2>

      <div class="header-right">
        <!-- Dark Mode Toggle -->
        <button class="theme-toggle" @click="toggleTheme" :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
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
              <strong>{{ userEmail || "User" }}</strong>
            </p>
            <hr />
            <button @click="logout">Logout</button>
          </div>
        </div>
      </div>
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import Chart from "chart.js/auto";

const showDropdown = ref(false);
const userEmail = ref(localStorage.getItem("email") || "");
const isDarkMode = ref(localStorage.getItem("darkMode") === "true" || false);

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem("darkMode", isDarkMode.value.toString());
  
  // Update chart colors when theme changes
  updateChartThemes();
}

function logout() {
  localStorage.removeItem("email");
  localStorage.removeItem("password");
  window.location.href = "/";
}

const sensors = [
  { id: "pressureChart", pin: "v0", label: "Pressure (Pa)", color: "rgba(54, 162, 235, 1)" },
  { id: "temperatureChart", pin: "v1", label: "Temperature (°C)", color: "rgba(255, 99, 132, 1)" },
  { id: "humidityChart", pin: "v2", label: "Humidity (%)", color: "rgba(75, 192, 192, 1)" },
  { id: "uvChart", pin: "v3", label: "UV Index", color: "rgba(255, 206, 86, 1)" },
  { id: "aqiChart", pin: "v4", label: "Air Quality Index (AQI)", color: "rgba(153, 102, 255, 1)" },
  { id: "altitudeChart", pin: "dummy_altitude", label: "Altitude (m)", color: "rgba(255, 159, 64, 1)", dummy: true },
  { id: "hallChart", pin: "dummy_hall", label: "Hall Sensor Value", color: "rgba(0, 204, 153, 1)", dummy: true }
];

const charts = {};
const intervals = [];

function createChart(sensor) {
  const ctx = document.getElementById(sensor.id);
  if (!ctx) return;

  const textColor = isDarkMode.value ? '#e0e0e0' : '#666';
  const gridColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  charts[sensor.pin] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: sensor.label,
        data: [],
        borderColor: sensor.color,
        backgroundColor: sensor.color.replace("1)", "0.2)"),
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: { 
          title: { 
            display: true, 
            text: "Time",
            color: textColor
          },
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: { 
          beginAtZero: true, 
          title: { 
            display: true, 
            text: sensor.label,
            color: textColor
          },
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    }
  });
}

function updateChartThemes() {
  const textColor = isDarkMode.value ? '#e0e0e0' : '#666';
  const gridColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  Object.values(charts).forEach(chart => {
    if (chart) {
      // Update legend color
      chart.options.plugins.legend.labels.color = textColor;
      
      // Update x-axis
      chart.options.scales.x.title.color = textColor;
      chart.options.scales.x.ticks.color = textColor;
      chart.options.scales.x.grid.color = gridColor;
      
      // Update y-axis
      chart.options.scales.y.title.color = textColor;
      chart.options.scales.y.ticks.color = textColor;
      chart.options.scales.y.grid.color = gridColor;
      
      chart.update();
    }
  });
}

async function fetchSensorData(sensor) {
  const now = new Date().toLocaleTimeString();
  const chart = charts[sensor.pin];
  if (!chart) return;

  const value = (Math.random() * 100 + (sensor.pin === 'dummy_altitude' ? 200 : 0)).toFixed(2);

  chart.data.labels.push(now);
  chart.data.datasets[0].data.push(parseFloat(value));

  if (chart.data.labels.length > 7) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();
}

onMounted(() => {
  sensors.forEach((sensor) => {
    createChart(sensor);
    fetchSensorData(sensor);
    const interval = setInterval(() => fetchSensorData(sensor), 2100);
    intervals.push(interval);
  });
});

onBeforeUnmount(() => {
  intervals.forEach(interval => clearInterval(interval));
  Object.values(charts).forEach(chart => chart?.destroy());
});
</script>

<style scoped>
/* Base Light Mode Styles */
.dashboard-container {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.689);
  color: rgb(0, 0, 0);
  min-height: 100vh;
  padding: 30px;
  overflow-x: hidden;
  transition: background 0.3s ease, color 0.3s ease;
}

/* Dark Mode Styles */
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

/* Header Right Container */
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Theme Toggle Button */
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

/* Profile Avatar Dropdown */
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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

/* Project Description */
.project-description {
  background: rgb(255, 255, 255);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  margin-bottom: 30px;
  transition: background 0.3s ease, box-shadow 0.3s ease;
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

/* Sensor Section */
.sensor-section {
  margin-top: 30px;
}

.sensor-section h1 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 2em;
  transition: color 0.3s ease;
}

.dark-mode .sensor-section h1 {
  color: #ffffff;
}

/* Chart Wrapper */
.chart-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.dark-mode .chart-box {
  background: rgba(40, 40, 55, 0.8);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.6);
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Responsive Design */
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

  .header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 15px;
    margin-bottom: 20px;
  }

  .header-right {
    width: 100%;
    justify-content: center;
  }

  .header h2 {
    text-align: center;
    font-size: 1.4em;
    width: 100%;
  }

  .dropdown {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
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

  .theme-toggle {
    width: 40px;
    height: 40px;
    font-size: 1.3em;
  }
}
</style>