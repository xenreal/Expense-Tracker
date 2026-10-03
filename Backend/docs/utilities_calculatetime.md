# Module: `app.Utilities.calculateTime`

## Overview
The `Utilities/calculateTime.py` module provides date calculation helpers that resolve human-readable time period shortcuts into precise calendar boundaries. It establishes standard "To-Date" interval boundaries (Week-to-Date, Month-to-Date, Year-to-Date) used across query and analytics endpoints.

## File Location
`Backend/app/Utilities/calculateTime.py`

## Dependencies
- `datetime.date`: System calendar date representations.
- `datetime.timedelta`: Duration arithmetic for day subtraction.

## Functions

### `get_period_dates(period: str) -> tuple[date | None, date | None]`
- **Description**: Computes the start date and end date tuple corresponding to a given named interval keyword.
- **Parameters**:
  - `period: str`: Name of the period shortcut.
- **Period Mapping**:
  - `"week"`: Monday of the current week (`today - timedelta(days=today.weekday())`) through `today`.
  - `"month"`: First calendar day of the current month (`today.replace(day=1)`) through `today`.
  - `"year"`: January 1st of the current year (`today.replace(month=1, day=1)`) through `today`.
  - `"6 months"`: 180 calendar days prior (`today - timedelta(days=180)`) through `today`.
  - Unrecognized periods: Returns `(None, None)`.
- **Returns**: A two-element tuple `(start_date, end_date)`.

## Integration
- Imported in `main.py` and called by:
  - `GET /transactions`
  - `GET /transactions/summary`
  - `GET /transactions/payee`
- Enables uniform calendar filtering across raw transaction queries and aggregated metrics.

