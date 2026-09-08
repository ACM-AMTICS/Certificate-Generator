import os
import logging
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import pymongo

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "acm_certificates_db")

logger = logging.getLogger("acm_backend")

db = None
client = None

async def init_db():
    global db, client
    logger.info(f"Initializing MongoDB connection to {MONGODB_URL}...")
    
    use_mock = False
    try:
        # Try real Motor MongoDB connection with 2.5s timeout
        test_client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=2500)
        # Test connection ping
        await test_client.admin.command('ping')
        client = test_client
        logger.info("Successfully connected to live MongoDB server!")
    except Exception as e:
        logger.warning(f"Could not connect to live MongoDB server ({e}). Initializing in-memory AsyncMongoMockClient fallback for local dev.")
        try:
            import mongomock_motor
            client = mongomock_motor.AsyncMongoMockClient()
            use_mock = True
        except ImportError:
            logger.error("mongomock-motor not installed and MongoDB server unreachable.")
            raise e

    db = client[DB_NAME]

    # Create compound unique index on (event_id, device_token)
    try:
        await db.certificates.create_index(
            [("event_id", pymongo.ASCENDING), ("device_token", pymongo.ASCENDING)],
            unique=True,
            name="uniq_event_device_token"
        )
        logger.info("Ensured compound unique index on (event_id, device_token)")
    except Exception as idx_err:
        logger.warning(f"Index creation notice: {idx_err}")

    # Seed default event gsoc-2026 if events collection is empty
    default_event = await db.events.find_one({"_id": "gsoc-2026"})
    if not default_event:
        await db.events.insert_one({
            "_id": "gsoc-2026",
            "name": "ACM Open Source & GSoC 2026",
            "active": True,
            "description": "Annual ACM Open Source and Google Summer of Code orientation event.",
            "date": "September 2026"
        })
        logger.info("Seeded default event 'gsoc-2026'")

def get_database():
    global db
    if db is None:
        raise RuntimeError("Database is not initialized. Call init_db() first.")
    return db
