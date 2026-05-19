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

function App() {
  const [selectedRegion, setSelectedRegion] = useState("");

  return (
    <div className={styles.container}>
      <Header
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
      />
      {/* 🌟 메인 컨텐츠 영역을 감싸줍니다 */}
      <main className={styles.mainContent}>
        <div className={styles.contentShell}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/explore"
              element={<ExplorePage selectedRegion={selectedRegion} />}
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup/extra" element={<SocialExtra />} />
            <Route path="/schedule/:scheduleId" element={<ScheduleDetail />} />

            {/* 내 일정 보기 */}
            <Route path="/my-schedule" element={<MySchedulePage />} />

            <Route
              path="/write"
              element={
                <PrivateRoute>
                  <WriteSchedule />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
