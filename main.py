# from fastapi import FastAPI, HTTPException, status
# from fastapi.middleware.cors import CORSMiddleware
# import joblib, json, pandas as pd
# from datetime import datetime
# from pymongo import MongoClient
# from pymongo.collection import Collection

# from features import engineer_features, apply_te_from_state
# from reason_codes import reason_codes

# app = FastAPI(title="Insurance Fraud Detector", version="1.0")

# # ---------------- CORS ----------------
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ---------------- LOAD ARTIFACTS ----------------
# BUNDLE = joblib.load("artifacts/model.joblib")
# THRESHOLD = json.load(open("artifacts/threshold.json"))
# TE_STATE = BUNDLE["te_state"]

# # ---------------- MONGO CONNECTION ----------------
# # NOTE: Your URI has a default DB of "Insurancedb", but below we explicitly use "fraud_detection".
# # This is OK; the explicit db("fraud_detection") will be used. The prints below will confirm it.
# MONGO_URI = "mongodb://localhost:27017/Insurancedb"
# client = MongoClient(MONGO_URI)
# db = client["fraud_detection"]

# fraud_logs: Collection = db["Fraud_logs"]         # fraud logs collection
# dealers: Collection = db["Dealer_Data"]           # dealer dataset
# customers: Collection = db["Insurance"]           # customer dataset (not used in delete anymore)

# # --- Helpful startup debug prints ---
# print("[STARTUP] Mongo URI        :", MONGO_URI)
# try:
#     # client.address returns a tuple (host, port) once connected lazily on first op.
#     # We'll force a quick ping so address is populated.
#     client.admin.command("ping")
#     print("[STARTUP] Mongo address    :", client.address)  # (host, port)
# except Exception as e:
#     print("[STARTUP][ERROR] Mongo ping failed:", repr(e))

# print("[STARTUP] Using database    :", db.name)
# print("[STARTUP] Collections       :", db.list_collection_names())
# try:
#     print("[STARTUP] Dealer_Data count:", dealers.estimated_document_count())
#     print("[STARTUP] Fraud_logs count :", fraud_logs.estimated_document_count())
#     print("[STARTUP] Insurance count  :", customers.estimated_document_count())
# except Exception as e:
#     print("[STARTUP][WARN] Could not count collections:", repr(e))


# # ---------------- API ENDPOINT ----------------
# @app.post("/predict")
# def predict(data: dict):
#     df = pd.DataFrame([data])

#     # Feature engineering
#     df_eng = engineer_features(df)

#     # Apply TE from saved state
#     df_te = apply_te_from_state(df_eng, TE_STATE)

#     # Ensure all required model features exist
#     for col in BUNDLE["features"]:
#         if col not in df_te.columns:
#             df_te[col] = None

#     # Impute + Predict
#     X_imp = BUNDLE["imputer"].transform(df_te[BUNDLE["features"]])
#     proba = BUNDLE["model"].predict_proba(X_imp)[0][1]

#     pred = int(proba >= THRESHOLD["threshold"])
#     reasons_list = reason_codes(df_eng.iloc[0])
#     reasons_sentence = "; ".join(reasons_list)

#     # Extract Policy_id from input
#     policy_id = data.get("Policy_id", "UNKNOWN")

#     # Log fraud into MongoDB
#     if pred == 1:
#         fraud_doc = {
#             "timestamp": str(datetime.utcnow()),
#             "Policy_id": policy_id,
#             "probability": float(proba),
#             "reasons": reasons_sentence
#         }
#         print("[PREDICT] Inserting fraud log:", fraud_doc)
#         fraud_logs.insert_one(fraud_doc)

#     return {
#         "fraud_prediction": pred,
#         "fraud_probability": float(proba),
#         "Policy_id": policy_id,
#         "reason_codes": reasons_sentence
#     }


# # ---------------- DEALER LOG ENDPOINT ----------------
# @app.get("/dealer/logs")
# def dealer_logs():
#     logs = list(fraud_logs.find({}, {"_id": 0}))  # exclude MongoDB _id
#     print(f"[LOGS] Returning {len(logs)} fraud log entries")
#     return logs


# # ---------------- POLICY DATASET ENDPOINT ----------------
# @app.post("/dealer/add")
# def add_policy(data: dict):
#     """
#     Add a new dealer record into MongoDB dealers collection.
#     Expected keys: Policy, Policy status, Broker Dealer, Issue date, Contribution
#     """
#     print("[ADD] New dealer payload:", data)
#     result = dealers.insert_one(data)
#     print("[ADD] Inserted dealer _id:", result.inserted_id)
#     return {
#         "message": "Dealer record added successfully",
#         "new_record": data
#     }


# # ---------------- DELETE POLICY ENDPOINT (Dealer only) ----------------
# @app.delete("/dealer/delete/{policy_id}", status_code=status.HTTP_200_OK)
# def delete_dealer(policy_id: str):
#     """
#     Delete ONLY the dealer record by Policy from Dealer_Data.
#     Returns 404 if the dealer does not exist.
#     """
#     print("------------------------------------------------------------")
#     print("[DELETE] Request received for Policy:", repr(policy_id))
#     print("[DELETE] DB:", db.name, "| Collection:", dealers.name)
#     print("[DELETE] Connection address:", client.address)

#     # 1) Verify the dealer exists using an exact match on the field name
#     dealer = dealers.find_one({"Policy": policy_id})
#     print("[DELETE] Pre-check find_one({'Policy': policy_id}) ->", dealer)

#     if not dealer:
#         # Try a relaxed check to help diagnose whitespace/case issues:
#         relaxed = dealers.find_one({
#             "Policy": {
#                 "$regex": f"^{policy_id}$",
#                 "$options": "i"   # case-insensitive
#             }
#         })
#         print("[DELETE][DIAG] Relaxed match (case-insensitive) ->", relaxed)

#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail=f"Dealer {policy_id} not found"
#         )

#     # 2) Delete the dealer and check the result
#     delete_filter = {"Policy": policy_id}
#     print("[DELETE] delete_one filter:", delete_filter)

#     dealer_result = dealers.delete_one(delete_filter)
#     print("[DELETE] delete_one -> deleted_count:", dealer_result.deleted_count)

#     if dealer_result.deleted_count == 0:
#         # A race condition or a mismatch in field/collation would land here
#         # We log a diagnostic attempt using case-insensitive collation (if server supports it).
#         try:
#             diag_result = dealers.delete_one(
#                 {"Policy": policy_id},
#                 collation={"locale": "en", "strength": 2}  # case-insensitive equality
#             )
#             print("[DELETE][DIAG] Collation delete attempt -> deleted_count:", diag_result.deleted_count)
#         except Exception as e:
#             print("[DELETE][DIAG] Collation delete attempt failed:", repr(e))

#         raise HTTPException(
#             status_code=status.HTTP_409_CONFLICT,
#             detail=f"Dealer {policy_id} could not be deleted (possible concurrent update or collation mismatch)"
#         )

#     # 3) Post-delete verification
#     verify = dealers.find_one({"Policy": policy_id})
#     print("[DELETE] Post-delete verification (should be None) ->", verify)

#     return {
#         "message": f"Dealer {policy_id} deleted successfully",
#         "deleted": {"dealer": dealer_result.deleted_count}
#     }
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# import joblib, json, os, pandas as pd
# from datetime import datetime

# from features import engineer_features, apply_te_from_state
# from reason_codes import reason_codes

# app = FastAPI(title="Insurance Fraud Detector API", version="1.0")

# # CORS for React
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],   
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ---------------- LOAD ARTIFACTS ----------------
# BUNDLE = joblib.load("artifacts/model.joblib")
# THRESHOLD = json.load(open("artifacts/threshold.json"))
# TE_STATE = BUNDLE["te_state"]


# # ---------------- API ENDPOINT ----------------
# # ---------------- FRAUD LOG ----------------
# def save_log(entry: dict):
#     os.makedirs("logs", exist_ok=True)
#     file = "logs/fraud_logs.csv"

#     write_header = not os.path.exists(file)

#     import csv
#     with open(file, "a", newline="") as f:
#         w = csv.writer(f)
#         if write_header:
#             # Add Policy_id column to header
#             w.writerow(["timestamp", "Policy_id", "probability", "reasons"])
#         w.writerow([
#             entry["timestamp"],
#             entry["policy_id"],   
#             entry["proba"],
#             entry["reasons"]
#         ])


# # ---------------- API ENDPOINT ----------------
# @app.post("/predict")
# def predict(data: dict):

#     df = pd.DataFrame([data])

#     # Feature engineering
#     df_eng = engineer_features(df)

#     # Apply TE from saved state
#     df_te = apply_te_from_state(df_eng, TE_STATE)

#     # Ensure all required model features exist
#     for col in BUNDLE["features"]:
#         if col not in df_te.columns:
#             df_te[col] = None

#     # Impute + Predict
#     X_imp = BUNDLE["imputer"].transform(df_te[BUNDLE["features"]])
#     proba = BUNDLE["model"].predict_proba(X_imp)[0][1]

#     pred = int(proba >= THRESHOLD["threshold"])
#     reasons_list = reason_codes(df_eng.iloc[0])

#     # Convert list of reasons into a sentence string
#     reasons_sentence = "; ".join(reasons_list)

#     # Extract Policy_id from input
#     policy_id = data.get("Policy_id", "UNKNOWN")

#     # Log fraud
#     if pred == 1:
#         save_log({
#             "timestamp": str(datetime.utcnow()),
#             "policy_id": policy_id,
#             "proba": float(proba),
#             "reasons": reasons_sentence
#         })

#     return {
#         "fraud_prediction": pred,
#         "fraud_probability": float(proba),
#         "Policy_id": policy_id,   #  return Policy_id in response
#         "reason_codes": reasons_sentence
#     }

# # ---------------- DEALER LOG ENDPOINT ----------------
# @app.get("/dealer/logs")
# def dealer_logs():
#     file = "logs/fraud_logs.csv"
#     if not os.path.exists(file):
#         return []
#     df = pd.read_csv(file)
#     return df.to_dict(orient="records")

# # ---------------- POLICY DATASET ENDPOINT ----------------
# @app.post("/dealer/add")
# def add_policy(data: dict):
#     """
#     Add a new dealer record into policy_dataset.csv
#     Expected keys: policy, policy status, Brooker Dealer, Issue date, Contribution
#     """

#     os.makedirs("datasets", exist_ok=True)
#     file = "C:/Users/manda.shiva/Downloads/fraud_detect/fraud_detect/policy_dataset.csv"

#     df_new = pd.DataFrame([data])

#     if os.path.exists(file):
#         df_existing = pd.read_csv(file)
#         df_combined = pd.concat([df_existing, df_new], ignore_index=True)
#     else:
#         df_combined = df_new

#     #Reset index before saving to avoid gaps
#     df_combined.reset_index(drop=True, inplace=True)

#     df_combined.to_csv(file, index=False)

#     return {
#         "message": "Dealer record added successfully",
#         "new_record": data
#     }

#     # ---------------- DELETE POLICY ENDPOINT ----------------
# @app.delete("/dealer/delete/{policy_id}")
# def delete_dealer(policy_id: str):
#     """
#     Delete a dealer record from policy_dataset.csv by Policy ID.
#     Also delete all customers linked to that dealer via Policy.
#     """

#     dealer_file = "C:/Users/manda.shiva/Downloads/fraud_detect/fraud_detect/policy_dataset.csv"
#     customer_file = "C:/Users/manda.shiva/Downloads/fraud_detect/fraud_detect/customer_dataset.csv"

#     if not os.path.exists(dealer_file):
#         return {"error": "Dealer dataset not found"}

#     # Load dealer dataset
#     df_dealer = pd.read_csv(dealer_file)

#     # Normalize column names (strip spaces, lower-case)
#     df_dealer.columns = df_dealer.columns.str.strip()
#     if "Policy" not in df_dealer.columns:
#         return {"error": "Dealer dataset missing 'Policy' column"}

#     # Ensure Policy values are strings for comparison
#     df_dealer["Policy"] = df_dealer["Policy"].astype(str)

#     # Check if dealer exists
#     if str(policy_id) not in df_dealer["Policy"].values:
#         return {"error": f"Dealer {policy_id} not found"}

#     # Drop dealer row(s)
#     df_dealer = df_dealer[df_dealer["Policy"] != str(policy_id)]
#     df_dealer.reset_index(drop=True, inplace=True)
#     df_dealer.to_csv(dealer_file, index=False)

#     # ✅ Cascade delete customers linked to this dealer
#     if os.path.exists(customer_file):
#         df_customer = pd.read_csv(customer_file)
#         df_customer.columns = df_customer.columns.str.strip()

#         if "Policy" not in df_customer.columns:
#             return {"error": "Customer dataset missing 'Policy' column"}

#         df_customer["Policy"] = df_customer["Policy"].astype(str)

#         # Drop customers whose Policy matches the deleted dealer
#         df_customer = df_customer[df_customer["Policy"] != str(policy_id)]
#         df_customer.reset_index(drop=True, inplace=True)
#         df_customer.to_csv(customer_file, index=False)

#     return {
#         "message": f"Dealer {policy_id} and linked customers deleted successfully"
#     }
# main.py
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import joblib
import json
import pandas as pd
from datetime import datetime
from pymongo import MongoClient
from pymongo.collection import Collection
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from fastapi.encoders import jsonable_encoder

# -------------------- APP --------------------
app = FastAPI(title="Insurance Fraud Detector", version="1.0")

# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- ARTIFACTS --------------------
# These loads will raise if files are missing—intentional for visibility.
print("[STARTUP] Loading model artifacts...")
BUNDLE = joblib.load("artifacts/model.joblib")
THRESHOLD = json.load(open("artifacts/threshold.json"))
TE_STATE = BUNDLE["te_state"]
print("[STARTUP] Artifacts loaded. Features:", BUNDLE.get("features"))

# -------------------- MONGO CONNECTION --------------------
# DB NAME AND COLLECTIONS (as per your structure)
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "Insurancedb"  # <-- IMPORTANT: exact DB name you provided

print("[STARTUP] Connecting to MongoDB...")
client = MongoClient(MONGO_URI)

# Force connect and ping so client.address is populated for diagnostics
try:
    client.admin.command("ping")
    print("[STARTUP] Mongo connected. Address:", client.address)
except Exception as e:
    print("[STARTUP][ERROR] Mongo ping failed:", repr(e))

db = client[DB_NAME]

# Collections (exact names)
dealers: Collection = db["Dealer_Data"]     # Dealers
customers: Collection = db["Insurance"]     # Customers
fraud_logs: Collection = db["Fraud_Logs"]   # Fraud claims

# Helpful startup prints
try:
    print("[STARTUP] Using database       :", db.name)
    print("[STARTUP] Collections available:", db.list_collection_names())
    print("[STARTUP] Dealer_Data count    :", dealers.estimated_document_count())
    print("[STARTUP] Insurance count      :", customers.estimated_document_count())
    print("[STARTUP] Fraud_Logs count     :", fraud_logs.estimated_document_count())
except Exception as e:
    print("[STARTUP][WARN] Could not enumerate counts:", repr(e))


# -------------------- HELPERS --------------------
def now_utc_iso() -> str:
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"


# -------------------- ENDPOINTS --------------------

@app.post("/predict")
def predict(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run fraud prediction on a single payload. If predicted fraud (1),
    insert a record into Fraud_Logs.
    """
    print("------------------------------------------------------------")
    print("[PREDICT] Received payload:", data)

    df = pd.DataFrame([data])

    # Feature engineering
    from features import engineer_features, apply_te_from_state
    df_eng = engineer_features(df)

    # Apply target encoding state
    df_te = apply_te_from_state(df_eng, TE_STATE)

    # Ensure model features exist
    required_feats = BUNDLE["features"]
    for col in required_feats:
        if col not in df_te.columns:
            df_te[col] = None

    # Impute + Predict
    X_imp = BUNDLE["imputer"].transform(df_te[required_feats])
    proba = float(BUNDLE["model"].predict_proba(X_imp)[0][1])

    threshold = float(THRESHOLD["threshold"])
    pred = int(proba >= threshold)

    # Reason codes (your custom logic)
    from reason_codes import reason_codes
    reasons_list = reason_codes(df_eng.iloc[0])
    reasons_sentence = "; ".join(reasons_list)

    policy_id = data.get("Policy_id", "UNKNOWN")

    print(f"[PREDICT] proba={proba:.6f} threshold={threshold:.6f} pred={pred} policy={policy_id}")
    if pred == 1:
        fraud_doc = {
            "timestamp": now_utc_iso(),
            "Policy_id": policy_id,
            "probability": proba,
            "reasons": reasons_sentence,
        }
        res = fraud_logs.insert_one(fraud_doc)
        print("[PREDICT] Fraud logged _id:", res.inserted_id)

    return {
        "fraud_prediction": pred,
        "fraud_probability": proba,
        "Policy_id": policy_id,
        "reason_codes": reasons_sentence,
    }




@app.post("/dealer/add", status_code=status.HTTP_201_CREATED)
def add_policy(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Add a new dealer document into Dealer_Data.
    Expected keys typically include: Policy, Policy Status, Broker Dealer, Issue date, Contribution.
    """
    print("------------------------------------------------------------")
    print("[ADD] New dealer payload:", data)

    # Minimal validation
    policy = data.get("Policy")
    if not policy:
        # NOTE: If you accidentally send "Policy_id" instead of "Policy", you'll hit this 400.
        print("[ADD][ERROR] Missing field 'Policy' in payload")
        raise HTTPException(status_code=400, detail="Field 'Policy' is required")

    # Clone input to avoid returning an ObjectId in response (PyMongo mutates the dict)
    doc = dict(data)  # or copy.deepcopy(data)

    try:
        result = dealers.insert_one(doc)  # this mutates `doc` and adds `_id: ObjectId(...)`
        print("[ADD] Inserted dealer _id:", result.inserted_id)
    except DuplicateKeyError:
        # Only meaningful if you create a unique index on Policy:
        # dealers.create_index("Policy", unique=True)
        print("[ADD][ERROR] Duplicate 'Policy' value:", policy)
        raise HTTPException(
            status_code=409,
            detail=f"Dealer with Policy '{policy}' already exists"
        )

    # Build a clean, JSON-serializable record for the response
    # `doc` now has `_id` (ObjectId) -> convert to str
    new_record = {**doc}
    if "_id" in new_record and isinstance(new_record["_id"], ObjectId):
        new_record["_id"] = str(new_record["_id"])

    # Alternatively: jsonable_encoder(..., custom_encoder={ObjectId: str})
    # return jsonable_encoder(
    #     {"message": "Dealer record added successfully", "new_record": doc, "inserted_id": result.inserted_id},
    #     custom_encoder={ObjectId: str}
    # )

    return {
        "message": "Dealer record added successfully",
        "new_record": new_record,
        "inserted_id": str(result.inserted_id),
    }


@app.delete("/dealer/delete/{policy_id}", status_code=status.HTTP_200_OK)
def delete_dealer(policy_id: str) -> Dict[str, Any]:
    """
    Delete ONLY the dealer record by Policy from Dealer_Data.
    Returns 404 if the dealer does not exist.
    """
    print("------------------------------------------------------------")
    print("[DELETE] Request for Policy:", repr(policy_id))
    print("[DELETE] DB:", db.name, "| Collection:", dealers.name, "| Address:", client.address)

    # 1) Exact match pre-check
    dealer = dealers.find_one({"Policy": policy_id})
    print("[DELETE] Pre-check exact find_one ->", dealer)

    if not dealer:
        # Diagnostic: try relaxed (case-insensitive) check to detect formatting issues
        relaxed = dealers.find_one({"Policy": {"$regex": f"^{policy_id}$", "$options": "i"}})
        print("[DELETE][DIAG] Relaxed (case-insensitive) match ->", relaxed)
        raise HTTPException(status_code=404, detail=f"Dealer {policy_id} not found")

    # 2) Perform delete and verify
    delete_filter = {"Policy": policy_id}
    print("[DELETE] delete_one filter:", delete_filter)

    result = dealers.delete_one(delete_filter)
    print("[DELETE] delete_one -> deleted_count:", result.deleted_count)

    if result.deleted_count == 0:
        # Race condition or data formatting/collation issue
        # Log a diagnostic attempt with collation (case-insensitive)
        try:
            diag = dealers.delete_one(
                {"Policy": policy_id},
                collation={"locale": "en", "strength": 2}
            )
            print("[DELETE][DIAG] Collation delete attempt -> deleted_count:", diag.deleted_count)
        except Exception as e:
            print("[DELETE][DIAG] Collation attempt failed:", repr(e))

        raise HTTPException(
            status_code=409,
            detail=f"Dealer {policy_id} could not be deleted (possible concurrent update or collation mismatch)",
        )

    # 3) Post-delete verification
    verify = dealers.find_one({"Policy": policy_id})
    print("[DELETE] Post-delete verification (should be None) ->", verify)

    return {
        "message": f"Dealer {policy_id} deleted successfully",
        "deleted": {"dealer": result.deleted_count},
    }


@app.get("/dealer/logs")
def dealer_logs() -> List[Dict[str, Any]]:
    """
    Return all fraud logs from Fraud_Logs (excluding _id).
    """
    print("------------------------------------------------------------")
    print("[LOGS] Fetching fraud logs from:", db.name, ".", fraud_logs.name)
    logs = list(fraud_logs.find({}, {"_id": 0}))
    print(f"[LOGS] Returned {len(logs)} entries")
    return logs


# (Optional) quick health check
@app.get("/health")
def health():
    try:
        client.admin.command("ping")
        return {"status": "ok", "db": db.name, "address": client.address}
    except Exception as e:
        return {"status": "error", "detail": repr(e)}