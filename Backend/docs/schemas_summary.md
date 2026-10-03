# Module: `app.schemas.summary`

## Overview
The `schemas/summary.py` module defines the Pydantic response schema for financial summary metrics. It acts as the serialization contract for the `GET /transactions/summary` endpoint, ensuring consistent data structures for aggregated debits, credits, and net cash flow.

## File Location
`Backend/app/schemas/summary.py`

## Dependencies
- `pydantic.BaseModel`: Core Pydantic data model.

## Classes

### `SummaryResponse(BaseModel)`
- **Description**: Output schema returned by the financial summary endpoint.
- **Fields**:
  - `total_debited: float`: Aggregate sum of all debit (expense) transactions within the evaluated time window.
  - `total_credited: float`: Aggregate sum of all credit (income) transactions within the evaluated time window.
  - `net_balance: float`: Net difference between credits and debits (`total_credited - total_debited`). Positive values denote positive net cash flow; negative values denote a net deficit.

## Integration
- Serves as the `response_model` for `@app.get("/transactions/summary")` in `main.py`.
- Instantiated directly from a dictionary returned by database aggregation logic without requiring `from_attributes = True`.

