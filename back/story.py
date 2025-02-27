from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from base import get_db
from model import Location, Story, User
from security import get_current_user
from dto import CheckLocationDTO, CreateStoryDTO
from math import radians, cos, sin, sqrt, atan2

router = APIRouter(
    prefix="/story",
)

# 기준 오차 범위 (미터 단위)
RANGE_LIMIT = 10000  

# Haversine 공식을 사용하여 두 좌표 간 거리 계산 (단위: 미터)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # 지구 반지름 (미터)
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

@router.post("/check-location")
def check_story_location(
    location_data: CheckLocationDTO,
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
):
    locations = db.query(Location).all()
    if not locations:
        raise HTTPException(status_code=404, detail="등록된 기준 위치가 없습니다.")

    nearest_location = None
    min_distance = float("inf")
    
    for loc in locations:
        distance = haversine(
            location_data.latitude,
            location_data.longitude,
            loc.latitude,
            loc.longitude,
        )
        if distance < min_distance:
            min_distance = distance
            nearest_location = loc

    # 기준 범위 내에 있는지 확인
    if nearest_location and min_distance <= RANGE_LIMIT:
        return {
            "allowed": True,
            "message": "스토리를 작성할 수 있습니다!",
            "nearest_location_id": nearest_location.id,
            "nearest_location_name": nearest_location.name
        }
    else:
        return {
            "allowed": False,
            "message": "스토리를 작성할 수 없습니다. 기준 위치에서 너무 멀리 있습니다."
        }
@router.post("/Story_writing")
def create_story(
    story_data: CreateStoryDTO,
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
):
    user_data = db.query(User).filter(User.userid == user).first()
    if not user_data:
        raise HTTPException(status_code=401, detail="유효하지 않은 사용자입니다.")

    # location_id 유효성 검사
    location = db.query(Location).filter(Location.id == story_data.location_id).first()
    if not location:
        raise HTTPException(status_code=400, detail="유효하지 않은 location_id입니다.")

    # 부모 스토리가 있을 경우, 부모 스토리의 위치 검증
    if story_data.parent_story_id:
        parent_story = db.query(Story).filter(Story.id == story_data.parent_story_id).first()
        if not parent_story:
            raise HTTPException(status_code=400, detail="유효하지 않은 parent_story_id입니다.")
        
        # 🚨 부모 스토리의 위치와 현재 작성 위치가 다르면 오류 발생!
        if parent_story.location_id != story_data.location_id:
            raise HTTPException(status_code=400, detail="부모 스토리는 같은 장소에서 작성된 글이어야 합니다.")

    # 새로운 스토리 저장
    new_story = Story(
        title=story_data.title,
        content=story_data.content,
        user_id=user_data.id,
        location_id=story_data.location_id,
        parent_story_id=story_data.parent_story_id  # 이어쓰기인 경우 부모 ID 저장
    )

    db.add(new_story)
    db.commit()
    db.refresh(new_story)

    return {"message": "스토리가 성공적으로 작성되었습니다!", "story_id": new_story.id}
