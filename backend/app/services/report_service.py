import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
import os
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException


BASE_DIR = Path(__file__).resolve().parent.parent
REPORT_DIR = BASE_DIR / "static" / "reports"
REPORT_DIR.mkdir(parents=True, exist_ok=True)


def generate_pdf_report(expenses, user):
    filename = f"report_{user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = REPORT_DIR / filename

    print(f"Generating PDF: {filepath}")

    try:
        doc = SimpleDocTemplate(str(filepath), pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title = Paragraph(f"Expense Report - {user.full_name or user.email}", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))

        # Summary
        total_credit = sum(e.amount for e in expenses if e.transaction_type.value == 'credit')
        total_debit = sum(e.amount for e in expenses if e.transaction_type.value == 'debit')
        net = total_credit - total_debit

        summary_data = [
            ['Total Income', f"{user.currency} {total_credit:.2f}"],
            ['Total Expenses', f"{user.currency} {total_debit:.2f}"],
            ['Net Amount', f"{user.currency} {net:.2f}"]
        ]

        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 11),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 12))

        # Transactions
        if expenses:
            data = [['Date', 'Details', 'Type', 'Amount']]
            for e in expenses:
                data.append([
                    e.transaction_date.strftime('%Y-%m-%d'),
                    e.details or '-',
                    e.transaction_type.value.title(),
                    f"{user.currency} {e.amount:.2f}"
                ])

            table = Table(data, colWidths=[1.5*inch, 2.5*inch, 1*inch, 1.5*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('ALIGN', (1, 1), (1, -1), 'LEFT'),
            ]))
            story.append(table)

        # Build PDF
        doc.build(story)
        print(f"PDF generated: {filepath}")

        if not filepath.exists():
            raise FileNotFoundError(f"PDF was not created: {filepath}")

        return str(filepath)

    except Exception as e:
        print(f"PDF generation failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


def generate_excel_report(expenses, user):
    filename = f"report_{user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    filepath = REPORT_DIR / filename

    print(f"Generating Excel: {filepath}")
    
    # Ensure /tmp directory exists
    # os.makedirs("/tmp", exist_ok=True)
    
    data = []
    for expense in expenses:
        data.append({
            'Date': expense.transaction_date.strftime('%Y-%m-%d'),
            'Details': expense.details,
            'Type': expense.transaction_type.value.title(),
            'Amount': expense.amount,
            'Currency': user.currency
        })
    
    df = pd.DataFrame(data)
    
    with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Transactions', index=False)
        
        # Summary sheet
        total_credit = sum(e.amount for e in expenses if e.transaction_type.value == 'credit')
        total_debit = sum(e.amount for e in expenses if e.transaction_type.value == 'debit')
        
        summary_df = pd.DataFrame({
            'Metric': ['Total Income', 'Total Expenses', 'Net Amount'],
            'Amount': [total_credit, total_debit, total_credit - total_debit],
            'Currency': [user.currency] * 3
        })
        
        summary_df.to_excel(writer, sheet_name='Summary', index=False)
    
    return filepath