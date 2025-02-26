import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
      try {
        const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
        setUsername(userInfo.nickname || "사용자");
      } catch (error) {
        console.error("사용자 정보를 가져오는 데 실패했습니다:", error);
      }
    }

    // 로그인 상태 변경 감지
    const handleStorageChange = () => {
      const token = localStorage.getItem("access_token");
      setIsLoggedIn(!!token);
      if (token) {
        try {
          const userInfo = JSON.parse(
            localStorage.getItem("user_info") || "{}"
          );
          setUsername(userInfo.nickname || "사용자");
        } catch (error) {
          console.error("사용자 정보를 가져오는 데 실패했습니다:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    setIsLoggedIn(false);
    setUsername("");
    navigate("/");
  };

  // 현재 경로에 따라 활성화된 링크 표시
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return "nav-button active";
    if (path !== "/" && location.pathname.startsWith(path))
      return "nav-button active";
    return "nav-button";
  };

  return (
    <header className="app-header">
      <Link to="/" className="logo">
        크라우드 스토리맵
      </Link>

      <nav className="nav-buttons">
        {isLoggedIn ? (
          <>
            <Link to="/story" className={isActive("/story")}>
              스토리
            </Link>
            <Link to="/storywrite" className={isActive("/storywrite")}>
              작성하기
            </Link>
            <Link to="/map" className={isActive("/map")}>
              지도
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/story" className={isActive("/story")}>
              스토리
            </Link>
            <Link to="/login" className={isActive("/login")}>
              로그인
            </Link>
            <Link to="/signup" className={isActive("/signup")}>
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
