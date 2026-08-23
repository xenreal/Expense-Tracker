from sqlalchemy import Column, Integer, String, Float, Date, Boolean
from app.core.database import Base  

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer , primary_key=True , index=True)
    person = Column(String , nullable=False)
    amount = Column(Float , nullable=False)
    date = Column(Date , nullable=False)
    transaction_type = Column(String , nullable=False)