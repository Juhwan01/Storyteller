import axios from "axios";

// API 서버 기본 URL 설정
const API_URL = "/api"; // 프록시 설정을 통해 요청 리다이렉트

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 토큰 만료 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 토큰 만료 처리 (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_info");
      // 로그인 페이지로 리다이렉트
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 사용자 관련 API 서비스
const userService = {
  // 로그인
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await apiClient.post("/user/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  },

  // 회원가입
  signup: async (userData) => {
    const response = await apiClient.post("/user/signup", userData);
    return response.data;
  },

  // 사용자 정보 조회
  getUserInfo: async () => {
    const response = await apiClient.get("/user/me");
    return response.data;
  },
};

// 스토리 관련 API 서비스
const storyService = {
  // 모든 스토리 목록 조회
  getAllStories: async () => {
    const response = await apiClient.get("/story/all");
    return response.data;
  },

  // 주변 스토리 조회
  getNearbyStories: async (latitude, longitude, radius = 1.0) => {
    const response = await apiClient.get(
      `/story/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
    return response.data;
  },

  // 스토리 상세 조회
  getStoryById: async (storyId) => {
    const response = await apiClient.get(`/story/${storyId}`);
    return response.data;
  },

  // 스토리 생성
  createStory: async (storyData) => {
    const response = await apiClient.post("/story/create", storyData);
    return response.data;
  },

  // 위치 기반 스토리 작성 가능 여부 확인
  checkLocation: async (latitude, longitude) => {
    const response = await apiClient.post("/story/check-location", {
      latitude,
      longitude,
    });
    return response.data;
  },

  // 스토리 이어쓰기
  continueStory: async (parentStoryId, storyData) => {
    const response = await apiClient.post(
      `/story/${parentStoryId}/continue`,
      storyData
    );
    return response.data;
  },

  // 이어진 스토리 목록 조회
  getContinuations: async (storyId) => {
    const response = await apiClient.get(`/story/${storyId}/continuations`);
    return response.data;
  },

  // AI 스토리 제안 요청
  getAiSuggestion: async (latitude, longitude, currentContent) => {
    const response = await apiClient.post("/story/ai-suggestion", {
      latitude,
      longitude,
      currentContent,
    });
    return response.data;
  },
};

// 댓글 관련 API 서비스
const commentService = {
  // 댓글 목록 조회
  getComments: async (storyId) => {
    const response = await apiClient.get(`/story/${storyId}/comments`);
    return response.data;
  },

  // 댓글 생성
  createComment: async (storyId, content) => {
    const response = await apiClient.post(`/story/${storyId}/comments`, {
      content,
    });
    return response.data;
  },
};

export { userService, storyService, commentService };
