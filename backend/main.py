from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, connect_to_mongo, close_mongo_connection
import models
import routers.auth
import routers.invoices
import routers.payments
import routers.admin

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fintech Payment Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_event_handler("startup", connect_to_mongo)
app.add_event_handler("shutdown", close_mongo_connection)

app.include_router(routers.auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(routers.invoices.router, prefix="/api/invoices", tags=["Invoices"])
app.include_router(routers.payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(routers.admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
def read_root():
    return {"message": "Fintech API is running on SQLite users & MongoDB logs"}
