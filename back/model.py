from sqlalchemy import Column, Integer, String, DateTime, func, Text, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from base import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)  # 사용자 고유 ID
    nickname = Column(String, nullable=False)  # 사용자 닉네임
    userid = Column(String, unique=True, nullable=False)  # 고유한 사용자 ID (로그인용)
    userpw = Column(String, nullable=False)  # 사용자 비밀번호
    created_at = Column(DateTime, default=func.now())  # 계정 생성 시간

    # Relationships
    stories = relationship("Story", back_populates="author")  # 사용자가 작성한 스토리 목록

class Location(Base):
    __tablename__ = 'locations'
    id = Column(Integer, primary_key=True)  # 장소 고유 ID
    latitude = Column(Float, nullable=False)  # 위도
    longitude = Column(Float, nullable=False)  # 경도
    
    name = Column(String, nullable=False)  # 장소 이름
    description = Column(Text, nullable=True)  # 장소에 대한 설명 (선택 사항)

    # Relationships
    stories = relationship("Story", back_populates="location")  # 장소에 연관된 스토리 목록

class Story(Base):
    __tablename__ = 'stories'
    id = Column(Integer, primary_key=True)  # 스토리 고유 ID
    location_id = Column(Integer, ForeignKey('locations.id'), nullable=False)  # 스토리가 작성된 장소 ID
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)  # 스토리를 작성한 사용자 ID
    parent_story_id = Column(Integer, ForeignKey('stories.id'), nullable=True)  # 부모 스토리 ID (이어쓰기 기능)
    content = Column(Text, nullable=False)  # 스토리 내용
    created_at = Column(DateTime, default=func.now())  # 스토리 작성 시간
    is_root = Column(Boolean, default=False)  # 장소의 시작 스토리인지 여부

    # Relationships
    location = relationship("Location", back_populates="stories")  # 스토리가 연결된 장소
    author = relationship("User", back_populates="stories")  # 스토리를 작성한 사용자
    child_stories = relationship("Story", backref="parent_story", remote_side=[id])  # 자식 스토리 목록 (이어쓰기 스토리)
