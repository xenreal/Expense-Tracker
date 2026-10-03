from typing import Annotated
from pydantic import BaseModel , Field

class TopPayeeResponse(BaseModel):
    person: str 
    amount: Annotated[float , Field(gt=0)]