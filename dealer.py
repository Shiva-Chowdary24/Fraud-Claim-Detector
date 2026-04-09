from fastapi import APIRouter, HTTPException, Body, Query
from bson import ObjectId
from typing import Dict, Any
# Import your 'dealers' collection from your database config file
from database import dealers
# We define the router here
router = APIRouter()
def dealer_helper(dealer) -> dict:
   return {
       "id": str(dealer["_id"]),
       "Policy": dealer.get("Policy"),
       "Policy Status": dealer.get("Policy Status"),
       "Broker Dealer": dealer.get("Broker Dealer"),
       "Issue date": dealer.get("Issue date"),
       "Contribution": dealer.get("Contribution"),
   }
# --- 1. SEARCH (Used by Frontend handleSearch) ---
# Endpoint: GET /dealers/search?policy=...
@router.get("/dealers/search", response_model=dict)
def search_by_policy(policy: str = Query(...)):
   dealer = dealers.find_one({"Policy": policy})
   if dealer:
       return dealer_helper(dealer)
   raise HTTPException(status_code=404, detail="Policy not found")
# --- 2. UPDATE (Used by Frontend handleUpdate) ---
# Endpoint: PUT /dealers/{id}
@router.put("/dealers/{id}")
def update_dealer(id: str, data: dict = Body(...)):
   if not ObjectId.is_valid(id):
       raise HTTPException(status_code=400, detail="Invalid ID")
   # We use $set so we don't overwrite the whole document
   result = dealers.update_one({"_id": ObjectId(id)}, {"$set": data})
   if result.matched_count == 0:
       raise HTTPException(status_code=404, detail="Dealer not found")
   return {"message": "Update successful"}
# --- 3. ADD (Your existing method) ---
# Endpoint: POST /admin/dealer/add
@router.post("/admin/dealer/add", response_model=dict)
def create_dealer(dealer: dict = Body(...)):
   result = dealers.insert_one(dealer)
   created = dealers.find_one({"_id": result.inserted_id})
   return dealer_helper(created)

@router.delete("/admin/dealer/delete/{policy_id}")
def delete_dealer(policy_id: str):
    res = dealers.delete_one({"Policy": policy_id})

    if res.deleted_count == 1:
        return {"message": "Dealer deleted successfully"}

    raise HTTPException(status_code=404, detail="Dealer not found")
