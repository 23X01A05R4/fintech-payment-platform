import traceback
from database import SessionLocal
import models
import security
from routers.auth import UserCreate, register

db = SessionLocal()
user = UserCreate(name='test', email='t@t.com', password='pwd')
try:
    res = register(user=user, db=db)
    print("Success:", res)
except Exception as e:
    print(traceback.format_exc())
