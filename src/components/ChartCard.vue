<template>
  <div class="chart-box">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default {
  name: "ChartCard",
  props: ["label", "data", "color"],
  mounted() {
    new Chart(this.$refs.canvas, {
      type: "line",
      data: {
        labels: this.data.map((_, i) => i),
        datasets: [
          {
            label: this.label,
            data: this.data,
            borderColor: this.color,
            fill: false
          }
        ]
      }
    });
  }
};
</script>

<style scoped>
.chart-box {
  width: 400px;
  height: 250px;
}
</style>
