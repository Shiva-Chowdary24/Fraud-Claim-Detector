from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, admin, customer, predict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(customer.router)
app.include_router(predict.router)

@app.get("/health")
def health():
    return {"status": "ok"}
from bson import ObjectId

@app.delete("/{role}/notifications/erase/{notif_id}")
def erase_notification(role: str, notif_id: str):
    try:
        result = notifications.delete_one({"_id": ObjectId(notif_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"message": "Notification erased"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
