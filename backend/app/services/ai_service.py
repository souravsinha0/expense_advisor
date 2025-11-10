import httpx
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from sqlalchemy.orm import Session
from app.models.expense import Expense, TransactionType
from app.core.config import settings
from datetime import datetime
from app.models.user import get_user_details
import os

import os
from pathlib import Path

# At the top of your file (or in config)
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)  # Create if not exists

async def get_ai_response(message: str, user_id: int, db: Session) -> str:
    # Get user's expense data for context
    expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
    user = get_user_details(user_id)
    print(f" user currency: {user.currency}")
    # Prepare context
    context = f"User has {len(expenses)} transactions. "
    if expenses:
        total_credit = sum(e.amount for e in expenses if e.transaction_type == TransactionType.CREDIT)
        total_debit = sum(e.amount for e in expenses if e.transaction_type == TransactionType.DEBIT)
        context += f"Total income: {total_credit} {user.currency}, Total expenses: {total_debit} {user.currency}, Net: {total_credit - total_debit} {user.currency}. "

        # Serialize each transaction into plain text so the LLM sees the full data (not Python object pointers)
        transactions_lines = []
        for e in expenses:
            date_str = e.transaction_date.isoformat() if hasattr(e.transaction_date, "isoformat") else str(e.transaction_date)
            ttype = e.transaction_type.value if hasattr(e.transaction_type, "value") else str(e.transaction_type)
            details = e.details or ""
            transactions_lines.append(
            f"Date: {date_str} | Type: {ttype} | Amount: {e.amount} {user.currency} | Details: {details}"
            )
        transactions_text = " ; ".join(transactions_lines)
        context += f"All transactions: {transactions_text}. "
        # context += f"Total income: {total_credit} {user.currency}, Total expenses: {total_debit} {user.currency}, Net: {total_credit - total_debit} {user.currency}. "
        print(f"...provided context : ", context)

    prompt = f"""
    You are a personal finance advisor for this specific user. IMPORTANT RULES:
    1. Only use the provided financial data: {context}
    2. Do NOT search the internet or use external information
    3. Do NOT make assumptions about data not provided
    4. Focus only on the user's actual transaction history
    5. If asked about data you don't have, say "I don't have that information in your records"
    
    User question: {message}
    
    Provide helpful advice based ONLY on their actual financial data. Be concise and actionable.
    """
    
    try:
        async with httpx.AsyncClient(timeout=240.0) as client:
            print(f"Using OLLAMA_BASE_URL: {settings.OLLAMA_BASE_URL}")
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    #"model": "llama2",
                    "model": "hf.co/nkamiy/gemma3-4b-it-gguf:Q5_K_M",
                    "prompt": prompt,
                    "stream": False
                }
            )
            
            if response.status_code == 200:
                return response.json().get("response", "I'm sorry, I couldn't process your request.")
            else:
                return "I'm currently unavailable. Please try again later."
    except Exception as e:
        print(f"Ollama API error: {type(e).__name__}: {e}")
        print(f"Response status: {getattr(response, 'status_code', 'N/A')}")
        print(f"Response text: {getattr(response, 'text', 'N/A')[:200]}")
        print(f"Using OLLAMA_BASE_URL: {settings.OLLAMA_BASE_URL}")
        return "I'm currently unavailable. Please try again later."


async def generate_chart(message: str, user_id: int, db: Session) -> str:
    expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
    
    if not expenses:
        print("No expenses found for chart")
        return None
    
    # Create DataFrame
    data = []
    for expense in expenses:
        data.append({
            'date': expense.transaction_date,
            'amount': expense.amount,
            'type': expense.transaction_type.value,
            'details': expense.details
        })
    
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])  # Critical: Ensure datetime

    if df.empty:
        return None

    # Setup static dir
    BASE_DIR = Path(__file__).resolve().parent.parent
    STATIC_DIR = BASE_DIR / "static"
    STATIC_DIR.mkdir(exist_ok=True)

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
            # Time series
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

        # Save
        filename = f"chart_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        filepath = STATIC_DIR / filename

        plt.tight_layout()
        plt.savefig(filepath, dpi=100, bbox_inches='tight')
        plt.close()

        print(f"Chart saved: {filepath}")
        return f"{settings.SERVER_BASE_URL}/serve-files/{filename}"
        # return filepath.as_posix()

    except Exception as e:
        print(f"Chart generation failed: {e}")
        import traceback
        traceback.print_exc()
        plt.close()
        return None