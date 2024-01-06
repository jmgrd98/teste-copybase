const XLSX = require('xlsx');
const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const moment = require('moment');

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(fileUpload());

interface MonthlyData {
    mrr: number;
    totalCustomers: number;
    churnedCustomers: number;
}


app.post('/upload', (req: any, res: any) => {
    if (!req.files || !req.files.spreadsheet) {
        return res.status(400).send('No file uploaded.');
    }

    const workbook = XLSX.read(req.files.spreadsheet.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let monthlyData: Record<string, MonthlyData> = {};

    jsonData.forEach((row: any) => {
        const startDate = moment(row['data início']);
        const monthYear = startDate.format('MM-YYYY');

        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { mrr: 0, totalCustomers: 0, churnedCustomers: 0 };
        }

        let monthlyValue = row.valor;
        if (row.periodicidade === 'Anual') {
            monthlyValue /= 12;
        }

        if (row.status === 'Ativa') {
            monthlyData[monthYear].mrr += monthlyValue;
            monthlyData[monthYear].totalCustomers += 1;
        }

        if (row['data cancelamento']) {
            monthlyData[monthYear].churnedCustomers += 1;
        }
    });

    let monthlyMRR: any = [];
    let monthlyChurnRate: any = [];

    for (let [month, data] of Object.entries(monthlyData)) {
        monthlyMRR.push({ month, value: data.mrr.toFixed(2) });
    
        let churnRate = (data.churnedCustomers / data.totalCustomers) * 100 || 0;
        monthlyChurnRate.push({ month, value: churnRate.toFixed(2) });
    }

    res.send({ monthlyMRR, monthlyChurnRate });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
