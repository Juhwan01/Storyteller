from pydantic import BaseModel
from typing import Optional

class AddUserDTO(BaseModel):
    userid: str
    nickname: str
    password: str

class UpdateUserDTO(BaseModel):
    userid: Optional[str] = None
    nickname: Optional[str] = None
    password: Optional[str] = None

class AddLocationDTO(BaseModel):
    name: str
    latitude: float
    longitude: float

class CheckLocationDTO(BaseModel):
    latitude: float
    longitude: float