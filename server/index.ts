const XLSX = require('xlsx');
const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');

app.use(cors({
    origin: '*'
}));

app.use(express.json());
app.use(fileUpload());

app.post('/upload', (req: any, res: any) => {
  if (!req.files || !req.files.spreadsheet) {
    return res.status(400).send('No file uploaded.');
  }

  const workbook = XLSX.read(req.files.spreadsheet.data, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  let mrr = 0;
  let totalCustomers = 0;
  let churnedCustomers = 0;

  jsonData.forEach((row: any) => {
    if (row.status === 'Ativa') {
      totalCustomers += 1;
      let monthlyValue = row.valor;
      if (row.periodicidade === 'Anual') {
        monthlyValue /= 12;
      }
      mrr += monthlyValue;
    }
    if (row['data cancelamento']) {
      churnedCustomers += 1;
    }
  });

  let churnRate = (churnedCustomers / totalCustomers) * 100;

  res.send({
    MRR: mrr.toFixed(2),
    ChurnRate: `${churnRate.toFixed(2)}%`
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
