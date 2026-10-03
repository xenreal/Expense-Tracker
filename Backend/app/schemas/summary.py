from typing import Annotated
from pydantic import BaseModel


class SummaryResponse(BaseModel):
    total_debited: float
    total_credited: float
    net_balance: float


