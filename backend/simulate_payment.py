import asyncio
from database import connect_to_mongo, close_mongo_connection, get_mongo
from datetime import datetime
import time

async def insert_test_log():
    await connect_to_mongo()
    db = get_mongo()
    collection = db["transaction_logs"]
    
    test_log = {
        "invoice_id": 999,
        "user_id": 1,
        "transaction_id": "TXN-TEST1234",
        "attempt": 1,
        "amount": 250.00,
        "status": "Success",
        "reason": "Test Transaction from Script",
        "timestamp_unix": time.time(),
        "timestamp_iso": datetime.utcnow().isoformat()
    }
    
    await collection.insert_one(test_log)
    print("Test log successfully inserted into MongoDB Atlas!")
    await close_mongo_connection()

asyncio.run(insert_test_log())
