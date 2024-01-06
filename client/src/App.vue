<template>
  <div>
    <input type="file" @change="onFileChange" />
    <table v-if="jsonData">
      <tr v-for="(row, index) in jsonData" :key="index">
        <td v-for="(val, key) in row" :key="key">
          <input v-model="row[key]" />
        </td>
      </tr>
    </table>
    <button @click="saveFile" v-if="jsonData">Save Changes</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as XLSX from 'xlsx';

const jsonData = ref(null);

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;
  const file = target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target?.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    jsonData.value = XLSX.utils.sheet_to_json(worksheet);
  };
  reader.readAsArrayBuffer(file);
}

function saveFile() {
  const worksheet = XLSX.utils.json_to_sheet(jsonData.value);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, 'updated_file.xlsx');
}
</script>

<style scoped>

</style>
