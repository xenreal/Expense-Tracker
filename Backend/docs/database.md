# Module: `app.core.database`

## Overview
The `database.py` module manages database configuration, engine initialization, session lifecycle, and ORM base class declaration for the application using SQLAlchemy. It connects to a local SQLite database (`expenses.db`) and provides a generator dependency for request-scoped database sessions.

## File Location
`Backend/app/core/database.py`

## Dependencies
- `sqlalchemy.create_engine`: Initializes the database engine connection.
- `sqlalchemy.orm.sessionmaker`: Factory for creating database sessions.
- `sqlalchemy.orm.declarative_base`: Base class for declarative ORM models.

## Module Attributes

### `SQLALCHEMY_DATABASE_URL`
- **Type**: `str`
- **Value**: `"sqlite:///./expenses.db"`
- **Description**: Connection string specifying the SQLite dialect and relative database file location.

### `engine`
- **Type**: `Engine`
- **Configuration**: `connect_args={"check_same_thread": False}`
- **Description**: Central connection interface to the SQLite database. The `check_same_thread: False` argument allows multi-threaded request workers in FastAPI to interact with the SQLite connection.

### `SessionLocal`
- **Type**: `sessionmaker`
- **Configuration**: `autocommit=False`, `autoflush=False`, `bind=engine`
- **Description**: Configured session factory bound to `engine`. Sessions require manual commit calls to persist staged transactions.

### `Base`
- **Type**: `DeclarativeMeta`
- **Description**: Common declarative base class from which all database models inherit. Model definitions register their metadata with this base.

## Functions

### `get_db() -> Generator[Session, None, None]`
- **Description**: Context-managed generator dependency designed for FastAPI dependency injection (`Depends(get_db)`).
- **Behavior**:
  - Instantiates a new `SessionLocal()` instance upon entry.
  - Yields the session to the requesting route function.
  - Closes the session within a `finally` block upon completion or failure of the request, preventing connection leaks.

