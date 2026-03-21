import os, hashlib, hmac, random
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import users

router = APIRouter(tags=["Auth"])

class Auth(BaseModel):
    email: str
    password: str

# --- Password Hashing (Unchanged as requested) ---
def hash_password(password):
    salt = os.urandom(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return salt.hex(), hashed.hex()

def verify_password(password, salt, stored):
    salt = bytes.fromhex(salt)
    new_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return hmac.compare_digest(new_hash.hex(), stored)

# --- REGISTER: Generate 6-Digit ID ---
@router.post("/customer/register")
def register(req: Auth):
    if users.find_one({"email": req.email}):
        raise HTTPException(400, "User exists")

    # Generate unique 6-digit Customer ID
    while True:
        cust_id = str(random.randint(100000, 999999))
        # Ensure ID uniqueness in the users collection
        if not users.find_one({"customer_id": cust_id}):
            break

    salt, hashed = hash_password(req.password)

    users.insert_one({
        "customer_id": cust_id, # Added unique ID
        "email": req.email,
        "password": hashed,
        "salt": salt,
        "role": "customer"
    })

    return {"message": "Registered", "customer_id": cust_id}

# --- LOGIN: Return ID to Frontend ---
@router.post("/customer/login")
def login(req: Auth):
    user = users.find_one({"email": req.email, "role": "customer"})

    if not user or not verify_password(req.password, user["salt"], user["password"]):
        raise HTTPException(401, "Invalid")

    # Return customer_id so frontend can save it to localStorage
    return {
        "message": "Login success", 
        "email": req.email, 
        "customer_id": user.get("customer_id") 
    }

@router.post("/admin/login")
def admin_login(req: Auth):
    user = users.find_one({"email": req.email, "role": "admin"})

    if not user or not verify_password(req.password, user["salt"], user["password"]):
        raise HTTPException(401, "Invalid")

    return {"message": "Admin login success"}
