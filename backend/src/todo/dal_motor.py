# dal_motor.py
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from pydantic import BaseModel, Field
import bcrypt

class User(BaseModel):
    id: str = Field(alias="_id")
    email: str
    password: str

    @staticmethod
    def from_doc(doc) -> "User":
        return User(
            _id=str(doc["_id"]),
            email=doc["email"],
            password=doc["password"]
        )

async def get_instance(database: AsyncIOMotorDatabase):
    return UserDALMotor(database)

class UserDALMotor:
    def __init__(self, database: AsyncIOMotorDatabase):
        self._user_collection = database.get_collection("users")

    async def create_user(self, email: str, password: str) -> str:
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        response = await self._user_collection.insert_one({
            "email": email,
            "password": hashed_password.decode('utf-8')
        })
        return str(response.inserted_id)

    async def get_user_by_email(self, email: str) -> User | None:
        doc = await self._user_collection.find_one({"email": email})
        if doc:
            return User.from_doc(doc)
        return None

    async def verify_password(self, stored_password: str, provided_password: str) -> bool:
        return bcrypt.checkpw(
            provided_password.encode('utf-8'),
            stored_password.encode('utf-8')
        )