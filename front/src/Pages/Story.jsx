import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Story = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [storyList, setStoryList] = useState([]);
  const [nearbyStories, setNearbyStories] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 페이지 로드시 주변 스토리 목록 가져오기
    checkUserLogin();
    getUserLocation();
  }, []);

  const checkUserLogin = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setMessage("로그인 후 이용 가능합니다");
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation이 지원되지 않습니다.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`현재 위치 - 위도: ${latitude}, 경도: ${longitude}`);
        setUserLocation({ latitude, longitude });

        // 위치 정보를 가져온 후 주변 스토리 목록 조회
        fetchNearbyStories(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error("위치 정보를 가져오는 데 실패했습니다:", error);
        setMessage("위치 정보를 가져오는 데 실패했습니다.");
        setLoading(false);
      }
    );
  };

  const fetchNearbyStories = async (latitude, longitude) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await axios.get(
        `/api/story/nearby?latitude=${latitude}&longitude=${longitude}&radius=1.0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.stories && response.data.stories.length > 0) {
        setNearbyStories(response.data.stories);
        setMessage(
          `주변에 ${response.data.stories.length}개의 스토리가 있습니다!`
        );
      } else {
        setMessage("주변에 스토리가 없습니다. 첫 번째 스토리를 작성해보세요!");
      }
    } catch (error) {
      console.error(
        "주변 스토리 조회 실패:",
        error.response?.data || error.message
      );
      setMessage("주변 스토리를 불러오는 데 실패했습니다.");
    }
  };

  const checkLocationBeforeStory = async () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation이 지원되지 않습니다.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`현재 위치 - 위도: ${latitude}, 경도: ${longitude}`);

        // localStorage에서 token 가져오기
        const token = localStorage.getItem("access_token");

        // 토큰이 없으면 로그인 페이지로 리다이렉트
        if (!token) {
          setMessage("로그인 상태가 아닙니다. 로그인 페이지로 이동합니다.");
          navigate("/login");
          return;
        }

        try {
          const response = await axios.post(
            `/api/story/check-location`,
            { latitude, longitude },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setLoading(false);
          if (response.data.allowed) {
            setMessage("스토리를 작성할 수 있습니다!");
            navigate("/Storywrite"); // 스토리 작성 페이지로 이동
          } else {
            setMessage(
              response.data.message || "스토리 작성이 불가능한 위치입니다."
            );
          }
        } catch (error) {
          setLoading(false);
          console.error(
            "스토리 작성 가능 여부 확인 실패:",
            error.response?.data || error.message
          );
          setMessage("서버 요청에 실패했습니다.");
        }
      },
      (error) => {
        setLoading(false);
        console.error("위치 정보를 가져오는 데 실패했습니다:", error);
        setMessage("위치 정보를 가져오는 데 실패했습니다.");
      }
    );
  };

  const viewStoryDetail = (storyId) => {
    navigate(`/story/${storyId}`);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  return (
    <div className="story-container">
      <h1>스토리 맵</h1>

      {loading ? (
        <p className="loading">위치 정보를 불러오는 중...</p>
      ) : (
        <div className="story-action">
          <button
            className="create-story-btn"
            onClick={checkLocationBeforeStory}
            disabled={loading}
          >
            새 스토리 작성
          </button>
          <button
            className="refresh-btn"
            onClick={getUserLocation}
            disabled={loading}
          >
            주변 스토리 새로고침
          </button>
        </div>
      )}

      <p className="message">{message}</p>

      {nearbyStories.length > 0 && (
        <div className="nearby-stories">
          <h2>주변 스토리</h2>
          <ul className="story-list">
            {nearbyStories.map((story) => (
              <li
                key={story.id}
                className="story-item"
                onClick={() => viewStoryDetail(story.id)}
              >
                <div className="story-header">
                  <h3>{story.title}</h3>
                  {userLocation && (
                    <span className="distance">
                      {calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        story.latitude,
                        story.longitude
                      ).toFixed(2)}{" "}
                      km
                    </span>
                  )}
                </div>
                <p className="story-preview">
                  {story.content.substring(0, 100)}...
                </p>
                <div className="story-meta">
                  <span className="author">{story.author_nickname}</span>
                  <span className="created-at">
                    {new Date(story.created_at).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button className="home-btn" onClick={() => navigate("/")}>
        홈으로
      </button>
    </div>
  );
};

export default Story;
