import { useState } from "react";

const Location = () => {
  const [status, setStatus] = useState("");

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation이 지원되지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`위도: ${latitude}, 경도: ${longitude}`);
        setStatus(`위도: ${latitude}, 경도: ${longitude}`);
      },
      (error) => {
        console.error("위치 정보를 가져오는 데 실패했습니다:", error);
        setStatus("위치 정보를 가져오는 데 실패했습니다.");
      }
    );
  };

  return (
    <div>
      <h1>위치 정보 가져오기</h1>
      <button onClick={getUserLocation}>내 위치 확인</button>
      <p>{status}</p>
    </div>
  );
};

export default Location;
