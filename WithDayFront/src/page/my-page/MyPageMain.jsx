import styles from "./MyPageMain.module.css";
import { useAuthStore } from "../../features/auth/store/authStore"; 

const MyPageMain = () => {

  const user = useAuthStore((state)=> state.user);

  console.log(user);





  // 🌟 레인보우 텍스트가 흐르는 핵심 애니메이션 CSS 스타일 정의 (임시 치트키)
  const rainbowTextStyle = {
    fontWeight: "bold",
    fontSize: "1.2rem",
    background:
      "linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #6366f1, #a855f7, #ef4444)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "rainbow-move 3s linear infinite",
    display: "inline-block",
  };

  return (
    <div
      style={{
        padding: "40px 20px",
        fontFamily: "sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      {/* 글로벌 애니메이션 주입용 style 태그 */}
      <style>{`
        @keyframes rainbow-move {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>
        φ(゜▽゜*)♪ 마이페이지
      </h2>
      <p style={{ color: "#666", margin: "5px 0" }}>
        빠른 시일 내에 완공 될 예정입니다.
      </p>
      <p style={{ color: "#999", marginBottom: "30px", fontSize: "0.9rem" }}>
        양해해주셔서 감사합니다. - WithDay 일동
      </p>

      <div
        style={{
          background: "#f8fafc",
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0",
        }}
      >
        <p style={{ fontSize: "1.1rem", margin: "12px 0", color: "#334155" }}>
          어서오세요 닉네임:{" "}
          <span style={rainbowTextStyle}>{user.nickname}</span>님
        </p>
        <p style={{ fontSize: "1.1rem", margin: "12px 0", color: "#334155" }}>
          이메일: <span style={rainbowTextStyle}>{user.email}</span>
        </p>
        <span className={styles.logout}>로그아웃</span>
      </div>
    </div>
  );
};

export default MyPageMain;
