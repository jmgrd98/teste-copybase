
import Toast from './components/Toast.vue';
<template>
  <div class="flex flex-col items-center text-center w-screen h-screen">
    <header class="bg-[#41167F] h-20 w-full p-5">
    <img src="./assets/copybase.svg" alt="Copybase logo" />
  </header>
    <div class="flex flex-col items-center m-auto">
      <input type="file" class="cursor-pointer w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
          @change="handleFileChange" />
      <button @click="uploadFile"
              class="bg-[#41167F] mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Enviar
      </button>
    </div>
  

  <div class="flex flex-wrap gap-5 justify-center items-center w-full p-10">

    <div class="max-w-[600px]">
    <BarChart
      v-if="mrrData.length"
      :chartData="mrrChartData"
      :chartOptions="{ responsive: true }"
      chartLabel="Monthly Recurring Revenue (MRR)"
    />
    </div>

    <div class="max-w-[600px]">
    <BarChart
      v-if="churnRateData.length"
      :chartData="churnRateChartData"
      :chartOptions="{ responsive: true }"
      chartLabel="Churn Rate"
    />
  </div>

  <div class="max-w-[600px]">
    <BarChart
      v-if="arpuData"
      :chartData="arpuChartData"
      :chartOptions="{ responsive: true }"
      chartLabel="Average Revenue Per User (ARPU)"
    />
    </div>

    <div class="max-w-[600px]">
    <BarChart
      v-if="ltvData"
      :chartData="ltvChartData"
      :chartOptions="{ responsive: true }"
      chartLabel="Lifetime Value (LTV)"
    />
    </div>

    <Toast v-if="showToast"/>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import BarChart from './components/BarChart.vue'
import Toast from './components/Toast.vue';

const file = ref(null);
const mrrData = ref([]);
const churnRateData = ref([]);
const arpuData = ref(0);
const ltvData = ref(0);
const showToast = ref(false);


const mrrChartData = computed(() => ({
  labels: mrrData.value.map((item: any) => item.month),
  datasets: [{
    label: 'MRR',
    data: mrrData.value.map((item: any) => item.value)
  }]
}));

const churnRateChartData = computed(() => ({
  labels: churnRateData.value.map((item: any) => item.month),
  datasets: [{
    label: 'Churn Rate',
    data: churnRateData.value.map((item: any) => parseFloat(item.value))
  }]
}));

const arpuChartData = computed(() => ({
    labels: ['ARPU'],
    datasets: [{
        label: 'Average Revenue Per User',
        data: [arpuData.value]
    }]
}));

const ltvChartData = computed(() => ({
    labels: ['LTV'],
    datasets: [{
        label: 'Lifetime Value',
        data: [ltvData.value]
    }]
}));

const handleFileChange = (event: any) => {
  file.value = event.target.files[0];
};

const uploadFile = async () => {
  if (!file.value) {
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000)
    return;
  }

  const formData = new FormData();
  formData.append('spreadsheet', file.value);

  try {
      // const response = await axios.post('http://localhost:8000/myapp/upload/', formData, {
       const response = await axios.post('http://localhost:3000/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    mrrData.value = response.data.monthlyMRR;
    churnRateData.value = response.data.monthlyChurnRate;
    arpuData.value = response.data.arpu;
    ltvData.value = response.data.ltv;

  } catch (error) {
    console.error("Error uploading file:", error);
  }
};


</script>

<style scoped>

</style>
