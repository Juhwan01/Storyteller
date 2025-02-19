import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    const handleclick = () => {
        navigate("/login");
    }
    const handleclick1 = () => {
      navigate("/Signup");
    }
    const handleclick2 = () => {
      navigate("/Story");
    }
  return (
    <div>
      <h1>메인 페이지</h1>
      <button onClick={handleclick}>로그인</button>
      <button onClick={handleclick1}>회원가입</button>
      <button onClick={handleclick2}>스토리</button>
    </div>
  );
}