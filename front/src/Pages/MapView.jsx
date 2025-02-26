import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MapView = () => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [storyData, setStoryData] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 스크립트 로드 (카카오맵 API 사용)
    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&autoload=false";
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        setMapLoaded(true);
      });
    };

    document.head.appendChild(script);

    // 사용자 위치 가져오기
    getUserLocation();

    // 스토리 데이터 가져오기
    fetchStoryData();

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && userLocation && storyData.length > 0) {
      initializeMap();
    }
  }, [mapLoaded, userLocation, storyData]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation이 지원되지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
      },
      (error) => {
        console.error("위치 정보를 가져오는 데 실패했습니다:", error);
        setError("위치 정보를 가져오는 데 실패했습니다.");
      }
    );
  };

  const fetchStoryData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }

      const response = await axios.get(`/api/story/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStoryData(response.data.stories || []);
      setLoading(false);
    } catch (error) {
      console.error("스토리 데이터 로드 실패:", error);
      setError("스토리 데이터를 불러오는 데 실패했습니다.");
      setLoading(false);
    }
  };

  const initializeMap = () => {
    const container = document.getElementById("map");
    const options = {
      center: new window.kakao.maps.LatLng(
        userLocation.latitude,
        userLocation.longitude
      ),
      level: 3,
    };

    const map = new window.kakao.maps.Map(container, options);

    // 사용자 위치 마커
    const userMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(
        userLocation.latitude,
        userLocation.longitude
      ),
      map: map,
    });

    // 사용자 위치 인포윈도우
    const userInfoWindow = new window.kakao.maps.InfoWindow({
      content: '<div style="padding:5px;">내 위치</div>',
    });
    userInfoWindow.open(map, userMarker);

    // 스토리 마커들
    storyData.forEach((story) => {
      const storyPosition = new window.kakao.maps.LatLng(
        story.latitude,
        story.longitude
      );

      // 스토리 마커 생성
      const storyMarker = new window.kakao.maps.Marker({
        position: storyPosition,
        map: map,
      });

      // 스토리 마커 클릭 이벤트
      window.kakao.maps.event.addListener(storyMarker, "click", function () {
        setSelectedStory(story);
      });

      // 스토리 연결선 그리기 (이어진 스토리가 있는 경우)
      if (story.connected_story_ids && story.connected_story_ids.length > 0) {
        story.connected_story_ids.forEach((connectedId) => {
          const connectedStory = storyData.find((s) => s.id === connectedId);
          if (connectedStory) {
            const linePath = [
              storyPosition,
              new window.kakao.maps.LatLng(
                connectedStory.latitude,
                connectedStory.longitude
              ),
            ];

            // 연결선 그리기
            const polyline = new window.kakao.maps.Polyline({
              path: linePath,
              strokeWeight: 2,
              strokeColor: "#3b82f6",
              strokeOpacity: 0.7,
              strokeStyle: "solid",
            });

            polyline.setMap(map);
          }
        });
      }
    });
  };

  const handleStoryClick = (storyId) => {
    navigate(`/story/${storyId}`);
  };

  const closeStoryDetail = () => {
    setSelectedStory(null);
  };

  const handleCreateContinuationStory = (parentStoryId) => {
    navigate(`/storywrite?parent=${parentStoryId}`);
  };

  if (loading) {
    return (
      <div className="map-loading">
        <p>지도를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-error">
        <p>{error}</p>
        <button onClick={() => navigate("/story")}>
          스토리 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="map-container">
      <h1>스토리 맵</h1>

      <div id="map" className="kakao-map"></div>

      {selectedStory && (
        <div className="story-detail-card">
          <button className="close-btn" onClick={closeStoryDetail}>
            ×
          </button>
          <h2>{selectedStory.title}</h2>
          <p className="story-author">
            작성자: {selectedStory.author_nickname}
          </p>
          <p className="story-date">
            작성일: {new Date(selectedStory.created_at).toLocaleDateString()}
          </p>
          <div className="story-content">
            <p>{selectedStory.content}</p>
          </div>
          <div className="story-actions">
            <button
              className="view-btn"
              onClick={() => handleStoryClick(selectedStory.id)}
            >
              전체 보기
            </button>
            <button
              className="continue-btn"
              onClick={() => handleCreateContinuationStory(selectedStory.id)}
            >
              이어쓰기
            </button>
          </div>
        </div>
      )}

      <div className="map-controls">
        <button onClick={() => navigate("/story")}>목록으로</button>
        <button onClick={() => navigate("/storywrite")}>새 스토리</button>
        <button onClick={getUserLocation}>내 위치로</button>
      </div>
    </div>
  );
};

export default MapView;
