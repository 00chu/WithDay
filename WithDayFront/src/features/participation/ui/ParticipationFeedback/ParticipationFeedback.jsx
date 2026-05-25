import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

/*
 * 참여 기능에서 공통으로 사용하는 토스트 컴포넌트다.
 * 신청 성공/실패, 신청 취소, 내역 삭제, 호스트 승인/거절 결과를 같은 위치와 스타일로 보여주기 위해 분리했다.
 */
function ParticipationFeedback({ feedback, onClose }) {
  return (
    <Snackbar
      /*
       * 같은 메시지가 연속으로 들어와도 Snackbar가 새 알림으로 다시 열리도록 key를 feedback.id로 잡는다.
       * id가 없을 때는 기본 key를 사용해 초기 null 상태에서도 안전하게 렌더링한다.
       */
      key={feedback?.id ?? "feedback"}
      open={Boolean(feedback)}
      autoHideDuration={2500}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
        /*
         * 하단 BottomNav와 겹치지 않도록 앱 공통 레이아웃 변수를 기준으로 위치를 올린다.
         * 페이지마다 footer가 달라도 토스트는 항상 BottomNav 바로 위에서 보이게 하는 것이 목표다.
         */
        "&.MuiSnackbar-root": {
          bottom:
            "calc(var(--bottom-nav-total-height) + var(--toast-gap-from-chrome))",
        },
      }}
    >
      {feedback ? (
        /*
         * feedback이 있을 때만 Alert를 렌더링한다.
         * MUI Snackbar는 children을 기대하므로 feedback이 null인 순간에는 빈 span으로 구조를 유지한다.
         */
        <Alert
          severity={feedback.severity}
          variant="filled"
          onClose={onClose}
          sx={{ width: "100%" }}
        >
          {feedback.message}
        </Alert>
      ) : (
        <span />
      )}
    </Snackbar>
  );
}

export default ParticipationFeedback;
