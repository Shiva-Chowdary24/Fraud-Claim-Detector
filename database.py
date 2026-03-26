from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["Insurancedb"]

dealers = db["Dealer_Data"]
customers = db["Insurance"]
fraud_logs = db["Fraud_Logs"]
users = db["Users"]
policy_requests = db["Policy_Requests"]
queries = db["Queries"]
notifications = db["Notifications"]
audit_logs = db["Audit_Logs"]
policies=db["Policies"]
issued_policies=db["Issued_Policies"]
queries=db["Queries"]
claim_policies=db["Payouts"]
false_claims=db["Failed_Claims"]
