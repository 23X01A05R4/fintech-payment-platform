import asyncio
from database import connect_to_mongo, close_mongo_connection, get_mongo

async def test_mongo():
    try:
        await connect_to_mongo()
        db = get_mongo()
        collections = await db.list_collection_names()
        print('Connection Successful! Collections available:', collections)
    except Exception as e:
        print('Connection Failed:', str(e))
    finally:
        await close_mongo_connection()

asyncio.run(test_mongo())
