from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models, security
from database import get_db, get_mongo
import random
import time
import uuid
from datetime import datetime

router = APIRouter()

class PaymentRequest(BaseModel):
    invoice_id: int

@router.post("/pay")
async def process_payment(
    request: PaymentRequest, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_active_user)
):
    mongo_db = get_mongo()
    logs_collection = mongo_db["transaction_logs"]
    
    # Validation
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == request.invoice_id,
        models.Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    if invoice.status == models.PaymentStatus.paid:
        raise HTTPException(status_code=400, detail="Invoice is already paid. Duplicate payment prevented.")
        
    if invoice.retry_count >= 3:
        raise HTTPException(status_code=403, detail="Maximum retry limit reached. Please contact support.")

    # Fraud Rule Check (3 attempts in 1 min globally for this user)
    one_min_ago = time.time() - 60
    recent_attempts = await logs_collection.count_documents({
        "user_id": current_user.id,
        "timestamp_unix": {"$gte": one_min_ago}
    })
    
    if recent_attempts >= 3:
        pass # We will log the flag in the response metadata

    # Process Payment Attempt
    transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
    invoice.retry_count += 1
    
    # Simulate Real-World Gateway Response
    rand = random.random()
    if rand < 0.4:  # 40% Success
        status_result = "Success"
        reason = "Processed Successfully"
        invoice.status = models.PaymentStatus.paid
    elif rand < 0.7:  # 30% Failure
        status_result = "Failed"
        reason = "Gateway Declined / Insufficient Funds"
        invoice.status = models.PaymentStatus.failed
    else:  # 30% Timeout
        status_result = "Failed"
        reason = "Bank Network Timeout"
        invoice.status = models.PaymentStatus.failed
        
    db.commit()
    db.refresh(invoice)
    
    # Store Cloud Audit Log in MongoDB
    log_entry = {
        "invoice_id": invoice.id,
        "user_id": current_user.id,
        "transaction_id": transaction_id,
        "attempt": invoice.retry_count,
        "amount": invoice.amount,
        "status": status_result,
        "reason": reason,
        "timestamp_unix": time.time(),
        "timestamp_iso": datetime.utcnow().isoformat()
    }
    await logs_collection.insert_one(log_entry)
    
    return {
        "transaction_id": transaction_id,
        "status": status_result,
        "reason": reason,
        "invoice": {
            "id": invoice.id,
            "status": invoice.status,
            "retry_count": invoice.retry_count
        },
        "fraud_flag": recent_attempts >= 3
    }
