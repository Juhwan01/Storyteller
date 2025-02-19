from fastapi import APIRouter,Depends,HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from base import get_db
from model import User
from dto import AddUserDTO,UpdateUserDTO
from security import hash_password, create_access_token,authenticate_user,get_current_user

router = APIRouter(
    prefix="/user",
)

@router.post("/signup")
def signup(user_data: AddUserDTO, db: Session = Depends(get_db)):
    # 아이디 중복 검사...를 넣고 싶은데 .. 
    try:
        hashed_password = hash_password(user_data.password)
        new_user = User(
            userid=user_data.userid,
            userpw=hashed_password,
            nickname=user_data.nickname
        )
        db.add(new_user)
        db.commit()
        return {"message": "User successfully created!"}
    except Exception as e:
        db.rollback()
        return {"error": f"Error adding user: {str(e)}"}
    
@router.post("/login")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # 사용자 인증
    if authenticate_user(form_data.username, form_data.password):
        # 토큰 데이터 준비
        token_data = {
            "sub": form_data.username,
            "type": "access"
        }
        # 토큰 생성 및 반환
        token = create_access_token(token_data)
        return {"access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(
            status_code=401,
            detail="아이디 또는 비밀번호가 잘못되었습니다"
        )
    

@router.delete("/{userid}/del")
def delete_user(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    try:
        user_to_delete  = db.query(User).filter(User.userid == user).first()
        if not user_to_delete :
            return {"error": f"User {user} not found"}
        db.delete(user_to_delete )
        db.commit()
        return {"message": f"User {user} deleted successfully!"}
    except Exception as e:
        db.rollback()
        return {"error": f"Error deleting user: {str(e)}"}

@router.put("/{userid}/change")
def update_user(user_data:UpdateUserDTO, db: Session = Depends(get_db), user:str=Depends(get_current_user)):
    try:
        user  = db.query(User).filter(User.userid == user).first()
        user.userid = user_data.userid
        user.userpw = user_data.password
        user.nickname = user_data.nickname
        if user_data.password:
            user.userpw = hash_password(user_data.password)
        
        db.add(user)
        db.commit()
    except Exception as e:
        db.rollback()
        print("Error adding user:", e)