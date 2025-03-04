import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Storywrite = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  useEffect(() => {
    // 현재 위치 정보 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          console.error("위치 정보를 가져오는 데 실패했습니다:", error);
          alert("위치 정보를 가져올 수 없습니다. 위치 접근을 허용해 주세요.");
          navigate("/story");
        }
      );
    } else {
      alert("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
      navigate("/story");
    }

    // 로그인 상태 확인
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (!location) {
      alert("위치 정보를 가져오는 중입니다. 잠시만 기다려주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `/api/story/Story_write`,
        {
          title,
          content,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("스토리 작성 성공:", response.data);
      alert("스토리가 성공적으로 작성되었습니다!");
      navigate("/story");
    } catch (error) {
      console.error("스토리 작성 실패:", error.response?.data || error.message);
      alert("스토리 작성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestAiSuggestion = async () => {
    if (!location) {
      alert("위치 정보를 가져오는 중입니다. 잠시만 기다려주세요.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `/api/story/ai-suggestion`,
        {
          latitude: location.latitude,
          longitude: location.longitude,
          currentContent: content, // 현재 작성 중인 내용을 전송하여 AI가 참고할 수 있게 함
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAiSuggestion(response.data.suggestion);
      setShowAiSuggestion(true);
    } catch (error) {
      console.error("AI 제안 실패:", error.response?.data || error.message);
      alert("AI 스토리 제안을 가져오지 못했습니다.");
    }
  };

  const applyAiSuggestion = () => {
    setContent((prevContent) => {
      return prevContent.trim()
        ? `${prevContent}\n\n${aiSuggestion}`
        : aiSuggestion;
    });
    setShowAiSuggestion(false);
  };

  return (
    <div className="storywrite-container">
      <h1>스토리 작성</h1>
      {location && (
        <p className="location-info">
          현재 위치: 위도 {location.latitude.toFixed(6)}, 경도{" "}
          {location.longitude.toFixed(6)}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">제목</label>
          <input
            type="text"
            id="title"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            placeholder="이야기를 작성해보세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            required
          />
        </div>
        <div className="button-group">
          <button
            type="button"
            className="ai-suggestion-button"
            onClick={requestAiSuggestion}
          >
            AI 스토리 제안 받기
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "작성 중..." : "작성 완료"}
          </button>
        </div>
      </form>

      {showAiSuggestion && (
        <div className="ai-suggestion-container">
          <h3>AI 스토리 제안</h3>
          <p className="ai-suggestion-text">{aiSuggestion}</p>
          <div className="ai-buttons">
            <button onClick={applyAiSuggestion}>제안 적용하기</button>
            <button onClick={() => setShowAiSuggestion(false)}>닫기</button>
          </div>
        </div>
      )}

      <button className="back-button" onClick={() => navigate("/story")}>
        뒤로 가기
      </button>
    </div>
  );
};

export default Storywrite;
