import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8000"; // API URL 수정

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 추적
  const navigate = useNavigate();

  useEffect(() => {
    // 페이지 로드 시 토큰이 있는지 확인
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alert("아이디와 비밀번호를 입력하세요!");
      return; // 요청 보내지 않음
    }
  
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);
  
      const response = await axios.post(
        `${API_URL}/user/login`,
        formData,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
  
      const newToken = response.data.access_token;
      localStorage.setItem("access_token", newToken);
      setIsLoggedIn(true);
  
      console.log("로그인 성공:", response.data);
      navigate("/");
    } catch (error) {
      alert("로그인 실패: 아이디 또는 비밀번호가 올바르지 않습니다.");
      console.error("로그인 실패:", error.response?.data || error.message);
    }
  };  

  const handleLogout = () => {
    localStorage.removeItem("access_token"); // 토큰 삭제
    setIsLoggedIn(false); // 로그아웃 시 상태 변경
    navigate("/login"); // 로그인 페이지로 이동
  };

  return (
    <div className="container">
      <h2>{isLoggedIn ? "로그인된 상태" : "로그인"}</h2>
      {!isLoggedIn ? (
        <>
          <input
            type="text"
            placeholder="유저이름"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>로그인</button>
        </>
      ) : (
        <button onClick={handleLogout}>로그아웃</button>
      )}
    </div>
  );
}
