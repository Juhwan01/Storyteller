import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userService } from "../services/apiService";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 페이지 로드 시 토큰이 있는지 확인
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 입력하세요!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await userService.login(username, password);

      // 토큰 저장
      localStorage.setItem("access_token", response.access_token);

      // 사용자 정보 가져오기
      try {
        const userInfo = await userService.getUserInfo();
        localStorage.setItem("user_info", JSON.stringify(userInfo.user));
      } catch (userInfoError) {
        console.error("사용자 정보를 가져오는데 실패했습니다:", userInfoError);
      }

      setIsLoggedIn(true);
      setIsLoading(false);
      navigate("/");
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        setError("로그인 실패: 아이디 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
      console.error("로그인 실패:", error.response?.data || error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="page-container">
      <div className="auth-container fade-in">
        <h2>로그인</h2>

        {error && <p className="error-message">{error}</p>}

        {!isLoggedIn ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">아이디</label>
              <input
                type="text"
                id="username"
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </button>

            <p className="auth-links">
              계정이 없으신가요? <Link to="/signup">회원가입</Link>
            </p>
          </form>
        ) : (
          <div className="logout-container">
            <p>이미 로그인 되어 있습니다.</p>
            <div className="button-group">
              <button onClick={handleLogout}>로그아웃</button>
              <button
                onClick={() => navigate("/")}
                className="secondary-button"
              >
                홈으로
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
