from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from database import notifications  # Ensure this is your PyMongo collection
from routes import auth, admin, customer, predict, policy, payout,query,dashboard,dealer,custdashboard,chatbot
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["role", "Content-Type", "Authorization"],
    expose_headers=["role"]
)

# Include Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(customer.router)
app.include_router(predict.router)
app.include_router(policy.router)
app.include_router(payout.router)
app.include_router(query.router)
app.include_router(dashboard.router)
app.include_router(dealer.router)
app.include_router(custdashboard.router)
app.include_router(chatbot.router)

class NotificationModel(BaseModel):
    recipient_id: str 
    message: str
    link: str
    status: str

@app.get("/health")
def health():
    return {"status": "ok"}

# --- GLOBAL NOTIFICATION ROUTES ---

@app.post("/notifications/add")
def add_notification(notif: NotificationModel): # ✅ FIXED: Matches class name
    try:
        new_notif = {
            "recipient_id": notif.recipient_id,
            "message": notif.message,
            "link": notif.link,
            "status": notif.status,
            "read": False, 
            "timestamp": datetime.utcnow().isoformat()
        }
        # ✅ FIXED: Using 'notifications' collection directly
        notifications.insert_one(new_notif)
        return {"message": "Notification Sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database failure: {str(e)}")

@app.delete("/{role}/notifications/erase/{notif_id}")
def erase_notification(role: str, notif_id: str):
    try:
        if not ObjectId.is_valid(notif_id):
            raise HTTPException(status_code=400, detail="Invalid ID format")
        result = notifications.delete_one({"_id": ObjectId(notif_id)})
        return {"message": "Notification erased"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/{role}/notifications/clear-all")
def clear_all_notifications(role: str, recipient_id: str):
    try:
        result = notifications.delete_many({"recipient_id": recipient_id})
        return {"message": "Inbox cleared", "count": result.deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to clear inbox")

@app.get("/notifications/get/{recipient_id}")
def get_notifications(recipient_id: str):
    try:
        notifs=list(
            notifications.find({"recipient_id":recipient_id}).sort("timestamp",-1)
        )
        for n in notifs:
            n["_id"]=str(n["_id"])
        return notifs
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@app.post("/notifications/mark-read/{notif_id}")
def mark_as_read(notif_id:str):
    notifications.update_one({"_id":ObjectId(notif_id)},{"$set":{"read":True}})
    return {"status":"success"}
