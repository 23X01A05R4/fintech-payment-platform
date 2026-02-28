from fastapi import APIRouter, Depends
from typing import List
import models, security
from database import get_mongo

router = APIRouter()

@router.get("/transactions")
async def get_all_transactions(current_admin: models.User = Depends(security.get_current_admin_user)):
    mongo_db = get_mongo()
    logs_collection = mongo_db["transaction_logs"]
    
    cursor = logs_collection.find().sort("timestamp_unix", -1).limit(100)
    transactions = await cursor.to_list(length=100)
    
    # Need to convert ObjectId to string for JSON serialization
    for txn in transactions:
        txn["_id"] = str(txn["_id"])
        
    return transactions
