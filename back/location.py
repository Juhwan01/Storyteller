from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from base import get_db
from model import Location
from dto import AddLocationDTO

router = APIRouter(
    prefix="/location",
)

@router.post("/")
def add_location(location_data: AddLocationDTO, db: Session = Depends(get_db)):
    try:
        new_location = Location(
            name=location_data.name, 
            latitude=location_data.latitude,
            longitude=location_data.longitude
        )
        db.add(new_location)
        db.commit()
        return {"message": "Location successfully added!"}
    except Exception as e:
        db.rollback()
        return {"error": f"Error adding location: {str(e)}"}
