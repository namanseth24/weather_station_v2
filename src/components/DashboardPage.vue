<template>
  <div class="dashboard-container">
    <header class="header">
      <h2>IoT Sensor Dashboard</h2>

      <!-- Avatar dropdown -->
      <div class="profile-menu">
        <div class="avatar" @click="toggleDropdown">
          <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Profile Avatar" />
        </div>
        <div v-if="showDropdown" class="dropdown">
          <button @click="logout">Logout</button>
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

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
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
      scales: {
        x: { title: { display: true, text: "Time" } },
        y: { beginAtZero: true, title: { display: true, text: sensor.label } }
      }
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
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.header h2 {
  margin: 0;
}

/* ✅ Profile Avatar Dropdown */
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
  animation: fadeIn 0.2s ease;
}

.dropdown button {
  display: block;
  width: 100%;
  padding: 10px 15px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font-size: 1em;
  color: #333;
  transition: 0.3s;
}

.dropdown button:hover {
  background: #f3f3f3;
  color: #e00000;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
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
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Mobile Fixes */

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
  .profile-menu {
    top: auto;
    right: 50%;
    left: 50%;
  }

  .dropdown {
    top: auto;
    right: auto;
    left: auto;
    transform: translateX(-50%);
  }

  .sensor-section h1 {
    font-size: 1.5em;
  }

  .project-description {
    padding: 15px;
  }
}
</style>