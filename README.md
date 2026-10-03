# Expense Tracker — Bank Statement Analyzer & API

A fast, lightweight personal expense tracking API built with **FastAPI**, **SQLAlchemy**, and **SQLite**. 

This project allows users to upload their bank statement spreadsheets (such as SBI Excel files, including password-protected sheets), automatically cleans and decodes messy bank transaction descriptions (like UPI transfers), stores them in a local SQLite database, and provides powerful search, filtering, and financial analytics.

---

## What This Project Does

1. **Ingests Statements:** Takes your raw, messy bank Excel export (even if encrypted with a password).
2. **Cleans & Parses:** Bypasses bank headers and logos, cleans rupee amounts (`₹`, commas), standardizes dates, and uses regex pattern-matching to extract real merchant and person names (e.g. extracts `"SWIGGY"` or a mobile number from `"WDL TFR UPI/DR/623619283719/SWIGGY/SBIN/order@upi"`).
3. **Persists to SQL:** Saves cleaned records into an SQLite database (`expenses.db`) via SQLAlchemy ORM.
4. **Browsing & Discovery:** Lets you view past transactions, search by who you paid, and filter by dates and amounts.
5. **Analytics & Insights:** Calculates total spending, total income, net cash flow, and ranks your top payees over specific calendar periods (this week, this month, this year).

---

## Key Features

### 1. Statement Upload & Decryption
* **Password Protection Support:** Built-in in-memory decryption using `msoffcrypto` for password-locked statements.
* **Smart Header Detection:** Automatically scans and detects the true table header row, cleanly ignoring the first 10–20 rows of account metadata, IFSC codes, and bank logos.
* **Multi-bank Column Normalization:** Uses keyword alias dictionaries (`Date`, `Debit`, `Credit`, `Narration`) to adapt to different bank column naming conventions.
* **UPI & Entity Extraction:** Extracts real payee names and phone numbers from complex bank narration strings.

### 2. Transaction Browsing & History
* **Newest-First Feed:** View your transactions sorted in descending order by date and ID.
* **Pagination:** Control list sizes using `skip` and `limit` to keep data transfer lightweight.

### 3. Search & Flexible Filtering
* **Name & Payee Search (`q`):** Case-insensitive search across merchant or person names (e.g., `?q=swiggy` matches "Swiggy", "SWIGGY", and "swiggy").
* **Date Range Filters (`start_date`, `end_date`):** Filter expenses between custom date windows.
* **Amount Range Filters (`min_amount`, `max_amount`):** Filter by minimum and maximum transaction amounts (e.g., find all transactions over ₹5,000, or small expenses under ₹200).
* **Calendar Period Shortcuts (`period`):** Instantly filter by real calendar boundaries:
  * `"week"`: Monday of the current week $\rightarrow$ Sunday.
  * `"month"`: 1st of the current month $\rightarrow$ Today.
  * `"year"`: January 1st $\rightarrow$ Today.
  * `"6months"`: Past 180 days.

### 4. Financial Summaries & Analytics
* **Total Expenses:** Sum of all debit transactions in the selected timeframe.
* **Total Income:** Sum of all credit transactions in the selected timeframe.
* **Net Cash Flow ($+/-$):** Net balance (Credit minus Debit) showing whether you saved or overspent.
* **Top Payees Leaderboard:** Ranked list showing who you paid the most money to within any time period (e.g., top 5 merchants you spent the most on this month).

---

## Tech Stack

* **Backend Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.14)
* **ASGI Server:** [Uvicorn](https://www.uvicorn.org/)
* **ORM & Database:** [SQLAlchemy](https://www.sqlalchemy.org/) with [SQLite](https://www.sqlite.org/) (`expenses.db`)
* **Data Validation & Schemas:** [Pydantic v2](https://docs.pydantic.dev/)
* **File & Data Processing:** [Pandas](https://pandas.pydata.org/), [openpyxl](https://openpyxl.readthedocs.io/)
* **Decryption:** [msoffcrypto-tool](https://github.com/nolze/msoffcrypto-tool)

---

## API Endpoints Overview

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `POST` | `/transactions/upload` | Upload an Excel statement (`.xlsx`, `.xls`) with an optional password. |
| `GET` | `/transactions` | List and search transactions (supports `q`, `start_date`, `end_date`, `min_amount`, `max_amount`, `period`, `skip`, `limit`). |
| `GET` | `/transactions/summary` | Get financial totals: `total_debited`, `total_credited`, and `net_balance`. |
| `GET` | `/transactions/top-payees` | Get ranked list of who you spent the most money on in a given timeframe. |

---

## How to Run the Project

1. **Activate the Virtual Environment & Navigate to Backend:**
   ```powershell
   cd Backend
   ```

2. **Start the Development Server:**
   ```powershell
   venv\Scripts\uvicorn app.main:app --reload
   ```
   *Or using FastAPI CLI:*
   ```powershell
   venv\Scripts\fastapi dev app\main.py
   ```

3. **Open the Interactive API Documentation:**
   * **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   * **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## Project Documentation & Learning Guides

* [**`ROADMAP.md`**](file:///c:/Dishu/Projects/Expense-Tracker/ROADMAP.md) — Step-by-step phased feature implementation guide and FastAPI concepts map.
* [**`DOUBTS.md`**](file:///c:/Dishu/Projects/Expense-Tracker/DOUBTS.md) — Personal learning notebook answering common doubts and questions with real-world analogies.
* [**`explanations/`**](file:///c:/Dishu/Projects/Expense-Tracker/explanations/) — Detailed, line-by-line concept explanations for every single backend file.
