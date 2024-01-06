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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const file = ref(null);
const mrr = ref(null);
const churnRate = ref(null);

const handleFileChange = (event) => {
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
    mrr.value = response.data.MRR;
    churnRate.value = response.data.ChurnRate;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
</script>





<style scoped>
/* Add any additional styles here */
</style>
