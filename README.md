# Expense Tracker — Bank Statement Analyzer and Financial Dashboard

A personal expense tracking and bank statement analysis web application built with FastAPI and SQLite.

> **Project Status:** Complete (v2.0.0). Full-stack web application featuring a Python FastAPI backend + simple UI

---

## What This Project Does

Managing raw bank statements manually is difficult because descriptions are messy, dates and numbers are formatted differently across banks, and statements often contain extra rows like logos and branch addresses.

This project solves that problem:

1. **Reads Bank Statements:** Accepts your bank statement in Excel format (.xlsx or .xls), including password-protected files.
2. **Cleans and Extracts Data:** Ignores header rows, cleans currency amounts, standardizes dates, and extracts clean merchant or person names from complex bank narration strings (such as UPI transfers).
3. **Stores Data Locally:** Saves clean transaction records into a local SQLite database (`expenses.db`) while automatically preventing duplicate entries.
4. **Interactive Dashboard:** Provides a dark-mode web interface to search transactions, filter by date or calendar period, view total income and expenses, and rank top payees.

---

## Features

### 1. Statement Upload and Parsing
* **Password Support:** Built-in decryption for password-locked statements.
* **Smart Detection:** Automatically locates table headers, skipping bank logos, branch names, and account metadata rows.
* **Duplicate Prevention:** Skips records that have already been uploaded, preventing duplicate rows when uploading overlapping statements.
* **Name Extraction:** Uses pattern matching to extract real payee names and phone numbers from raw narration text.

### 2. Transaction Feed and Search
* **Newest-First Feed:** View your records sorted in descending order by date.
* **Name Search:** Search transactions by payee or merchant name in real time.
* **Period Filters:** Filter records by calendar shortcuts: This Week, This Month, This Year, or the past 6 Months.
* **Status Indicators:** Clear badges and arrows indicating whether money came in (Credit) or went out (Debit).

### 3. Financial Summary
* **Total Expenses:** Sum of all debit transactions in the selected period.
* **Total Income:** Sum of all credit transactions in the selected period.
* **Net Cash Flow:** Difference between income and expenses, showing whether you saved or overspent.

### 4. Top Payees Leaderboard
* **Ranked List:** View who you paid the most money to within any selected time window.
* **Visual Progress Bars:** Background fill showing each payee's proportion relative to your highest expense.
* **Medal Badges:** Gold, silver, and bronze rank indicators for your top three spending recipients.

---

## Tech Stack

### Backend
* **Language:** Python
* **Web Framework:** FastAPI
* **Database and ORM:** SQLite with SQLAlchemy
* **Data Validation:** Pydantic v2
* **File Processing:** Pandas and OpenPyXL
* **Decryption:** msoffcrypto-tool
* **Server:** Uvicorn

---

## How to Run the Project

### Option A: One-Click Start (Windows)

If you are on Windows and have already set up your Python virtual environment and installed npm packages, double-click the `start.bat` file in the root folder, or run:

```bat
start.bat
```

This launches both the backend and frontend in separate console windows.

---

### Option B: Manual Setup (Two Terminals)

#### Prerequisites
* Python 3.10 or higher
* Node.js 18 or higher

#### 1. Start the Backend

Open a terminal and navigate to the `Backend` directory:

```bash
cd Backend
```

Create and activate a virtual environment:

On Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

On macOS and Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies:
```bash
pip install -r requirements.txt
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

The backend API will run on `http://127.0.0.1:8000`. You can test the interactive API documentation at `http://127.0.0.1:8000/docs`.

---

#### 2. Start the Frontend

Open a second terminal and navigate to the `Frontend` directory:

```bash
cd Frontend
```

Install frontend dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The web interface will run on `http://localhost:5173`. Open that URL in your browser to use the application.

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/` | Health check endpoint returning server status. |
| `POST` | `/transactions/upload` | Upload an Excel statement (`.xlsx`, `.xls`) with an optional password. |
| `GET` | `/transactions` | List and search transactions with support for search query, date ranges, and period filters. |
| `GET` | `/transactions/summary` | Get financial totals: `total_debited`, `total_credited`, and `net_balance`. |
| `GET` | `/transactions/payee` | Get ranked list of payees by total debit amount in a given time period. |

