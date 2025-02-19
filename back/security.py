from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import  Depends, HTTPException
from jose import JWTError, jwt
from datetime import datetime, timedelta
from base import get_db
from sqlalchemy.orm import Session
from model import User

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")

# 비밀번호 해싱을 위한 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 비밀번호 해싱 함수
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# 비밀번호 검증 함수
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
# 토큰 검증 함수
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # token은 이미 "Bearer " 부분이 제거된 상태
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401)
        return username
    except JWTError:
        raise HTTPException(status_code=401)

def create_access_token(data: dict):
    # 데이터 복사
    to_encode = data.copy()

    # 만료 시간 설정
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    # JWT 토큰 생성
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(userid : str, password : str, db:Session=Depends(get_db)):
    try:
        user = db.query(User).filter(User.userid == userid).first()
        if not user:
            return False
        return verify_password(user.userpw,password)
    except Exception as e:
        return {"error": str(e)}
    