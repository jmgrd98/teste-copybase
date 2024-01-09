<template>
  <div class="flex flex-col items-center text-center justify-center p-10">
    <div class="flex flex-col items-center">
      <input type="file" class="cursor-pointer block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
          @change="handleFileChange" />
      <button @click="uploadFile"
              class="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Enviar
      </button>
    </div>
  

  <div class="mt-10 mr-[400px] flex gap-5 items-center max-w-[400px]">

    <BarChart
      v-if="mrrData.length"
      :chartData="mrrChartData"
      :chartOptions="{ responsive: true }"
      chartLabel="Monthly Recurring Revenue (MRR)"
    />

    <BarChart
      v-if="churnRateData.length"
      :chartData="churnRateChartData"
      :chartOptions="{ responsive: true }"
      chartLabel="Churn Rate"
    />

  </div>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import BarChart from './components/BarChart.vue'

const file = ref(null);
const mrrData = ref([]);
const churnRateData = ref([]);

const mrrChartData = computed(() => ({
  labels: mrrData.value.map(item => item.month),
  datasets: [{
    label: 'MRR',
    data: mrrData.value.map(item => item.value)
  }]
}));

const churnRateChartData = computed(() => ({
  labels: churnRateData.value.map(item => item.month),
  datasets: [{
    label: 'Churn Rate',
    data: churnRateData.value.map(item => parseFloat(item.value))
  }]
}));


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
    console.log('MRR Data:', response.data.monthlyMRR);
    console.log('Churn Rate Data:', response.data.monthlyChurnRate);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

onMounted(() => {
  // Optionally, initialize charts with pre-loaded data
});
</script>

<style scoped>

</style>
