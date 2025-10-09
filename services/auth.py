from fastapi import HTTPException, Depends, Request
from firebase_admin import auth as fb_auth
import firebase_admin

# Initialize Firebase Admin once (and tolerate missing GOOGLE_APPLICATION_CREDENTIALS gracefully)
try:
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
except Exception:
    # Startup should not crash; token verification will still fail until creds are correct
    pass

def verify_firebase_token(request: Request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    id_token = auth_header.split(" ", 1)[1]
    try:
        decoded = fb_auth.verify_id_token(id_token)
        return decoded  # contains 'uid', etc.
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")