import styles from "./App.module.css";
import Home from "./page/home/Home";
import { Routes, Route } from "react-router-dom";
import Signup from "./page/login/Signup";
import ScheduleDetail from "./page/schedule/ScheduleDetail";
import BottomNav from "./widgets/BottomNav/BottomeNav";
import Header from "./widgets/Header/Header";
// import SignupForm from "./page/login/SignupForm";
import WriteSchedule from "./page/schedule/WriteSchedule";

function App() {
  return (
    <div className={styles.container}>
      <Header />
      {/* 🌟 메인 컨텐츠 영역을 감싸줍니다 */}
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<Signup />} />
          <Route path="/schedule/:scheduleId" element={<ScheduleDetail />} />
          <Route path="/write" element={<WriteSchedule />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
