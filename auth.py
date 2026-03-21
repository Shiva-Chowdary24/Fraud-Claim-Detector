import os, hashlib, hmac, random
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import users
from datetime import datetime

router = APIRouter(tags=["Auth"])

# Updated Model to include full_name
class AuthRequest(BaseModel):
    email: str
    password: str
    full_name: str = None  # Optional for login, required for signup

def hash_password(password):
    salt = os.urandom(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return salt.hex(), hashed.hex()

def verify_password(password, salt, stored):
    salt = bytes.fromhex(salt)
    new_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return hmac.compare_digest(new_hash.hex(), stored)

@router.post("/customer/register")
def register(req: AuthRequest):
    if users.find_one({"email": req.email}):
        raise HTTPException(400, "User already exists")

    # Generate unique 6-digit Customer ID
    while True:
        cust_id = str(random.randint(100000, 999999))
        if not users.find_one({"customer_id": cust_id}):
            break

    salt, hashed = hash_password(req.password)

    users.insert_one({
        "customer_id": cust_id,
        "full_name": req.full_name, # Storing the name
        "email": req.email,
        "password": hashed,
        "salt": salt,
        "role": "customer",
        "created_at": datetime.utcnow().isoformat()
    })

    return {"message": "Registered", "customer_id": cust_id, "full_name": req.full_name}

@router.post("/customer/login")
def login(req: AuthRequest):
    user = users.find_one({"email": req.email, "role": "customer"})

    if not user or not verify_password(req.password, user["salt"], user["password"]):
        raise HTTPException(401, "Invalid credentials")

    # Returning both the ID and the Full Name
    return {
        "message": "Login success", 
        "email": req.email, 
        "customer_id": user.get("customer_id"),
        "full_name": user.get("full_name") 
    }
