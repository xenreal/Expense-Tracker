import io
import pandas as pd
from datetime import date
from app.schemas.transaction import TransactionCreate
import msoffcrypto
import re

DATE_ALIASES = ["date", "txn date", "transaction date", "value date", "posting date"]
DESC_ALIASES = ["description", "narration", "particulars", "details", "remarks", "memo"]
DEBIT_ALIASES = ["debit", "withdrawal", "dr", "amount debit", "withdrawal amt"]
CREDIT_ALIASES = ["credit", "deposit", "cr", "amount credit", "deposit amt"]

def find_column_name(actual_columns, alias_list):
    for col in actual_columns:
        cleaned_col = str(col).strip().lower()
        
        if cleaned_col in alias_list:
            return col
            
    return None  

def clean_numeric_value(val) -> float | None:
    if pd.isna(val):
        return None
        
    clean_str = str(val).replace(",", "").replace("₹", "").strip()
    
    try:
        num = float(clean_str)
        return num if num > 0 else None
    except (ValueError, TypeError):
        return None

def extract_amount_type(row , credit_col , debit_col):

    debit_val = clean_numeric_value(row[debit_col]) if debit_col else 0.0
    credit_val = clean_numeric_value(row[credit_col]) if credit_col else 0.0

    if debit_val is not None:
        return debit_val, "debit"
    elif credit_val is not None:
        return credit_val, "credit"
        
    return None, None

def clean_date_value(val) -> date | None:
    if pd.isna(val):
        return None
    try:
        # pd.to_datetime automatically parses formats like 'DD/MM/YYYY' or 'YYYY-MM-DD'
        parsed_dt = pd.to_datetime(val)
        return parsed_dt.date()
    except Exception:
        return None

# Bank tags to ignore
IGNORE_TOKENS = {
    "wdl", "tfr", "upi", "dr", "cr", "trf", "pos", "neft", "rtgs", 
    "imps", "inb", "mb", "paym", "payment", "transfer", "to", "by", "from"
}

def extract_upi_entity(narration) -> str:
    if pd.isna(narration) or not narration:
        return "Unknown"
    
    text = str(narration).strip()
    
    # 1. Handle slash-delimited SBI UPI formats:
    # Example: "WDL TFR UPI/DR/623619283719/SWIGGY/SBIN/order@upi"
    if "/" in text:
        parts = [p.strip() for p in text.split("/") if p.strip()]
        
        for i, part in enumerate(parts):
            # The recipient/sender name comes after DR/CR or the 9-12 digit RRN
            if part.upper() in ["DR", "CR"] and (i + 2) < len(parts):
                name = parts[i + 2].strip()
                return " ".join(name.split())[:30]
            if re.match(r"^\d{9,12}$", part) and (i + 1) < len(parts):
                name = parts[i + 1].strip()
                return " ".join(name.split())[:30]
        
        # Fallback for standard 4+ segment slash formats
        if len(parts) >= 4:
            return " ".join(parts[3].split())[:30]

    # 2. Regex fallback for inline UPI patterns
    match = re.search(r"UPI/(?:DR|CR)/\d+/([^/]+)", text, re.IGNORECASE)
    if match:
        return " ".join(match.group(1).strip().split())[:30]

    # 3. Handle non-UPI bank transfers (strip common SBI prefixes)
    cleaned = re.sub(
        r"^(WDL TFR|DEP TFR|BY TRANSFER|TO TRANSFER|TRANSFER FROM|TRANSFER TO|UPI[-/ ]+)",
        "",
        text,
        flags=re.IGNORECASE
    ).strip()

    cleaned_name = " ".join(cleaned.split())
    return cleaned_name[:30] if len(cleaned_name) >= 3 else "Unknown"

def find_header_row_and_load_df(contents: bytes) -> pd.DataFrame:
    # Read sheet with NO header
    raw_df = pd.read_excel(io.BytesIO(contents), header=None)
    
    # Check the first 50 rows
    for idx, row in raw_df.head(50).iterrows():
        # Clean all cell values in this row
        row_values = [str(val).strip().lower() for val in row.values if pd.notna(val)]
        
        # Check if this row looks like a header (contains a date alias + debit/credit alias)
        has_date = any(alias in row_values for alias in DATE_ALIASES)
        has_amount = any(alias in row_values for alias in (DEBIT_ALIASES + CREDIT_ALIASES))
        
        if has_date and has_amount:
            # Found the real table header row!
            # skiprows=idx tells Pandas to ignore all metadata above this row
            return pd.read_excel(io.BytesIO(contents), skiprows=idx)
            
    # Fallback to standard read if no special header is found
    return pd.read_excel(io.BytesIO(contents))

def parse_excel(contents: bytes) -> list[TransactionCreate]:
    df = find_header_row_and_load_df(contents)
    
    date_col = find_column_name(df.columns, DATE_ALIASES)
    desc_col = find_column_name(df.columns, DESC_ALIASES)
    debit_col = find_column_name(df.columns, DEBIT_ALIASES)
    credit_col = find_column_name(df.columns, CREDIT_ALIASES)
    
    if not date_col or (not debit_col and not credit_col):
        raise ValueError("Could not find required Date or Amount columns in the uploaded Excel file.")
    
    transactions: list[TransactionCreate] = []
    
    SUMMARY_MARKERS = ["statement summary", "summary of account", "**end of statement**", "total transactions"]

    for _, row in df.iterrows():
     # 1. STOP SIGN: Check if we reached the summary or footer section
     row_text = " ".join([str(val).lower() for val in row.values if pd.notna(val)])
     if any(marker in row_text for marker in SUMMARY_MARKERS):
        break

     # 2. SAFETY NET 1: Validate numeric amount and determine debit/credit
     amount, txn_type = extract_amount_type(row, credit_col, debit_col)
     if amount is None or txn_type is None:
        continue

    # 3. SAFETY NET 2: Validate calendar date
     txn_date = clean_date_value(row[date_col])
     if txn_date is None:
        continue

     person_name = extract_upi_entity(row[desc_col]) if desc_col else "Unknown"

     item = TransactionCreate(
    person=person_name,
    amount=amount,
    date=txn_date,
    transaction_type=txn_type
    )
     transactions.append(item)
        
    return transactions

def decrypt_excel(contents: bytes, password: str | None = None) -> bytes:
    input = io.BytesIO(contents)
    decrypted = io.BytesIO()
    
    try:
        file = msoffcrypto.OfficeFile(input)
        
        # If the file is not encrypted, return the original bytes as-is
        if not file.is_encrypted():
            return contents
            
        # If it IS encrypted but the user didn't give a password
        if not password:
            raise ValueError("File is password-protected. Please provide a password.")
            
        # Unlock and decrypt
        file.load_key(password=password)
        file.decrypt(decrypted)
        decrypted.seek(0)
        return decrypted.read()
        
    except msoffcrypto.exceptions.InvalidKeyError:
        raise ValueError("Incorrect password provided for the protected Excel file.")
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        # If msoffcrypto fails to inspect non-office formats, fallback to contents
        return contents