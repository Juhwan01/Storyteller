import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import MobileNav from "./components/MobileNav";
import Location from "./components/Location";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Home from "./Pages/home";
import Story from "./Pages/Story";
import Storywrite from "./Pages/Storywrite";
import StoryDetail from "./Pages/StoryDetail";
import MapView from "./Pages/MapView";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 로그인 상태 확인
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);

    // 토큰 상태 변경 감지 이벤트 리스너
    const handleStorageChange = () => {
      const token = localStorage.getItem("access_token");
      setIsAuthenticated(!!token);
    };

    window.addEventListener("storage", handleStorageChange);
    document.documentElement.setAttribute("data-theme", "dark");

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 인증이 필요한 라우트를 위한 래퍼 컴포넌트
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="app-wrapper">
        <Header />
        <main className="main-container">
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/story" element={<Story />} />

            {/* 보호된 라우트 */}
            <Route
              path="/location"
              element={
                <ProtectedRoute>
                  <Location />
                </ProtectedRoute>
              }
            />
            <Route
              path="/story/:storyId"
              element={
                <ProtectedRoute>
                  <StoryDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/storywrite"
              element={
                <ProtectedRoute>
                  <Storywrite />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapView />
                </ProtectedRoute>
              }
            />

            {/* 404 페이지 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <MobileNav />
      </div>
    </Router>
  );
}

export default App;
