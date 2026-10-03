# Module: `app.schemas.payees`

## Overview
The `schemas/payees.py` module defines the Pydantic schema for counterparty spending rankings. It acts as the serialization contract for items in the ranked payees leaderboard returned by `GET /transactions/payee`.

## File Location
`Backend/app/schemas/payees.py`

## Dependencies
- `pydantic.BaseModel`: Core Pydantic data model.
- `pydantic.Field`: Validation constraint definitions.
- `typing.Annotated`: Metadata binding for type hints.

## Classes

### `TopPayeeResponse(BaseModel)`
- **Description**: Schema representing a single ranked counterparty or merchant entry.
- **Fields**:
  - `person: str`: Name, business entity, or mobile identifier of the recipient.
  - `amount: Annotated[float, Field(gt=0)]`: Total monetary amount spent on this counterparty within the queried time period. Validated to be strictly positive (`gt=0`).

## Integration
- Wrapped in a list (`response_model=list[TopPayeeResponse]`) for the `@app.get("/transactions/payee")` endpoint in `main.py`.
- Formatted from grouped and summed SQLAlchemy query results (`group_by(Transaction.person)`).

