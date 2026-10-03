# Module: `app.schemas.transaction`

## Overview
The `schemas/transaction.py` module defines Pydantic data models for transaction data validation and serialization. It enforces validation rules for transaction inputs during parsing and specifies the outbound schema contract for transaction API endpoints.

## File Location
`Backend/app/schemas/transaction.py`

## Dependencies
- `pydantic.BaseModel`: Base validation model.
- `pydantic.Field`: Field-level validation constraints.
- `typing.Annotated`, `typing.Literal`: Type hint constraints for fixed string literals and metadata bindings.
- `datetime.date`: Python date standard type.

## Classes

### `TransactionBase(BaseModel)`
- **Description**: Base abstract schema defining common fields across creation and response schemas.
- **Fields**:
  - `person: Annotated[str, Field(min_length=3, max_length=20)]`: Name of the counterparty, merchant, or beneficiary. Constrained between 3 and 20 characters.
  - `amount: Annotated[float, Field(gt=0)]`: Transaction value. Must be strictly greater than 0.
  - `date: date`: Posting date of the transaction.
  - `transaction_type: Literal["credit", "debit"]`: Enumerated string restricted exclusively to `"credit"` or `"debit"`.

### `TransactionCreate(TransactionBase)`
- **Description**: Schema used internally during Excel parsing. Validates raw row values extracted from uploaded statements before they are converted into ORM objects.
- **Inheritance**: Inherits all fields from `TransactionBase`. Contains no `id` field since the database generates it upon commit.

### `TransactionResponse(TransactionBase)`
- **Description**: Serialization schema for API outputs returning transaction records (used in `POST /transactions/upload` and `GET /transactions`).
- **Additional Fields**:
  - `id: int`: Primary key identifier assigned by the database.
- **Configuration**:
  - `model_config = {"from_attributes": True}`: Enables Pydantic to read directly from SQLAlchemy ORM model attributes rather than dictionary keys.

