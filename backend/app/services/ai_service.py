import matplotlib.pyplot as plt
import pandas as pd
from sqlalchemy.orm import Session
from app.models.expense import Expense, TransactionType
from app.core.config import settings
from datetime import datetime
from app.models.user import get_user_details
from pathlib import Path
from app.services.llm_providers import get_llm_provider

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)

def create_prompt_for_provider(message: str, user_id: int, db: Session) -> str:
    expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
    user = get_user_details(user_id)
    currency = user.currency or "INR"

    total_credit = sum(e.amount for e in expenses if e.transaction_type == TransactionType.CREDIT)
    total_debit = sum(e.amount for e in expenses if e.transaction_type == TransactionType.DEBIT)
    net = total_credit - total_debit

    if settings.LLM_PROVIDER == "ollama":
        # Full context for local Ollama
        toon_lines = []
        for e in expenses:
            date_str = e.transaction_date.strftime("%Y-%m-%d")
            ttype = "C" if e.transaction_type == TransactionType.CREDIT else "D"
            amount = f"{e.amount:.2f}"
            details = (e.details or "No details").strip().replace("|", "/")
            toon_lines.append(f"{date_str}|{ttype}|{amount}|{details}")

        full_context = "\n".join(toon_lines)
        summary = f"Income: {total_credit:.2f} {currency} | Expenses: {total_debit:.2f} {currency} | Net: {net:.2f} {currency}"
        
        # Truncate if too large
        if len(full_context) > 30000:
            context_to_use = "\n".join(toon_lines[-600:])
            note = "\n(Showing recent 600 transactions)"
        else:
            context_to_use = full_context
            note = ""

        return f"""You are a financial advisor. Use ONLY the data below.

=== USER FINANCIAL DATA ===
{summary}

Transactions (date|C/D|amount|details):
{context_to_use}{note}

Legend: C=Income, D=Expense, amounts in {currency}

RULES:
- Use exact data only
- Never invent transactions
- Be accurate and concise

Question: {message}

Answer:"""

    else:
        # Compact summary for online APIs
        recent_expenses = expenses[-20:] if len(expenses) > 20 else expenses
        
        summary_text = f"""Financial Summary:
- Total Income: {total_credit:.2f} {currency}
- Total Expenses: {total_debit:.2f} {currency}
- Net Balance: {net:.2f} {currency}
- Total Transactions: {len(expenses)}

Recent Transactions:"""
        
        for e in recent_expenses:
            ttype = "Income" if e.transaction_type == TransactionType.CREDIT else "Expense"
            summary_text += f"\n- {e.transaction_date.strftime('%Y-%m-%d')}: {ttype} {e.amount:.2f} {currency} ({e.details or 'No details'})"

        return f"""You are a personal finance advisor. Based on this user's financial data, answer their question concisely.

{summary_text}

User Question: {message}

Provide helpful financial advice based on the data above:"""

async def get_ai_response(message: str, user_id: int, db: Session) -> str:
    prompt = create_prompt_for_provider(message, user_id, db)
    provider = get_llm_provider()
    
    try:
        response = await provider.generate_response(prompt)
        
        # Safety check for hallucination
        bad_phrases = ["approximately", "around", "about", "roughly", "seems", "probably"]
        if any(phrase in response.lower() for phrase in bad_phrases):
            return "I can only provide exact figures from your records."
        
        return response or "No matching data found in your records."
    
    except Exception as e:
        print(f"AI service error: {e}")
        return "Sorry, I'm having connection issues. Please try again."

async def generate_chart(message: str, user_id: int, db: Session) -> str:
    expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
    
    if not expenses:
        return None
    
    data = []
    for expense in expenses:
        data.append({
            'date': expense.transaction_date,
            'amount': expense.amount,
            'type': expense.transaction_type.value,
            'details': expense.details
        })
    
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])

    if df.empty:
        return None

    plt.figure(figsize=(10, 6))
    
    try:
        if 'monthly' in message.lower():
            df['month'] = df['date'].dt.to_period('M').astype(str)
            monthly_data = df.groupby(['month', 'type'])['amount'].sum().unstack(fill_value=0)
            if monthly_data.empty:
                plt.text(0.5, 0.5, 'No data', ha='center', va='center')
                plt.title('Monthly Summary')
            else:
                monthly_data.plot(kind='bar', stacked=True, ax=plt.gca())
                plt.title('Monthly Income vs Expenses')
                plt.ylabel('Amount')
                plt.xticks(rotation=45)

        elif 'pie' in message.lower():
            expense_data = df[df['type'] == 'debit']
            if expense_data.empty:
                plt.text(0.5, 0.5, 'No expenses', ha='center', va='center')
                plt.title('Expense Distribution')
            else:
                plt.pie(expense_data['amount'], labels=expense_data['details'], autopct='%1.1f%%')
                plt.title('Expense Distribution')

        else:
            credit_data = df[df['type'] == 'credit'].groupby('date')['amount'].sum()
            debit_data = df[df['type'] == 'debit'].groupby('date')['amount'].sum()

            all_dates = sorted(set(credit_data.index) | set(debit_data.index))
            if not all_dates:
                plt.text(0.5, 0.5, 'No data', ha='center', va='center')
            else:
                credit_vals = [credit_data.get(d, 0) for d in all_dates]
                debit_vals = [debit_data.get(d, 0) for d in all_dates]
                plt.plot(all_dates, credit_vals, label='Income', marker='o')
                plt.plot(all_dates, debit_vals, label='Expenses', marker='s')
                plt.legend()

            plt.title('Income vs Expenses Over Time')
            plt.xlabel('Date')
            plt.ylabel('Amount')
            plt.xticks(rotation=45)

        filename = f"chart_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        filepath = STATIC_DIR / filename

        plt.tight_layout()
        plt.savefig(filepath, dpi=100, bbox_inches='tight')
        plt.close()

        chart_url = f"{settings.SERVER_BASE_URL}/serve-files/{filename}"
        return chart_url

    except Exception as e:
        print(f"Chart generation failed: {e}")
        plt.close()
        return None