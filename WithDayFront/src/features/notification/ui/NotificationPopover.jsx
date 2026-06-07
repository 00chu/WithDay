import Popover from "@mui/material/Popover";
import useMediaQuery from "@mui/material/useMediaQuery";
import NotificationList from "./NotificationList";

export default function NotificationPopover({ open, anchorEl, handleClose }) {
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      slotProps={{
        paper: {
          sx: {
            position: isMobile ? "fixed" : "absolute",
            top: isMobile ? "50%" : undefined,
            left: isMobile ? "50%" : undefined,
            transform: isMobile ? "translate(-50%, -50%)" : undefined,

            width: isMobile ? "calc(100vw - 24px)" : 480,
            maxWidth: isMobile ? "calc(100vw - 24px)" : 480,
            maxHeight: isMobile ? "80vh" : 600,

            overflowY: "auto",
            borderRadius: 2,
            m: 0,
          },
        },
      }}
    >
      <NotificationList onClose={handleClose} />
    </Popover>
  );
}
