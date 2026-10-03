# Module: `app.models.transaction`

## Overview
The `models/transaction.py` module defines the SQLAlchemy ORM schema for the `transactions` table. It represents individual financial transactions stored in the SQLite database, mapping table columns to Python object attributes.

## File Location
`Backend/app/models/transaction.py`

## Dependencies
- `sqlalchemy.Column`, `Integer`, `String`, `Float`, `Date`: SQLAlchemy column definitions and data types.
- `app.core.database.Base`: Declarative base class for ORM mapping.

## Classes

### `Transaction(Base)`
- **Table Name**: `transactions`
- **Description**: ORM model representing a financial transaction row.

#### Columns
| Column Name | SQL Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `primary_key=True`, `index=True` | Unique autoincrementing primary key identifier. Indexed for fast lookup. |
| `person` | `VARCHAR` | `nullable=False`, `default="self"` | Payee or merchant identifier extracted from narration (e.g., merchant name, beneficiary, or mobile number). |
| `amount` | `FLOAT` | `nullable=False` | Monetary transaction value represented as a double-precision floating-point number. |
| `date` | `DATE` | `nullable=False` | Transaction posting date stored in ISO calendar format (`YYYY-MM-DD`). |
| `transaction_type` | `VARCHAR` | `nullable=False`, `default="debit"` | Direction of fund movement (`"debit"` for expenses, `"credit"` for income). |

## Integration
- Instantiated in `main.py` when mapping validated `TransactionCreate` objects from statement uploads.
- Queried by `main.py` endpoints for listing, date/amount filtering, summary aggregations (`func.sum`), and grouping (`group_by(Transaction.person)`).

