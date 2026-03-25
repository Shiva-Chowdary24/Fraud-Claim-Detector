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
        cursor = notifications.find({"recipient_id": recipient_id}).sort("_id", -1).limit(20)
        results = []
        for doc in list(cursor):
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))s
