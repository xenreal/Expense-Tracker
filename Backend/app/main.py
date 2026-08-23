from app.core.database import engine, Base , get_db
from fastapi import FastAPI , UploadFile , File , Depends , HTTPException , Form
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionResponse
from sqlalchemy.orm import Session
from app.services.parser import parse_excel , decrypt_excel

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")

@app.get("/")
def read_root():
    return {"status": "running"}

@app.post("/transactions/upload", response_model=list[TransactionResponse])
async def upload_statement(
    file: UploadFile = File(...),
    password: str | None = Form(None),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload an Excel file (.xlsx or .xls)"
        )
    
    try:
        contents = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read the uploaded file.")
    
    # Decrypt if password-protected, then parse
    try:
        decrypted_contents = decrypt_excel(contents, password)
        parsed_transactions = parse_excel(decrypted_contents)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

    if not parsed_transactions:
        raise HTTPException(status_code=400, detail="No valid transactions found in the file.")

    # 4. Save to Database
    saved_transactions = []
    for item in parsed_transactions:
        db_item = Transaction(
            person=item.person,
            amount=item.amount,
            date=item.date,
            transaction_type=item.transaction_type
        )
        db.add(db_item)
        saved_transactions.append(db_item)
    
    db.commit()
    
    for item in saved_transactions:
        db.refresh(item)
        
    return saved_transactions