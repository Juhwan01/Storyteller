import { useState } from "react";
import { useNavigate } from "react-router-dom";  

const Story = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();  

  const checkLocationBeforeStory = async () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation이 지원되지 않습니다.");
      return;
    }

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
          const response = await fetch("http://localhost:8000/story/check-location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ latitude, longitude }),
          });

          const data = await response.json();
          if (data.allowed) {
            setMessage("스토리를 작성할 수 있습니다!");
            navigate("/storywrite");  // 스토리 작성 페이지로 이동
          } else {
            setMessage("스토리 작성이 불가능한 위치입니다.");
          }
        } catch (error) {
          console.error("스토리 작성 가능 여부 확인 실패:", error);
          setMessage("서버 요청에 실패했습니다.");
        }
      },
      (error) => {
        console.error("위치 정보를 가져오는 데 실패했습니다:", error);
        setMessage("위치 정보를 가져오는 데 실패했습니다.");
      }
    );
  };

  return (
    <div>
      <h1>스토리 작성</h1>
      <button onClick={checkLocationBeforeStory}>스토리 작성</button>
      <p>{message}</p>
    </div>
  );
};

export default Story;
