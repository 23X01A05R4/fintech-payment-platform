from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel
import models, security
from database import get_db

router = APIRouter()

class InvoiceCreate(BaseModel):
    amount: float

class InvoiceResponse(BaseModel):
    id: int
    amount: float
    status: models.PaymentStatus
    retry_count: int
    created_at: datetime

    class Config:
        orm_mode = True

@router.get("/", response_model=List[InvoiceResponse])
def get_my_invoices(db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_active_user)):
    invoices = db.query(models.Invoice).filter(models.Invoice.user_id == current_user.id).all()
    return invoices

@router.post("/", response_model=InvoiceResponse)
def create_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_active_user)):
    new_invoice = models.Invoice(
        user_id=current_user.id,
        amount=invoice.amount,
        status=models.PaymentStatus.pending
    )
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    return new_invoice
