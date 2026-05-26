import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

/*
 * participation feature 공통 피드백 표시 레이어다.
 * 여러 페이지와 액션에서 서로 다른 성공/실패 메시지를 보여주지만,
 * 위치/스타일/사라지는 시간은 동일하게 유지하고 싶어서 컴포넌트로 분리했다.
 *
 * 사용 예:
 * - 참여 신청 성공/실패
 * - 신청 취소 성공/실패
 * - 내역 삭제 성공/실패
 * - 호스트 승인/거절/강퇴 성공/실패
 *
 * 상위는 feedback 객체만 만들어 넘기고,
 * 이 컴포넌트는 그 객체를 Snackbar + Alert UI로 렌더링한다.
 * 참여 기능에서 공통으로 사용하는 토스트 컴포넌트다.
 * 신청 성공/실패, 신청 취소, 내역 삭제, 호스트 승인/거절 결과를 같은 위치와 스타일로 보여주기 위해 분리했다.
 */
function ParticipationFeedback({ feedback, onClose }) {
  return (
    <Snackbar
      /*
       * key를 id에 연결하면 "같은 severity + 비슷한 문구"가 연속으로 와도
       * React가 같은 Snackbar로 재사용하지 않고 새 알림으로 인식한다.
       * 즉 사용자는 빠르게 연속 액션을 해도 각 결과를 개별 토스트로 볼 수 있다.
       *
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
         * 참여 기능 화면은 하단 네비게이션을 많이 사용하므로,
         * 토스트를 기본 bottom 위치에 두면 네비에 가려질 수 있다.
         * 그래서 앱 공통 CSS 변수로 계산된 chrome 간격만큼 위로 띄운다.
         *
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
         * Alert를 feedback이 있을 때만 렌더링하는 이유는,
         * message/severity가 없는 상태에서 잘못된 빈 Alert가 잠깐 나타나는 것을 막기 위해서다.
         * Snackbar 틀만 유지하고 내용은 조건부로 넣는 구조다.
         *
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
