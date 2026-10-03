# Module: `app.services.parser`

## Overview
The `services/parser.py` module handles the ingestion, decryption, structure detection, and normalization of bank statement spreadsheets (specifically SBI Excel exports). It converts binary spreadsheet payloads into strongly typed `TransactionCreate` schema instances.

## File Location
`Backend/app/services/parser.py`

## Dependencies
- `io`: In-memory binary streams (`BytesIO`).
- `pandas`: Tabular data loading, slicing, and date parsing.
- `datetime.date`: Calendar date type representations.
- `msoffcrypto`: Decryption of password-protected Microsoft Office spreadsheets.
- `re`: Regular expressions for entity and pattern extraction from bank narrations.
- `app.schemas.transaction.TransactionCreate`: Target schema for parsed transaction rows.

## Constants

- `DATE_ALIASES`: Synonyms for transaction posting date columns (`"date"`, `"txn date"`, `"transaction date"`, `"value date"`, `"posting date"`).
- `DESC_ALIASES`: Synonyms for transaction narration columns (`"description"`, `"narration"`, `"particulars"`, `"details"`, `"remarks"`, `"memo"`).
- `DEBIT_ALIASES`: Synonyms for debit/withdrawal amount columns (`"debit"`, `"withdrawal"`, `"dr"`, `"amount debit"`, `"withdrawal amt"`).
- `CREDIT_ALIASES`: Synonyms for credit/deposit amount columns (`"credit"`, `"deposit"`, `"cr"`, `"amount credit"`, `"deposit amt"`).
- `IGNORE_TOKENS`: Bank transaction markers and channel identifiers stripped or ignored during merchant extraction.
- `SUMMARY_MARKERS`: Text strings identifying statement footer rows (`"statement summary"`, `"summary of account"`, `"**end of statement**"`, `"total transactions"`).

## Functions

### `decrypt_excel(contents: bytes, password: str | None = None) -> bytes`
- **Description**: Inspects binary file data for Microsoft Office encryption. If encrypted, decrypts using the supplied password.
- **Parameters**:
  - `contents`: Raw binary stream of the uploaded spreadsheet.
  - `password`: Optional plaintext password string.
- **Returns**: Decrypted binary payload ready for pandas ingestion.
- **Exceptions**: Raises `ValueError` if the file is encrypted but no password was given, or if an invalid password was provided.

### `find_header_row_and_load_df(contents: bytes) -> pd.DataFrame`
- **Description**: Scans the first 50 rows of the spreadsheet without assuming a header row. Identifies the real table header by checking for simultaneous presence of date and amount aliases, then reloads the DataFrame using `skiprows`.
- **Returns**: A cleaned `pandas.DataFrame` where column names correspond to actual table columns.

### `find_column_name(actual_columns, alias_list) -> str | None`
- **Description**: Case-insensitive and whitespace-stripped lookup that maps actual spreadsheet column headers to standard canonical alias lists.

### `clean_numeric_value(val) -> float | None`
- **Description**: Strips currency symbols (`₹`), commas, and whitespace from cell values. Converts strings to floats and returns `None` if the value is zero, negative, or non-numeric.

### `extract_amount_type(row, credit_col, debit_col) -> tuple[float | None, str | None]`
- **Description**: Inspects debit and credit columns for a given row. Returns the monetary value and the corresponding transaction type (`"debit"` or `"credit"`).

### `clean_date_value(val) -> date | None`
- **Description**: Parses various date string representations into a Python `datetime.date` object using `pd.to_datetime`. Returns `None` on invalid formats.

### `extract_upi_entity(narration) -> str`
- **Description**: Extracts the merchant or counterparty name from unstructured bank narration text.
- **Parsing Strategy**:
  1. Splitting on slashes (`/`) for SBI UPI structures (locating segments following `DR`, `CR`, or 9-12 digit reference numbers).
  2. Regular expression fallback: `UPI/(?:DR|CR)/\d+/([^/]+)`.
  3. Strip prefixes for non-UPI transfers (`WDL TFR`, `DEP TFR`, `BY TRANSFER`, etc.).
- **Returns**: Cleaned entity name truncated to 30 characters, or `"Unknown"`.

### `parse_excel(contents: bytes) -> list[TransactionCreate]`
- **Description**: Top-level parsing orchestrator. Detects table headers, identifies mapped columns, iterates through rows, terminates on footer summary markers, validates data, and constructs `TransactionCreate` instances.
- **Returns**: A list of validated `TransactionCreate` instances.
- **Exceptions**: Raises `ValueError` if required date or amount columns are absent.

