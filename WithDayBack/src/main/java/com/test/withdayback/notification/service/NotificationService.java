package com.test.withdayback.notification.service;

import com.test.withdayback.notification.dao.NotificationDao;
import com.test.withdayback.notification.enums.NotificationType;
import com.test.withdayback.notification.vo.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

// 알림 발송
public class NotificationService {
    @Autowired
    private NotificationDao notificationDao;

    private final OneSignalService oneSignalService;

    // 신청자 -> 호스트 (참가 신청)
    public void notifyApply(Long receiverId, String senderNickname) {
        String message = String.format("%s님이 참가 신청을 했습니다.", senderNickname);

        oneSignalService.sendToUser(
                receiverId,
                NotificationType.APPLY.getTitle(),
                message
        );
    }


    // 호스트 -> 신청자 (승인)
    public void notifyApproved(Long receiverId, String senderNickname) {
        String message = String.format("%s님이 참가 신청을 승인했습니다.", senderNickname);

        oneSignalService.sendToUser(
                receiverId,
                NotificationType.APPROVE.getTitle(),
                message
        );
    }


    // 호스트 -> 신청자 (거절)
    public void notifyRejected(Long receiverId, String senderNickname) {
        String message = String.format("%s님이 참가 신청을 거절했습니다.", senderNickname);

        oneSignalService.sendToUser(
                receiverId,
                NotificationType.REJECT.getTitle(),
                message
        );
    }


    // 호스트 -> 신청자 (강퇴)
    public void notifyKick(Long receiverId, String senderNickname) {
        String message = String.format("%s님이 플랜에서 추방했습니다.", senderNickname);
        oneSignalService.sendToUser(
                receiverId,
                NotificationType.KICK.getTitle(),
                message
        );
    }

    public List<Notification> getNotifications(Long id) {
        return notificationDao.getNotificationsById(id);
    }
}
