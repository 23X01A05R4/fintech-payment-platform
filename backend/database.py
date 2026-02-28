import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# SQLite Setup (For Users and Invoices)
SQLALCHEMY_DATABASE_URL = "sqlite:///./fintech.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# MongoDB Setup (For Transaction Logs)
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "fintech_logs")

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

mongodb = MongoDB()

async def connect_to_mongo():
    mongodb.client = AsyncIOMotorClient(MONGODB_URL)
    mongodb.db = mongodb.client[MONGODB_DB_NAME]

async def close_mongo_connection():
    if mongodb.client:
        mongodb.client.close()

def get_mongo():
    if mongodb.client is None or mongodb.db is None:
        mongodb.client = AsyncIOMotorClient(MONGODB_URL)
        mongodb.db = mongodb.client[MONGODB_DB_NAME]
    return mongodb.db
