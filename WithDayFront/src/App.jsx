import styles from "./App.module.css";
import Home from "./page/home/Home";
import { Routes, Route } from "react-router-dom";
import Signup from "./page/login/Signup";
import Login from "./page/login/Login";
import ScheduleDetail from "./page/schedule/ScheduleDetail";
import BottomNav from "./widgets/BottomNav/BottomeNav";
import Header from "./widgets/Header/Header";
import WriteSchedule from "./page/schedule/WriteSchedule";
import DinnerRsvpForm from "./page/exam/DinnerRsvpForm";
import EventForm from "./page/exam/EventForm";
import SocialExtra from "./page/login/SocialExtra";

function App() {
  return (
    <div className={styles.container}>
      <Header />
      {/* 🌟 메인 컨텐츠 영역을 감싸줍니다 */}
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup/extra" element={<SocialExtra />} />
          <Route path="/schedule/:scheduleId" element={<ScheduleDetail />} />
          <Route path="/write" element={<WriteSchedule />} />
          <Route path="/exam/dinner-rsvp" element={<DinnerRsvpForm />} />
          <Route path="/exam/event-form" element={<EventForm />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
