<template>
  <div class="container mx-auto p-4">
    <div class="flex flex-col items-center">
      <input type="file" class="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
          @change="handleFileChange" />
      <button @click="uploadFile"
              class="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Upload
      </button>
    </div>
    <div v-if="mrr || churnRate" class="mt-4">
      <div v-if="mrr" class="text-green-500">Monthly Recurring Revenue (MRR): {{ mrr }}</div>
      <div v-if="churnRate" class="text-blue-500">Churn Rate: {{ churnRate }}</div>
    </div>
  </div>

  <div>
    <svg id="mrrChart"></svg>
    <svg id="churnRateChart"></svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';
import axios from 'axios';

const file = ref(null);
const mrrData = ref([]);
const churnRateData = ref([]);

const handleFileChange = (event: any) => {
  file.value = event.target.files[0];
};

const uploadFile = async () => {
  if (!file.value) {
    alert("Please select a file first.");
    return;
  }

  const formData = new FormData();
  formData.append('spreadsheet', file.value);

  try {
    const response = await axios.post('http://localhost:3000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    mrrData.value = response.data.monthlyMRR;
    churnRateData.value = response.data.monthlyChurnRate;
    console.log('MRR Data:', response.data.monthlyMRR); // Debugging
    console.log('Churn Rate Data:', response.data.monthlyChurnRate);
    createLineChart('#mrrChart', mrrData.value, 'MRR');
    createLineChart('#churnRateChart', churnRateData.value, 'Churn Rate');
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

const createLineChart = (selector: string, data: any[], label: string) => {
  console.log('Creating chart for:', label, data);
  const margin = { top: 20, right: 30, bottom: 30, left: 40 },
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

  // Clear existing content
  d3.select(selector).selectAll("*").remove();

  // Create SVG container
  const svg = d3.select(selector)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create scales
  const x = d3.scaleBand()
    .domain(data.map(d => d.month))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d.value)])
    .nice()
    .range([height, 0]);

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add line path
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(d => x(d.month) + x.bandwidth() / 2)
      .y(d => y(+d.value))
    );

  // Add labels
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + 20)
    .text(label);
};

onMounted(() => {
  // Optionally, initialize charts with pre-loaded data
});
</script>







<style scoped>
/* Add any additional styles here */
</style>
