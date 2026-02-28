import asyncio
from database import SessionLocal, connect_to_mongo, close_mongo_connection
import models
from routers.payments import process_payment, PaymentRequest
import traceback

async def debug():
    await connect_to_mongo()
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email=='nanipallapu124@gmail.com').first()
        if not user:
            print('User not found')
            return
            
        print(f"Testing for user {user.email} (ID: {user.id})")
        
        # Test finding invoice
        invoice = db.query(models.Invoice).filter(models.Invoice.user_id==user.id).first()
        if not invoice:
            print("No invoices found for this user. Creating one...")
            invoice = models.Invoice(user_id=user.id, amount=123.00, status=models.PaymentStatus.pending)
            db.add(invoice)
            db.commit()
            db.refresh(invoice)
            
        print(f"Testing invoice ID: {invoice.id}")
        
        req = PaymentRequest(invoice_id=invoice.id)
        res = await process_payment(request=req, db=db, current_user=user)
        print("Success:", res)
    except Exception as e:
        print(traceback.format_exc())
    finally:
        await close_mongo_connection()

asyncio.run(debug())
