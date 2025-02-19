import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const API_URL = 'http://localhost:8000';  // API URL 수정

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();
  
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/user/signup`,
        { userid:username, nickname, password },
        { headers: { "Content-Type": "application/json" } } // JSON 형식 명시
      );
      console.log("회원가입 성공:", response.data);
      navigate("/Login");
    } catch (error) {
      console.error("회원가입 실패:", error);
    }
  };
  

  return (
    <div className="container">
      <h2>회원가입</h2>
      <form onSubmit={handleSignup}>
        <input 
          type="text" 
          placeholder="유저이름" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="닉네임" 
          value={nickname} 
          onChange={(e) => setNickname(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="비밀번호" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
}
