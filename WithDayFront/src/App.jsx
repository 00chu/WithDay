import styles from "./App.module.css";
import { useState } from "react";
import Home from "./page/home/Home";
import ExplorePage from "./page/explore/ExplorePage";
import { Routes, Route } from "react-router-dom";
import Signup from "./page/login/Signup";
import Login from "./page/login/Login";
import ScheduleDetail from "./page/schedule/ScheduleDetail";
import BottomNav from "./widgets/BottomNav/BottomeNav";
import Header from "./widgets/Header/Header";
import WriteSchedule from "./page/schedule/WriteSchedule";
import MySchedulePage from "./page/my-schedule/MySchedulePage";
import SocialExtra from "./page/login/SocialExtra";
import PrivateRoute from "./features/ui/PrivateRoute";
import UpdateSchedule from "./page/schedule/UpdateSchedule";
import MyPageMain from "./page/my-page/MyPageMain";
import LayoutContainer from "./shared/ui/LayoutContainer/LayoutContainer";
import WishlistPage from "./page/wishlist/WishlistPage";

import OneSignal from "./shared/lib/oneSignal";
import { useEffect } from "react";

function App() {
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

  const [selectedRegion, setSelectedRegion] = useState("");

  return (
    <div className={styles.container}>
      <Header
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
      />
      <main className={styles.mainContent}>
        <LayoutContainer>
          <Routes>
            <Route
              path="/"
              element={<Home selectedRegion={selectedRegion} />}
            />
            <Route
              path="/explore"
              element={<ExplorePage selectedRegion={selectedRegion} />}
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup/extra" element={<SocialExtra />} />
            <Route path="/schedule/:scheduleId" element={<ScheduleDetail />} />
            <Route path="/mypage/:userId" element={<MyPageMain />} />
            <Route path="/my-schedule" element={<MySchedulePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
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
          </Routes>
        </LayoutContainer>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
