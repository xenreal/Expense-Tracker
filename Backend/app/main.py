from app.core.database import engine, Base , get_db
from fastapi import FastAPI , UploadFile , File , Depends , HTTPException , Form
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionResponse
from sqlalchemy.orm import Session
from app.services.parser import parse_excel , decrypt_excel
from datetime import date
from app.Utilities.calculateTime import get_period_dates
from sqlalchemy import func
from app.schemas.summary import SummaryResponse
from app.schemas.payees import TopPayeeResponse

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

@app.get("/transactions" , response_model=list[TransactionResponse])
def get_all_transactions(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    q: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    min_amount: float | None = None,
    max_amount: float | None = None,
    period: str | None = None,
):

    query = db.query(Transaction)

    if period and (from_date or to_date):
        raise HTTPException(status_code=400, detail="Please provide either 'period' or 'start date/'end date' not both")

    if q: 
        query=query.filter(Transaction.person.ilike(f"%{q}%"))

    if from_date:
        query = query.filter(Transaction.date >= from_date)

    if to_date:
        query = query.filter(Transaction.date <= to_date)

    if min_amount:
        query = query.filter(Transaction.amount >= min_amount)

    if max_amount:
        query = query.filter(Transaction.amount <= max_amount)

    if period:
        from_date , to_date = get_period_dates(period)
        if from_date and to_date:
         query = query.filter(Transaction.date >= from_date , Transaction.date<=to_date)



    results = (
        query
        .order_by(Transaction.date.desc(), Transaction.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
#     results = (
#     db.query(Transaction)
#     .order_by(Transaction.date.desc(), Transaction.id.desc())
#     .offset(skip)
#     .limit(limit)
#     .all()
# )

    return results

@app.get("/transactions/summary" , response_model=SummaryResponse)
def summary(
    from_date: date | None = None,
    to_date: date | None = None,
    period: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Transaction)

    if period and (from_date or to_date):
        raise HTTPException(status_code=400 , detail="Please provide either 'period' or 'start date/'end date' not both")

    if (from_date and not to_date) or (to_date and not from_date):
        raise HTTPException(status_code=400 , detail="Please enter both the fields")

    if period:
        p_start , p_end = get_period_dates(period)
        if p_start and p_end:
            query = query.filter(Transaction.date >= p_start , Transaction.date <= p_end)

    elif from_date and to_date:
        query = query.filter(Transaction.date >= from_date , Transaction.date <= to_date)

    # transactions = query.all()

    total_debited = query.filter(Transaction.transaction_type == "debit").with_entities(func.sum(Transaction.amount)).scalar() or 0.0   
    total_credited = query.filter(Transaction.transaction_type == "credit").with_entities(func.sum(Transaction.amount)).scalar() or 0.0   

    net_balance = total_credited - total_debited

    return {
        "total_debited" : round(total_debited , 2),
        "total_credited" : round(total_credited,2),
        "net_balance" : round(net_balance, 2)
    }

        
@app.get("/transactions/payee" , response_model=list[TopPayeeResponse])
def payee(
    db: Session = Depends(get_db),
    from_date: date | None = None,
    to_date: date | None = None,
    period: str | None = None,
    limit: int = 10,
):
    query = db.query(Transaction)

    if period and (from_date or to_date):
            raise HTTPException(status_code=400 , detail="Please provide either 'period' or 'start date/'end date' not both")
    
    if (from_date and not to_date) or (to_date and not from_date):
            raise HTTPException(status_code=400 , detail="Please enter both the fields")

    if period:
            p_start , p_end = get_period_dates(period)
            if p_start and p_end:
                query = query.filter(Transaction.date >= p_start , Transaction.date <= p_end)
    
    elif from_date and to_date:
            query = query.filter(Transaction.date >= from_date , Transaction.date <= to_date)

    results = (
        query.filter(Transaction.transaction_type == "debit")
        .with_entities(Transaction.person, func.sum(Transaction.amount)
        .label("amount"))
        .group_by(Transaction.person).order_by(func.sum(Transaction.amount).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "person" : row.person,
            "amount" : round(row.amount , 2)
        }

        for row in results
    ]