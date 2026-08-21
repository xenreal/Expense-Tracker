from pydantic import BaseModel , Field 
from typing import Annotated, Literal
from fastapi import Query , Path
from datetime import date

class TransactionBase(BaseModel):
     person: Annotated[str , Field( min_length=3 , max_length=20 )]
     amount: Annotated[float , Field(gt=0)]
     date: date
     transaction_type: Literal["credit" , "debit"]

class TransactionCreate(TransactionBase):
     pass

class TransactionResponse(TransactionBase):
     id : int
     model_config = {"from_attributes": True}