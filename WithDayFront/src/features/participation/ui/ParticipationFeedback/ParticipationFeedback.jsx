import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

function ParticipationFeedback({ feedback, onClose }) {
  return (
    <Snackbar
      key={feedback?.id ?? "feedback"}
      open={Boolean(feedback)}
      autoHideDuration={2500}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
        "&.MuiSnackbar-root": {
          bottom:
            "calc(var(--bottom-nav-total-height) + var(--toast-gap-from-chrome))",
        },
      }}
    >
      {feedback ? (
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
