# Module: `app.main`

## Overview
The `main.py` module is the primary entry point and routing controller for the FastAPI application. It initializes the database schema, configures CORS and API settings, defines HTTP route handlers, orchestrates file ingestion, and executes database queries and aggregations.

## File Location
`Backend/app/main.py`

## Dependencies
- `fastapi`: Framework components (`FastAPI`, `UploadFile`, `File`, `Depends`, `HTTPException`, `Form`).
- `sqlalchemy.orm.Session`: Database session interface.
- `sqlalchemy.func`: SQL aggregate function builders.
- `datetime.date`: Calendar date type handling.
- `app.core.database`: Database engine, base metadata, and `get_db` dependency.
- `app.models.transaction`: `Transaction` ORM model.
- `app.schemas.transaction`: `TransactionResponse` schema.
- `app.schemas.summary`: `SummaryResponse` schema.
- `app.schemas.payees`: `TopPayeeResponse` schema.
- `app.services.parser`: `parse_excel` and `decrypt_excel` file processing services.
- `app.Utilities.calculateTime`: `get_period_dates` calendar calculation utility.

## Initialization
- `Base.metadata.create_all(bind=engine)`: Runs on application import/startup to generate database tables if they do not exist.
- `app = FastAPI(title="Expense Tracker API")`: Instantiates the FastAPI application.

## Endpoints

### 1. `GET /`
- **Function**: `read_root()`
- **Purpose**: Lightweight health check endpoint to verify server availability.
- **Response**: `{"status": "running"}` (HTTP 200).

---

### 2. `POST /transactions/upload`
- **Function**: `upload_statement(file: UploadFile, password: str | None, db: Session)`
- **Response Model**: `list[TransactionResponse]`
- **Consumes**: `multipart/form-data`
- **Workflow**:
  1. Validates file extension against `.xlsx` and `.xls`. Returns HTTP 400 on failure.
  2. Asynchronously reads file bytes.
  3. Decrypts file payload using `decrypt_excel()` if password-protected.
  4. Parses rows into `TransactionCreate` schema objects using `parse_excel()`.
  5. Computes minimum and maximum dates (`min_date`, `max_date`) across the parsed transactions.
  6. Executes a single batch query to retrieve existing database records within that date range.
  7. Constructs an in-memory hash set of existing transaction fingerprints `(person, amount, date, transaction_type)` for O(1) lookup.
  8. Iterates through parsed transactions, skipping any items already in the hash set (deduplication check), and staging new records via `db.add()`.
  9. Persists records via `db.commit()` and executes `db.refresh()` on each saved entity to populate autoincremented `id` values.
  10. Returns list of newly saved transactions serialized via `TransactionResponse`.
- **Status Codes**:
  - `200 OK`: Successful upload and persistence.
  - `400 Bad Request`: Invalid file extension or no valid transactions detected.
  - `422 Unprocessable Entity`: Password error or invalid spreadsheet structure.
  - `500 Internal Server Error`: Unhandled file processing failure.

---

### 3. `GET /transactions`
- **Function**: `get_all_transactions(skip, limit, db, q, from_date, to_date, min_amount, max_amount, period)`
- **Response Model**: `list[TransactionResponse]`
- **Query Parameters**:
  - `skip` (`int`, default `0`): Pagination offset.
  - `limit` (`int`, default `50`): Maximum records returned.
  - `q` (`str | None`): Case-insensitive payee substring filter (`Transaction.person.ilike`).
  - `from_date` (`date | None`): Lower bound date filter (`Transaction.date >= from_date`).
  - `to_date` (`date | None`): Upper bound date filter (`Transaction.date <= to_date`).
  - `min_amount` (`float | None`): Minimum transaction value (`Transaction.amount >= min_amount`).
  - `max_amount` (`float | None`): Maximum transaction value (`Transaction.amount <= max_amount`).
  - `period` (`str | None`): Named calendar shortcut (`"week"`, `"month"`, `"year"`, `"6 months"`).
- **Validation**:
  - Enforces mutual exclusivity: raises HTTP 400 if `period` is provided alongside `from_date` or `to_date`.
- **Sorting**: Ordered descending by `date`, then descending by `id`.

---

### 4. `GET /transactions/summary`
- **Function**: `summary(from_date, to_date, period, db)`
- **Response Model**: `SummaryResponse`
- **Query Parameters**:
  - `from_date` (`date | None`): Custom start date.
  - `to_date` (`date | None`): Custom end date.
  - `period` (`str | None`): Predefined calendar interval.
- **Validation**:
  - Raises HTTP 400 if `period` is supplied with custom dates.
  - Raises HTTP 400 if only one custom date boundary is supplied without the other.
- **Aggregation**:
  - Uses `func.sum(Transaction.amount)` on the filtered query for `"debit"` and `"credit"` types separately.
  - Extracts scalar values using `.scalar() or 0.0`.
  - Calculates `net_balance = total_credited - total_debited`.
- **Response**: Dictionary with values rounded to 2 decimal places.

---

### 5. `GET /transactions/payee`
- **Function**: `payee(db, from_date, to_date, period, limit)`
- **Response Model**: `list[TopPayeeResponse]`
- **Query Parameters**:
  - `from_date` (`date | None`): Custom start date.
  - `to_date` (`date | None`): Custom end date.
  - `period` (`str | None`): Predefined calendar interval.
  - `limit` (`int`, default `10`): Maximum number of top payees to return.
- **Aggregation**:
  - Filters strictly for `transaction_type == "debit"`.
  - Aggregates spending via `.group_by(Transaction.person)`.
  - Ranks counterparties via `.order_by(func.sum(Transaction.amount).desc())`.
  - Restricts results to `limit`.
- **Response**: List of dictionaries containing `person` and rounded `amount`.

