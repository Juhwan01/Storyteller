import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const MobileNav = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);

    // 로그인 상태 변경 감지
    const handleStorageChange = () => {
      const token = localStorage.getItem("access_token");
      setIsLoggedIn(!!token);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 현재 경로에 따라 활성화된 탭 표시
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return "nav-item active";
    if (path !== "/" && location.pathname.startsWith(path))
      return "nav-item active";
    return "nav-item";
  };

  return (
    <nav className="mobile-nav">
      <Link to="/" className={isActive("/")}>
        <span className="nav-icon">🏠</span>
        <span className="nav-label">홈</span>
      </Link>

      <Link to="/story" className={isActive("/story")}>
        <span className="nav-icon">📖</span>
        <span className="nav-label">스토리</span>
      </Link>

      {isLoggedIn && (
        <Link to="/storywrite" className={isActive("/storywrite")}>
          <span className="nav-icon">✏️</span>
          <span className="nav-label">작성</span>
        </Link>
      )}

      {isLoggedIn ? (
        <Link to="/map" className={isActive("/map")}>
          <span className="nav-icon">🗺️</span>
          <span className="nav-label">지도</span>
        </Link>
      ) : (
        <Link to="/login" className={isActive("/login")}>
          <span className="nav-icon">🔑</span>
          <span className="nav-label">로그인</span>
        </Link>
      )}
    </nav>
  );
};

export default MobileNav;
