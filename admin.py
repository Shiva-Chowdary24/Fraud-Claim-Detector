from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from database import notifications  
from routes import auth, admin, customer, predict,policy
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["role","Content-Type","Authorization"],
    expose_headers=["role"]
)

# Include Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(customer.router)
app.include_router(predict.router)
app.include_router(policy.router)

@app.get("/health")
def health():
    return {"status": "ok"}

# --- GLOBAL NOTIFICATION ROUTES ---

# 1. Erase a single notification by ID
@app.delete("/{role}/notifications/erase/{notif_id}")
def erase_notification(role: str, notif_id: str):
    try:
        # Check if the ID is a valid MongoDB ObjectId
        if not ObjectId.is_valid(notif_id):
            raise HTTPException(status_code=400, detail="Invalid Notification ID format")

        result = notifications.delete_one({"_id": ObjectId(notif_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Notification already erased or not found")
            
        return {"message": "Notification erased"}
    except Exception as e:
        print(f"Delete Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# 2. Clear all notifications for a specific user or the Admin
@app.delete("/{role}/notifications/clear-all")
def clear_all_notifications(role: str, recipient_id: str):
    try:
        # This wipes every notification matching the ID (e.g., "ADMIN" or "123456")
        result = notifications.delete_many({"recipient_id": recipient_id})
        
        return {
            "message": f"Cleared {result.deleted_count} notifications",
            "count": result.deleted_count
        }
    except Exception as e:
        print(f"Clear All Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear inbox")
class Notification(BaseModel):
    recipient_email: str
    message: str
    link: str
    status: str

# 2. Use the model in the route
@app.post("/notifications/add")
async def add_notification(notif: Notification):  # <--- MUST HAVE ': Notification'
    try:
        # Your logic to save to MongoDB:
        # await db.notifications.insert_one(notif.dict())
        return {"message": "Notification stored"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
