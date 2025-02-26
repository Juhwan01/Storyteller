import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const StoryDetail = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [continuations, setContinuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // 스토리 상세 정보 로드
    fetchStoryDetail();
  }, [storyId]);

  const fetchStoryDetail = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }

      // 스토리 상세 정보 요청
      const storyResponse = await axios.get(`/api/story/${storyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStory(storyResponse.data.story);

      // 이어진 스토리 요청
      const continuationResponse = await axios.get(
        `/api/story/${storyId}/continuations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setContinuations(continuationResponse.data.continuations || []);

      // 댓글 요청
      const commentResponse = await axios.get(
        `/api/story/${storyId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments(commentResponse.data.comments || []);
      setLoading(false);
    } catch (error) {
      console.error(
        "스토리 상세 정보 로드 실패:",
        error.response?.data || error.message
      );
      setError("스토리를 불러오는 데 실패했습니다.");
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }

      const response = await axios.post(
        `/api/story/${storyId}/comments`,
        { content: comment },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 새 댓글 추가
      setComments((prev) => [...prev, response.data.comment]);
      setComment(""); // 입력 필드 비우기
    } catch (error) {
      console.error("댓글 작성 실패:", error.response?.data || error.message);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  const handleContinueStory = () => {
    navigate(`/storywrite?parent=${storyId}`);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container fade-in">
          <div className="loading-spinner"></div>
          <p>스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container fade-in">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate("/story")}>스토리 목록으로</button>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="page-container">
        <div className="error-container fade-in">
          <p className="error-message">스토리를 찾을 수 없습니다.</p>
          <button onClick={() => navigate("/story")}>스토리 목록으로</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="story-detail-container fade-in">
        <div className="story-detail-header">
          <h1>{story.title}</h1>
          <div className="story-meta">
            <p className="author-info">작성자: {story.author_nickname}</p>
            <p className="date-info">
              작성일: {new Date(story.created_at).toLocaleDateString()}
            </p>
            <p className="location-info">
              위치: 위도 {story.latitude?.toFixed(6)}, 경도{" "}
              {story.longitude?.toFixed(6)}
            </p>
          </div>
        </div>

        <div className="story-content">
          <p>{story.content}</p>
        </div>

        <div className="story-actions">
          <button className="continue-button" onClick={handleContinueStory}>
            이 이야기 이어쓰기
          </button>
          <button className="map-button" onClick={() => navigate("/map")}>
            지도에서 보기
          </button>
        </div>

        {continuations.length > 0 && (
          <div className="continuations-section">
            <h2>이어진 이야기들 ({continuations.length})</h2>
            <div className="continuations-list">
              {continuations.map((continuation) => (
                <div
                  key={continuation.id}
                  className="continuation-item"
                  onClick={() => navigate(`/story/${continuation.id}`)}
                >
                  <h3>{continuation.title}</h3>
                  <p className="continuation-preview">
                    {continuation.content.substring(0, 100)}
                    {continuation.content.length > 100 ? "..." : ""}
                  </p>
                  <div className="continuation-meta">
                    <span>작성자: {continuation.author_nickname}</span>
                    <span>
                      작성일:{" "}
                      {new Date(continuation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="comments-section">
          <h2>댓글 ({comments.length})</h2>

          <form className="comment-form" onSubmit={handleSubmitComment}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글을 작성해보세요..."
              rows={3}
            />
            <button type="submit">댓글 작성</button>
          </form>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">
                아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.author_nickname}
                    </span>
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleDateString()}{" "}
                      {new Date(comment.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <button className="back-button" onClick={() => navigate("/story")}>
          스토리 목록으로
        </button>
      </div>
    </div>
  );
};

export default StoryDetail;
