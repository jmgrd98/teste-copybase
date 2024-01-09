import * as XLSX from 'xlsx';
import express, { Request, Response } from 'express';
import cors from 'cors';
const fileUpload = require('express-fileupload');
import moment from 'moment';

interface MonthlyData {
    mrr: number;
    totalCustomers: number;
    churnedCustomers: number;
}

interface SpreadsheetRow {
    'data início': string;
    valor: number;
    periodicidade: string;
    'data cancelamento'?: string;
}

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(fileUpload());

app.post('/upload', (req: any, res: any) => {
    if (!req.files || !req.files.spreadsheet) {
        return res.status(400).send('No file uploaded.');
    }

    const workbook = XLSX.read(req.files.spreadsheet.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const jsonData: SpreadsheetRow[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let monthlyData: Record<string, MonthlyData> = {};

    jsonData.forEach(row => {
        const startDate = moment(row['data início'], 'DD/MM/YYYY');
        const endDate = row['data cancelamento'] ? moment(row['data cancelamento'], 'DD/MM/YYYY') : moment();

        if (!startDate.isValid() || (row['data cancelamento'] && !endDate.isValid())) {
            console.error('Invalid date format in spreadsheet row:', row);
            return;
        }
        let monthlyValue = row.valor;
        if (row.periodicidade === 'Anual') {
            monthlyValue /= 12;
        }

        for (let m = moment(startDate); m.isBefore(endDate, 'month'); m.add(1, 'month')) {
            const monthKey = m.format('MM-YYYY');
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { mrr: 0, totalCustomers: 0, churnedCustomers: 0 };
            }
            monthlyData[monthKey].mrr += monthlyValue;
            monthlyData[monthKey].totalCustomers += 1;
        }

        if (row['data cancelamento']) {
            const churnMonth = endDate.format('MM-YYYY');
            if (!monthlyData[churnMonth]) {
                monthlyData[churnMonth] = { mrr: 0, totalCustomers: 0, churnedCustomers: 0 };
            }
            monthlyData[churnMonth].churnedCustomers += 1;
        }
    });

    let monthlyMRR = [];
    let monthlyChurnRate = [];

    for (let [month, data] of Object.entries(monthlyData)) {
        monthlyMRR.push({ month, value: data.mrr.toFixed(2) });
        let churnRate = data.totalCustomers > 0 ? (data.churnedCustomers / data.totalCustomers) * 100 : 0;
        monthlyChurnRate.push({ month, value: churnRate.toFixed(2) });
    }

    res.send({ monthlyMRR, monthlyChurnRate });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
