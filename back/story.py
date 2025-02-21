from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from base import get_db
from model import Location
from security import get_current_user
from dto import CheckLocationDTO
from math import radians, cos, sin, sqrt, atan2

router = APIRouter(
    prefix="/story",
)

# 기준 오차 범위 (미터 단위)
RANGE_LIMIT = 500  # 500m 이내

# Haversine 공식을 사용하여 두 좌표 간 거리 계산 (단위: 미터)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000 
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c 

@router.post("/check-location")
def check_story_location(
    location_data: CheckLocationDTO,
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
):
    # DB에서 기준 위치(인제대학교) 가져오기
    reference_location = db.query(Location).filter_by(name="인제대학교").first()
    if not reference_location:
        raise HTTPException(status_code=404, detail="기준 위치가 설정되지 않았습니다.")

    # 현재 사용자 위치와 기준 위치 비교
    distance = haversine(
        location_data.latitude,
        location_data.longitude,
        reference_location.latitude,
        reference_location.longitude,
    )

    if distance <= RANGE_LIMIT:
        return {"allowed": True, "message": "스토리를 작성할 수 있습니다!"}
    else:
        return {"allowed": False, "message": "스토리를 작성할 수 없습니다. 기준 위치에서 너무 멀리 있습니다."}
