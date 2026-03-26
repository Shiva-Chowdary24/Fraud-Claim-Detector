from fastapi import APIRouter, HTTPException, Header
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field
from typing import Optional
import traceback

from database import queries, notifications, users, audit_logs

# =====================================================
# ROUTER (SINGLE — DO NOT DUPLICATE)
# =====================================================
router = APIRouter(tags=["Support System"])

print("✅ DEBUG: Support System router loaded")

# =====================================================
# HELPERS
# =====================================================
def now() -> str:
    return datetime.utcnow().isoformat()

def verify_admin(role: Optional[str]):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
def log_admin_action(admin_email: str, action: str, details: str):
    audit_logs.insert_one({
        "admin":admin_email,
        "action":action,
        "details":details,
        "timestamp":datetime.utcnow(),
    })
# =====================================================
# MODELS
# =====================================================
class QueryRequest(BaseModel):
    customer_id: str = Field(..., min_length=1)
    subject: str = Field(..., min_length=1)
    query: str = Field(..., min_length=1)

class ReplyRequest(BaseModel):
    reply: str = Field(..., min_length=1)

# =====================================================
# RESOLVER: GET EMAIL BY CUSTOMER ID
# =====================================================
@router.get("/customer/resolve-email/{customer_id}")
def resolve_email(customer_id: str):
    cid = (customer_id or "").strip()
    if not cid:
        raise HTTPException(status_code=400, detail="customer_id required")

    user = users.find_one({"customer_id": cid})
    if not user or not user.get("email"):
        raise HTTPException(status_code=404, detail="email not found")

    return {"email": user["email"].strip().lower()}

# =====================================================
# 1️⃣ CUSTOMER: SUBMIT QUERY
# =====================================================
@router.post("/query")
def ask_query(data: QueryRequest):
    try:
        cid = data.customer_id.strip()

        # --- USER LOOKUP (OPTIONAL) ---
        user_profile = users.find_one({
            "$or": [
                {"customer_id": cid},
                {"customer_id": int(cid)} if cid.isdigit() else {}
            ]
        })

        if user_profile:
            user_name = (user_profile.get("full_name") or "").strip() or "Unknown User"
            email = (user_profile.get("email") or "").strip().lower()
        else:
            user_name = "Guest User"
            email = "unknown@support.local"

        query_doc = {
            "customer_id": cid,
            "user_name": user_name,
            "email": email,
            "subject": data.subject,
            "query": data.query,
            "status": "Pending",
            "reply": None,
            "timestamp": datetime.utcnow(),
            "resolved_at": None,
        }

        result = queries.insert_one(query_doc)

        # --- ADMIN NOTIFICATION (BEST EFFORT) ---
        try:
            notifications.insert_one({
                "recipient_id": "ADMIN",
                "message": f"New Support Ticket: {data.subject} from {user_name}",
                "type": "new_query",
                "link": "/admin/customer-queries",
                "timestamp": datetime.utcnow(),
                "read": False
            })
        except Exception:
            pass  # notification failure should not block query creation

        return {
            "message": "Query submitted successfully",
            "id": str(result.inserted_id)
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal Server Error")

# =====================================================
# 2️⃣ CUSTOMER: VIEW QUERY HISTORY
# =====================================================
@router.get("/customer/queries/{email}")
def get_customer_history(email: str):
    try:
        email_norm = email.strip().lower()
        print(f"🔍 DEBUG: Fetching queries for {email_norm}")

        results = list(queries.find({"email": email_norm}).sort("timestamp", -1))

        for r in results:
            r["_id"] = str(r["_id"])

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================
# 3️⃣ ADMIN: VIEW PENDING QUERIES
# =====================================================
@router.get("/admin/queries")
def get_all_queries(role: Optional[str] = Header(None)):
    verify_admin(role)

    try:
        results = list(queries.find({"status": "Pending"}).sort("timestamp", 1))
        for r in results:
            r["_id"] = str(r["_id"])
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================
# 4️⃣ ADMIN: REPLY TO QUERY
# =====================================================
@router.post("/admin/reply/{query_id}")

def reply_to_query(

    query_id: str,

    data: ReplyRequest,

    role: Optional[str] = Header(None)

):

    verify_admin(role)

    try:

        if not ObjectId.is_valid(query_id):

            raise HTTPException(status_code=400, detail="Invalid query_id format")

        oid = ObjectId(query_id)

        # 1. Fetch the query FIRST so we have the data for logs/notifications

        original_query = queries.find_one({"_id": oid})

        if not original_query:

            raise HTTPException(status_code=404, detail="Query record not found")

        # 2. Update the status

        queries.update_one(

            {"_id": oid},

            {

                "$set": {

                    "status": "Resolved",

                    "reply": data.reply,

                    "resolved_at": datetime.utcnow(), # Better to store as date object

                }

            }

        )

        # 3. Notify the Customer

        notifications.insert_one({

            "recipient_id": str(original_query.get("customer_id")),

            "message": f"Administrator replied to your query: {original_query.get('subject')}",

            "link": "/customer/support-history",

            "type": "query_reply",

            "timestamp": datetime.utcnow(),

            "read": False

        })

        # 4. Log the Admin Action (The Fix)

        # Ensure 'log_admin_action' is defined at the top of this file or imported correctly

        log_admin_action(

            "admin1@gmail.com", 

            "QUERY_RESOLVED", 

            f"Resolved query for customer {original_query.get('customer_id')}"

        )

        return {"message": "Reply sent and query resolved"}

    except HTTPException as he:

        raise he

    except Exception as e:

        # This will print the EXACT error in your terminal so you can see why it's failing

        print(f"DEBUG ERROR: {str(e)}")

        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
 
