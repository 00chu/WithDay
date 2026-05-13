import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/queryClient.js";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// .env에 숨겨둔 클라이언트 ID 가져오기
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  // App 전체를 구글 프로바이더로 감싸줍니다
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>,
);
