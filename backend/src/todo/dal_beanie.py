from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from beanie import Document, init_beanie
from pydantic import BaseModel
import bcrypt

class User(Document):
    class Settings:
        name = "users"

    email: str
    password: str

async def get_instance(database: AsyncIOMotorDatabase) -> "UserDALBeanie":
    return await UserDALBeanie(database)

class UserDALBeanie:
    def __init__(self, database: AsyncIOMotorDatabase):
        self._database = database

    def __await__(self):
        return self.create().__await__()

    async def create(self):
        print("initializing")
        await init_beanie(
            database=self._database, document_models=[User]
        )
        return self

    async def create_user(self, email: str, password: str) -> ObjectId:
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        new_user = User(
            email=email, 
            password=hashed_password.decode('utf-8')
        )
        await new_user.save()
        return new_user.id

    async def get_user_by_email(self, email: str) -> User | None:
        return await User.find_one({"email": email})

    async def verify_password(self, stored_password: str, provided_password: str) -> bool:
        return bcrypt.checkpw(
            provided_password.encode('utf-8'),
            stored_password.encode('utf-8')
        )