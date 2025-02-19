from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from user import router as user
from location import router as location 
from story import router as story  
app = FastAPI()

app.include_router(user,tags=["user"])
app.include_router(location,tags=["location"]) 
app.include_router(story,tags=["story"]) 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # 허용할 도메인 목록
    allow_credentials=True,          # 쿠키를 포함한 인증 정보 허용
    allow_methods=["*"],             # 허용할 HTTP 메서드 (GET, POST 등)
    allow_headers=["*"],             # 허용할 HTTP 헤더
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)