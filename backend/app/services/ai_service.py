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
from pathlib import Path

# At the top of your file (or in config)
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)  # Create if not exists

# TOON Format: date|type|amount|details
# type: C = Credit, D = Debit
def expense_to_toon(expense, currency: str) -> str:
    date_str = expense.transaction_date.strftime("%Y-%m-%d")
    ttype = "C" if expense.transaction_type == TransactionType.CREDIT else "D"
    amount = f"{expense.amount:.2f}"
    details = (expense.details or "").strip().replace("|", "-")  # avoid delimiter conflict
    return f"{date_str}|{ttype}|{amount}|{details}"


async def get_ai_response(message: str, user_id: int, db: Session) -> str:
    expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
    user = get_user_details(user_id)
    currency = user.currency or "INR"

    total_credit = total_debit = 0.0
    toon_lines = []

    for e in expenses:
        date_str = e.transaction_date.strftime("%Y-%m-%d")
        ttype = "C" if e.transaction_type == TransactionType.CREDIT else "D"
        amount = f"{e.amount:.2f}"
        details = (e.details or "No details").strip()
        details = details.replace("|", "/").replace("\n", " ")

        toon_line = f"{date_str}|{ttype}|{amount}|{details}"
        toon_lines.append(toon_line)

        if e.transaction_type == TransactionType.CREDIT:
            total_credit += e.amount
        else:
            total_debit += e.amount

    net = total_credit - total_debit
    summary = f"Income: {total_credit:.2f} {currency} | Expenses: {total_debit:.2f} {currency} | Net: {net:.2f} {currency} | Total Transactions: {len(toon_lines)}"

    full_context = "\n".join(toon_lines)
    estimated_tokens = len(full_context) // 4 + len(summary) // 4 + 300  # + prompt overhead

    # === YOUR ORIGINAL LOGIC: Only truncate if too large ===
    if estimated_tokens > 7500:
        print(f"Context too large ({estimated_tokens} tokens), using recent 600 transactions...")
        context_to_use = "\n".join(toon_lines[-600:])
        note = "\n(Note: Showing only the most recent 600 transactions due to high volume)"
    else:
        context_to_use = full_context
        note = ""

    # === BULLETPROOF PROMPT — ZERO HALLUCINATION ===
    prompt = f"""You are a strict financial data analyst. You MUST answer using ONLY the exact data below.

=== USER FINANCIAL DATA (TOON Format) ===
{summary}

Transactions (format: date|C/D|amount|details):
{context_to_use}{note}

Legend:
- C = Income (Credit)
- D = Expense (Debit)
- All amounts in {currency}

STRICT RULES (NEVER BREAK):
1. Quote transactions EXACTLY as shown — never change amounts or dates
2. Never invent or estimate any transaction
3. Never swap amounts between entries
4. For calculations: show exact math using real values
5. Never use words like "approximately", "around", "seems"

Example correct answer:
"On 2025-03-15 you spent exactly 450.00 INR on Groceries"

User question: {message}

Think step-by-step:
1. Search the list above for exact matches
2. Use only real amounts and dates
3. Double-check your answer

Answer directly with facts only:"""

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            print(f"Sending prompt ({estimated_tokens} tokens) to Ollama...")

            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": "gemma3:1b",  # or llama3.2:3b for even better accuracy
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.0,           # ZERO creativity
                        "num_ctx": 8192,
                        "num_predict": 600,
                        "repeat_penalty": 1.2,
                        "stop": ["User question:", "====", "Legend:"],
                    }
                }
            )

            if response.status_code == 200:
                result = response.json()
                answer = result.get("response", "").strip()

                # Final safety net
                bad_phrases = ["approximately", "around", "about", "roughly", "seems", "probably"]
                if any(phrase in answer.lower() for phrase in bad_phrases):
                    return "I can only provide exact figures from your records."

                return answer or "No matching data found in your records."

            else:
                print(f"Ollama error: {response.status_code} {response.text[:200]}")
                return "AI service is temporarily unavailable."

    except Exception as e:
        print(f"AI request failed: {e}")
        return "Sorry, I'm having connection issues. Please try again."

async def get_ai_response_bkup(message: str, user_id: int, db: Session) -> str:
    expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
    user = get_user_details(user_id)
    currency = user.currency or "INR"

    total_credit = total_debit = 0.0
    toon_lines = []

    # Convert ALL expenses to TOON (super compact)
    for e in expenses:
        date_str = e.transaction_date.strftime("%Y-%m-%d")
        ttype = "C" if e.transaction_type == TransactionType.CREDIT else "D"
        amount = f"{e.amount:.2f}"
        details = (e.details or "").strip()
        # Escape pipe if somehow in details (very rare)
        details = details.replace("|", "/")

        toon_line = f"{date_str}|{ttype}|{amount}|{details}"
        toon_lines.append(toon_line)

        if e.transaction_type == TransactionType.CREDIT:
            total_credit += e.amount
        else:
            total_debit += e.amount

    net = total_credit - total_debit

    # Full context — but smartly truncated if too large
    full_context = "\n".join(toon_lines)
    summary = f"Income: {total_credit:.2f} {currency} | Expenses: {total_debit:.2f} {currency} | Net: {net:.2f} {currency} | Transactions: {len(toon_lines)}"

    # Estimate tokens (~4 chars per token)
    estimated_tokens = len(full_context) // 4 + len(summary) // 4 + 200  # + prompt overhead

    # If context is too big for model (safe limit: 7500 tokens), keep most recent
    if estimated_tokens > 7500:
        print(f"Context too large ({estimated_tokens} tokens), truncating to recent...")
        # Keep most recent 500 transactions + summary
        recent_context = "\n".join(toon_lines[-500:])
        context_to_use = f"{summary}\nRecent transactions (latest 500):\n{recent_context}"
        note = "\n(Note: Showing only the most recent 500 transactions due to volume)"
    else:
        context_to_use = f"{summary}\nAll transactions:\n{full_context}"
        note = ""

    prompt = f"""You are a personal finance AI advisor.

USER DATA (TOON format - date|C/D|amount|details):
{context_to_use}{note}

Legend:
- C = Income
- D = Expense
- All amounts in {currency}

RULES:
- Use ONLY the data above
- Never invent transactions
- Be accurate and concise
- If asked about something not in the data → say "I don't have that information"

Question: {message}

Answer directly:"""

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            print(f"Sending TOON prompt ({len(prompt)} chars ≈ {len(prompt)//4} tokens) to Ollama...")
            
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": "gemma3:1b",  # or llama3.2, phi3, etc.
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.2,
                        "num_ctx": 8192,        # Critical for full context
                        "num_predict": 512,
                    }
                }
            )

            if response.status_code == 200:
                result = response.json()
                answer = result.get("response", "").strip()
                return answer or "No response generated."
            else:
                print(f"Ollama error {response.status_code}: {response.text[:200]}")
                return "Sorry, the AI is busy. Try again in a moment."

    except Exception as e:
        print(f"AI call failed: {e}")
        return "I'm having connection issues. Please try again."


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
        # Use both routes for compatibility
        chart_url = f"{settings.SERVER_BASE_URL}/serve-files/{filename}"
        print(f"Chart URL generated: {chart_url}")
        return chart_url

    except Exception as e:
        print(f"Chart generation failed: {e}")
        import traceback
        traceback.print_exc()
        plt.close()
        return None