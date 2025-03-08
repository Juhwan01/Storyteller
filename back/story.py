from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from math import radians, cos, sin, sqrt, atan2

from base import get_db
from model import Location, Story, User
from security import get_current_user
from dto import CheckLocationDTO, CreateStoryDTO

router = APIRouter(
    prefix="/story",
)

# 거리 계산 관련 (1km 기준)
RANGE_LIMIT = 1000  # 1km = 1000m

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

# 근처 1km 내의 '최초 스토리(is_root=True)' 조회 API 
@router.get("/nearby-root-stories")
def get_nearby_root_stories(
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
):
    locations = db.query(Location).all()
    if not locations:
        return {"message": "등록된 장소가 없습니다.", "stories": []}

    root_stories = []
    for loc in locations:
        distance = haversine(latitude, longitude, loc.latitude, loc.longitude)
        if distance <= RANGE_LIMIT:
            # 장소에 연결된 '최초 스토리'만 찾기
            stories_in_location = (
                db.query(Story)
                .filter(Story.location_id == loc.id, Story.is_root == True)
                .all()
            )
            for st in stories_in_location:
                root_stories.append({
                    "story_id": st.id,
                    "title": st.title,
                    "content": st.content,
                    "location_id": loc.id,
                    "location_name": loc.name,
                    "distance": distance
                })

    if not root_stories:
        return {
            "message": "반경 1km 내에 최초 스토리가 없습니다.",
            "stories": []
        }

    return {
        "message": "반경 1km 내에 있는 최초 스토리 목록입니다.",
        "stories": root_stories
    }

# 특정 장소의 스토리들 조회 API
@router.get("/location-stories/{location_id}")
def get_stories_by_location(
    location_id: int,
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="해당 장소가 존재하지 않습니다.")

    stories = db.query(Story).filter(Story.location_id == location_id).all()
    if not stories:
        return {
            "message": f"장소 '{location.name}'에 등록된 스토리가 없습니다.",
            "location": location.name,
            "stories": []
        }

    story_list = []
    for s in stories:
        story_list.append({
            "story_id": s.id,
            "title": s.title,
            "content": s.content,
            "parent_story_id": s.parent_story_id,
            "is_root": s.is_root,
            "created_at": s.created_at,
            "author_nickname": s.author.nickname  # 작성자 닉네임 추가
        })
    
    return {
        "message": f"장소 '{location.name}'에 등록된 스토리입니다.",
        "location": location.name,
        "stories": story_list
    }

# 스토리 수정용 DTO + 수정 API 
class UpdateStoryDTO(BaseModel):
    story_id: int
    update_content: str

@router.put("/update-story")
def update_story(
    update_data: UpdateStoryDTO,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    story_to_update = db.query(Story).filter(Story.id == update_data.story_id).first()
    if not story_to_update:
        raise HTTPException(status_code=404, detail="해당 스토리가 존재하지 않습니다.")

    # 이어쓰기 방식: 기존 내용을 그대로 유지하고, 새 내용만 덧붙임
    story_to_update.content += f"\n{update_data.update_content}"

    db.commit()
    db.refresh(story_to_update)

    return {
        "message": "스토리가 성공적으로 업데이트되었습니다.",
        "story_id": story_to_update.id,
        "updated_content": story_to_update.content
    }

# 위치 체크 및 스토리 작성 API
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

# 스토리 작성 API 
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

    # 부모 스토리가 있을 경우, 위치 검증
    if story_data.parent_story_id:
        parent_story = db.query(Story).filter(Story.id == story_data.parent_story_id).first()
        if not parent_story:
            raise HTTPException(status_code=400, detail="유효하지 않은 parent_story_id입니다.")
        if parent_story.location_id != story_data.location_id:
            raise HTTPException(status_code=400, detail="부모 스토리는 같은 장소에서 작성된 글이어야 합니다.")

    # 해당 위치에 이미 스토리가 존재하면 새로 생성하지 않음 (이어쓰기는 PUT /update-story로 진행)
    existing_stories = db.query(Story).filter(Story.location_id == story_data.location_id).count()
    if existing_stories > 0:
        raise HTTPException(
            status_code=400,
            detail="해당 위치에 이미 스토리가 존재합니다. 이어서 업데이트하려면 PUT /update-story를 이용해주세요."
        )

    new_story = Story(
        title=story_data.title,
        content=story_data.content,
        user_id=user_data.id,
        location_id=story_data.location_id,
        parent_story_id=story_data.parent_story_id,
        is_root=True  # 해당 위치의 첫 스토리
    )

    db.add(new_story)
    db.commit()
    db.refresh(new_story)

    return {"message": "스토리가 성공적으로 작성되었습니다!", "story_id": new_story.id}
