from app.core.database import engine, Base
from fastapi import FastAPI
from app.models.transaction import Transaction

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")

@app.get("/")
def read_root():
    return {"status": "running"}