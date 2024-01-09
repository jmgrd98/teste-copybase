from collections import defaultdict
from django.http import JsonResponse
import datetime
import openpyxl
from django.views.decorators.csrf import csrf_exempt


def calculate_mrr_and_churn(jsonData):
    monthly_data = defaultdict(lambda: {'mrr': 0, 'totalCustomers': 0, 'churnedCustomers': 0})
    
    for row in jsonData:
        print("Processing row:", row)  # Debugging statement

        start_date = row['data início']
        if start_date is None:
            print("Skipping row due to no start date")  # Debugging statement
            continue

        end_date = row['data cancelamento'] if row['data cancelamento'] else datetime.datetime.now()
        monthly_value = row['valor']
        if row['periodicidade'] == 'Anual':
            monthly_value /= 12

        month = start_date
        while month < end_date:
            month_key = month.strftime('%m-%Y')
            monthly_data[month_key]['mrr'] += monthly_value
            monthly_data[month_key]['totalCustomers'] += 1
            month = month + datetime.timedelta(days=30)  # Approximation to next month

        if row['data cancelamento']:
            churn_month_key = end_date.strftime('%m-%Y')
            monthly_data[churn_month_key]['churnedCustomers'] += 1

    monthly_mrr = [{'month': month, 'value': data['mrr']} for month, data in monthly_data.items()]
    monthly_churn_rate = [{'month': month, 'value': (data['churnedCustomers'] / data['totalCustomers']) * 100 if data['totalCustomers'] > 0 else 0} for month, data in monthly_data.items()]

    return monthly_mrr, monthly_churn_rate

def calculate_additional_metrics(jsonData):
    total_revenue = sum(row['valor'] for row in jsonData if row['valor'] is not None)
    number_of_customers = len(set(row['ID assinante'] for row in jsonData if row['ID assinante'] is not None))

    # Calculate ARPU (Average Revenue Per User)
    arpu = total_revenue / number_of_customers if number_of_customers > 0 else 0

    # Assuming each row represents a transaction or subscription renewal, calculate LTV
    # LTV here is simplified as the average revenue per customer
    ltv = total_revenue / number_of_customers if number_of_customers > 0 else 0

    return {'arpu': arpu, 'ltv': ltv}


@csrf_exempt
def upload_file(request):
    if request.method == 'POST':
        file = request.FILES.get('spreadsheet')
        if not file:
            return JsonResponse({'error': 'No file uploaded.'}, status=400)

        workbook = openpyxl.load_workbook(file)
        sheet = workbook.active
        jsonData = []

        for row in sheet.iter_rows(values_only=True, min_row=2):  # Assuming first row is headers
            jsonData.append({
                'data início': row[3],  # Directly using the datetime object from the Excel file
                'valor': row[7],
                'periodicidade': row[0],
                'data cancelamento': row[6],  # This can be None or a datetime object
            })

        additional_metrics = calculate_additional_metrics(jsonData)
        monthlyMRR, monthlyChurnRate = calculate_mrr_and_churn(jsonData)

        response_data = {
            'monthlyMRR': monthlyMRR,
            'monthlyChurnRate': monthlyChurnRate,
            'additionalMetrics': additional_metrics
        }

        return JsonResponse(response_data)
    
    return JsonResponse({'error': 'Invalid request'}, status=400)
