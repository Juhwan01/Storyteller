import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // 페이지 로드 시 로그인 상태 확인
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
      // 사용자 정보 가져오기
      try {
        const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
        setUsername(userInfo.nickname || "사용자");
      } catch (error) {
        console.error("사용자 정보를 가져오는 데 실패했습니다:", error);
      }
    }
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleViewStories = () => {
    navigate("/story");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    setIsLoggedIn(false);
    setUsername("");
  };

  return (
    <div className="page-container">
      <div className="home-container fade-in">
        <h1>크라우드 스토리맵</h1>
        <p className="home-description">
          장소에 얽힌 이야기를 실시간으로 엮어가는 협업 소설 플랫폼
        </p>

        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>위치 기반 스토리텔링</h3>
            <p>특정 장소에서 시작되는 이야기를 작성하고 공유하세요.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>이어쓰기</h3>
            <p>다른 사용자들이 이어쓰기로 스토리를 확장해나갑니다.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>스토리라인</h3>
            <p>장소간 이야기를 선으로 연결해 스토리라인을 생성합니다.</p>
          </div>
        </div>

        {isLoggedIn ? (
          <div className="user-welcome">
            <p className="welcome-msg">{username}님, 환영합니다!</p>
            <div className="home-buttons">
              <button onClick={handleViewStories}>스토리 목록</button>
              <button onClick={handleLogout} className="logout-button">
                로그아웃
              </button>
            </div>
          </div>
        ) : (
          <div className="home-buttons">
            <button onClick={handleLogin}>로그인</button>
            <button onClick={handleSignup}>회원가입</button>
            <button onClick={handleViewStories} className="secondary-button">
              스토리 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
