from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os, hashlib, hmac
from database import users

router = APIRouter(tags=["Auth"])

class Auth(BaseModel):
    email: str
    password: str

def hash_password(password):
    salt = os.urandom(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return salt.hex(), hashed.hex()

def verify_password(password, salt, stored):
    salt = bytes.fromhex(salt)
    new_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return hmac.compare_digest(new_hash.hex(), stored)

@router.post("/customer/register")
def register(req: Auth):
    if users.find_one({"email": req.email}):
        raise HTTPException(400, "User exists")

    salt, hashed = hash_password(req.password)

    users.insert_one({
        "email": req.email,
        "password": hashed,
        "salt": salt,
        "role": "customer"
    })

    return {"message": "Registered"}

@router.post("/customer/login")
def login(req: Auth):
    user = users.find_one({"email": req.email, "role": "customer"})

    if not user or not verify_password(req.password, user["salt"], user["password"]):
        raise HTTPException(401, "Invalid")

    return {"message": "Login success", "email": req.email}

@router.post("/admin/login")
def admin_login(req: Auth):
    user = users.find_one({"email": req.email, "role": "admin"})

    if not user or not verify_password(req.password, user["salt"], user["password"]):
        raise HTTPException(401, "Invalid")

    return {"message": "Admin login success"}
