import styles from "./App.module.css";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./page/home/Home";
import ExplorePage from "./page/explore/ExplorePage";
import Signup from "./page/login/Signup";
import Login from "./page/login/Login";
import SocialExtra from "./page/login/SocialExtra";

import ScheduleDetail from "./page/schedule/ScheduleDetail";
import WriteSchedule from "./page/schedule/WriteSchedule";
import UpdateSchedule from "./page/schedule/UpdateSchedule";

import MySchedulePage from "./page/my-schedule/MySchedulePage";
import MyPageMain from "./page/my-page/MyPageMain";
import WishlistPage from "./page/wishlist/WishlistPage";

import Header from "./widgets/Header/Header";
import BottomNav from "./widgets/BottomNav/BottomeNav";
import LayoutContainer from "./shared/ui/LayoutContainer/LayoutContainer";
import PrivateRoute from "./features/ui/PrivateRoute";

function App() {
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

            <Route
              path="/schedule/:scheduleId"
              element={<ScheduleDetail />}
            />

            <Route
              path="/mypage/:userId"
              element={
                <PrivateRoute>
                  <MyPageMain />
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
          </Routes>
        </LayoutContainer>
      </main>

      <BottomNav />
    </div>
  );
}

export default App;