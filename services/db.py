from typing import Optional
from google.cloud import firestore

_db: Optional[firestore.Client] = None

def get_db() -> firestore.Client:
    global _db
    if _db is None:
        # Lazily initialize so app can start even if creds are set after launch
        _db = firestore.Client()
    return _db

def users_col():
    return get_db().collection("users")

def interviews_col():
    return get_db().collection("interviews")

def attempts_col():
    return get_db().collection("attempts")