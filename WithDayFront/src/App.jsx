import styles from "./App.module.css";
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";

import Home from "./page/home/Home";
import ExplorePage from "./page/explore/ExplorePage";
import { useAuthStore } from "./features/auth/store/authStore";
import Signup from "./page/login/Signup";
import Login from "./page/login/Login";
import SocialExtra from "./page/login/SocialExtra";
import FindId from "./page/login/FindId";
import FindPw from "./page/login/FindPw";
import RecommendedSchedulePage from "./page/recommended-schedule/RecommendedSchedulePage";
import RecommendedScheduleWrite from "./page/recommended-schedule/RecommendedScheduleWrite";
import RecommendedScheduleDetail from "./page/recommended-schedule/RecommendedScheduleDetail";

import ScheduleDetail from "./page/schedule/ScheduleDetail";
import WriteSchedule from "./page/schedule/WriteSchedule";
import UpdateSchedule from "./page/schedule/UpdateSchedule";

import MySchedulePage from "./page/my-schedule/MySchedulePage";
import MyPageMain from "./page/my-page/MyPageMain";
import MyPageEdit from "./page/my-page/MyPageEdit";
import WishlistPage from "./page/wishlist/WishlistPage";

import OneSignal from "./shared/lib/oneSignal";
import Header from "./widgets/Header/Header";
import BottomNav from "./widgets/BottomNav/BottomeNav";
import LayoutContainer from "./shared/ui/LayoutContainer/LayoutContainer";
import PrivateRoute from "./features/ui/PrivateRoute";
import RecommendedScheduleEdit from "./page/recommended-schedule/RecommendedScheduleEdit";
import AdminPage from "./page/admin/AdminPage";

function App() {
  // 로그인 상태와 토큰 만료 여부를 Zustand에서 가져옴
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setLogout = useAuthStore((state) => state.setLogout);
  const getTokenRemainingTime = useAuthStore(
    (state) => state.getTokenRemainingTime,
  );

  // 로그인 상태가 변경될 때마다 토큰 만료 여부를 확인하여, 토큰이 만료됐으면 자동으로 로그아웃 처리하는 useEffect
  useEffect(() => {
    // 로그인 상태가 아니면 토큰 만료 여부를 확인할 필요가 없으므로 바로 return
    if (!isLoggedIn) {
      return;
    }

    // 토큰이 만료되기까지 남은 시간 계산
    const remainingTime = getTokenRemainingTime();

    // 남은 시간이 0 이하이면 이미 토큰이 만료된 상태이므로, 바로 로그아웃 처리하고 페이지 새로고침
    if (remainingTime <= 0) {
      setLogout();
      // 토큰이 만료되어 로그아웃 처리된 후, 로그인 페이지로 리다이렉트될 때 새로고침이 필요한 경우가 있어서, 새로고침도 함께 수행
      window.location.reload();
      return;
    }

    // 남은 시간이 양수이면, 해당 시간 후에 로그아웃 처리하는 타이머 설정
    const timer = window.setTimeout(() => {
      setLogout();
      // 토큰이 만료되어 로그아웃 처리된 후, 로그인 페이지로 리다이렉트될 때 새로고침이 필요한 경우가 있어서, 새로고침도 함께 수행
      window.location.reload();
    }, remainingTime);

    // 컴포넌트가 언마운트되거나 로그인 상태가 변경될 때 타이머 정리 (메모리 누수 방지)
    return () => window.clearTimeout(timer);
  }, [isLoggedIn, getTokenRemainingTime, setLogout]);

  useEffect(() => {
    const init = async () => {
      // OneSingal은 https 환경에서만 동작. 배포 운영 시 https 도메인 필요.
      await OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
      });
    };

    init();
  }, []);

  // 현재 URL 정보
  const location = useLocation();
  // location.pathname - 현재 URL을 문자열로
  const isAdminPage = location.pathname.startsWith("/admin");
  // 현재 화면 사이즈가 모바일인지 확인
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // 사이즈가 1024보다 작아지면 모바일 버전으로 설정
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={styles.container}>
      // 관리자 페이지고 너비가 1024 이하일 때 헤더를 사용하지 않도록 함
      {!(isAdminPage && isMobile) && <Header />}
      <main className={styles.mainContent}>
        <LayoutContainer>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/explore" element={<ExplorePage />} />

            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup/extra" element={<SocialExtra />} />
            <Route path="/find-id" element={<FindId />} />
            <Route path="/find-pw" element={<FindPw />} />
            <Route
              path="/recommended-schedules"
              element={
                <PrivateRoute>
                  <RecommendedSchedulePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/recommended-schedules/write"
              element={
                <PrivateRoute>
                  <RecommendedScheduleWrite />
                </PrivateRoute>
              }
            />
            <Route
              path="/recommended-schedules/edit/:id"
              element={
                <PrivateRoute>
                  <RecommendedScheduleEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/recommended-schedules/:id"
              element={
                <PrivateRoute>
                  <RecommendedScheduleDetail />
                </PrivateRoute>
              }
            />

            <Route path="/schedule/:scheduleId" element={<ScheduleDetail />} />

            <Route
              path="/mypage/:email"
              element={
                <PrivateRoute>
                  <MyPageMain />
                </PrivateRoute>
              }
            />
            <Route
              path="/mypage/edit/:email"
              element={
                <PrivateRoute>
                  <MyPageEdit />
                </PrivateRoute>
              }
            />

            <Route
              path="/my-schedule"
              element={
                <PrivateRoute>
                  <MySchedulePage />
                </PrivateRoute>
              }
            />

            <Route
              path="/wishlist"
              element={
                <PrivateRoute>
                  <WishlistPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/write"
              element={
                <PrivateRoute>
                  <WriteSchedule />
                </PrivateRoute>
              }
            />

            <Route
              path="/update"
              element={
                <PrivateRoute>
                  <UpdateSchedule />
                </PrivateRoute>
              }
            />

            <Route
              path="/update/:scheduleId"
              element={
                <PrivateRoute>
                  <UpdateSchedule />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/*"
              element={
                <PrivateRoute>
                  <AdminPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </LayoutContainer>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
