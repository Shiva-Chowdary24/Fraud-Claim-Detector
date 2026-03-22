from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
# Assuming 'notifications' is your MongoDB collection object from database.py
from database import notifications  

app = FastAPI()

# ✅ UPDATED CORS: Added 'recipient_id' to headers if you use it for auth
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["role", "Content-Type", "Authorization"],
    expose_headers=["role"]
)

# --- MODELS ---

class NotificationModel(BaseModel):
    recipient_id: str  # Changed from recipient_email to match your Frontend 'Clear All' logic
    message: str
    link: str
    status: str

# --- ROUTES ---

# 1. Add Notification (The Sender)
@app.post("/notifications/add")
async def add_notification(notif: NotificationModel):
    try:
        # ✅ FIX: Actually insert into MongoDB
        new_notif = notif.dict()
        new_notif["timestamp"] = datetime.utcnow().isoformat() # ISO format for JS compatibility
        
        result = notifications.insert_one(new_notif)
        
        return {"message": "Notification stored", "id": str(result.inserted_id)}
    except Exception as e:
        print(f"Insert Error: {e}")
        raise HTTPException(status_code=500, detail="Database failure")

# 2. Erase a single notification (The 'Click to Action')
@app.delete("/{role}/notifications/erase/{notif_id}")
def erase_notification(role: str, notif_id: str):
    try:
        if not ObjectId.is_valid(notif_id):
            raise HTTPException(status_code=400, detail="Invalid ID format")

        result = notifications.delete_one({"_id": ObjectId(notif_id)})
        
        if result.deleted_count == 0:
            return {"message": "Already erased"} # Avoid 404 to prevent frontend crashes
            
        return {"message": "Notification erased"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Clear all (The 'Trash' icon)
@app.delete("/{role}/notifications/clear-all")
def clear_all_notifications(role: str, recipient_id: str):
    try:
        # ✅ SYNC: This now matches the recipient_id key used in /add
        result = notifications.delete_many({"recipient_id": recipient_id})
        return {"message": "Inbox cleared", "count": result.deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to clear inbox")

# 4. Fetch Notifications (The 'Bell' icon needs this!)
@app.get("/notifications/get/{recipient_id}")
async def get_notifications(recipient_id: str):
    try:
        # Fetch last 20 notifications
        cursor = notifications.find({"recipient_id": recipient_id}).sort("_id", -1).limit(20)
        results = []
        for doc in await cursor.to_list(length=20): # Use await if using Motor
            doc["_id"] = str(doc["_id"]) # Convert ObjectId to string for JSON
            results.append(doc)
        return results
    except Exception as e:
        # Fallback if your database object is not async
        cursor = notifications.find({"recipient_id": recipient_id}).sort("_id", -1).limit(20)
        results = []
        for doc in list(cursor):
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results
