import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userService } from "../services/apiService";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // 입력값 검증
    if (!username.trim() || !nickname.trim() || !password.trim()) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await userService.signup({
        userid: username,
        nickname,
        password,
      });

      setIsLoading(false);
      // 회원가입 성공 메시지 표시 후 로그인 페이지로 이동
      alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
      navigate("/login");
    } catch (error) {
      setIsLoading(false);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
      console.error("회원가입 실패:", error.response?.data || error.message);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-container fade-in">
        <h2>회원가입</h2>

        {error && <p className="error-message">{error}</p>}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              placeholder="사용할 아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nickname">닉네임</label>
            <input
              type="text"
              id="nickname"
              placeholder="사용할 닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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

          <div className="form-group">
            <label htmlFor="passwordConfirm">비밀번호 확인</label>
            <input
              type="password"
              id="passwordConfirm"
              placeholder="비밀번호를 다시 입력하세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "회원가입 중..." : "회원가입"}
          </button>

          <p className="auth-links">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
