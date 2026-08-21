import io
import pandas as pd

# contents = raw bytes from the uploaded file
df = pd.read_excel(io.BytesIO(contents))


COLUMN_ALIASES = {
    "date": ["date", "txn date", "transaction date", "value date", "posting date"],
    "description": ["description", "narration", "particulars", "details", "remarks", "memo"],
    "debit": ["debit", "withdrawal", "dr", "amount debit", "withdrawal amt"],
    "credit": ["credit", "deposit", "cr", "amount credit", "deposit amt"],
    "amount": ["amount", "txn amount", "net amount", "transaction amount"],
    "type": ["type", "dr/cr", "cr/dr", "txn type"]
}