export default function NotificationList() {
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const handleClickNotification = async (notification) => {
    await readNotification(notification.id);

    navigate(notification.targetUrl);
  };

  return (
    <div>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleClickNotification(notification)}
        >
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
}
