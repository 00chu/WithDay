import { Navigate } from "react-router-dom";
import { useAuthStore } from "../auth/store/authStore";
import { useEffect } from "react";
import Swal from "sweetalert2";

// 로그인 안 하고 로그인 필요한 기능 사용하려고 할 시 로그인 창으로 이동
const PrivateRoute = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      Swal.fire({
        icon: "warning",
        title: "로그인 필요",
        text: "로그인이 필요한 기능입니다",
        confirmButtonText: "확인",
      });
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
