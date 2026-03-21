import random
from fastapi import APIRouter, HTTPException
from database import customers # Ensure this is in your database.py

router = APIRouter()

@router.post("/signup")
def signup(user_data: dict):
    # 1. Check if email already exists
    if customers.find_one({"email": user_data["email"]}):
        raise HTTPException(400, "Email already registered")

    # 2. Generate a unique 6-digit Customer ID
    while True:
        # Generates a number between 100,000 and 999,999
        new_cust_id = str(random.randint(100000, 999999))
        # Check database to ensure no other user has this ID
        if not customers.find_one({"customer_id": new_cust_id}):
            break
            
    # 3. Attach ID to user data
    user_data["customer_id"] = new_cust_id
    user_data["created_at"] = datetime.utcnow().isoformat()
    
    # 4. Save to MongoDB
    customers.insert_one(user_data)
    
    return {
        "message": "User created successfully", 
        "customer_id": new_cust_id,
        "email": user_data["email"]
    }
  
