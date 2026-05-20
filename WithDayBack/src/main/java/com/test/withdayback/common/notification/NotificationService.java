package com.test.withdayback.common.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final OneSignalService oneSignalService;

    public void notifyApply(Long hostId, Long userId) {
        String message = String.format("%d님이 참가 신청했습니다.", userId);

        oneSignalService.sendToUser(
                hostId,
                NotificationType.APPLY.getTitle(),
                message
        );
    }

    public void notifyApproved(Long hostId, Long userId) {
        String message = String.format("%d님이 참가 신청을 승인했습니다.", hostId);

        oneSignalService.sendToUser(
                userId,
                NotificationType.APPROVE.getTitle(),
                message
        );
    }

    public void notifyRejected(Long hostId, Long userId) {
        String message = String.format("%d님이 참가 신청을 거절했습니다.", hostId);

        oneSignalService.sendToUser(
                userId,
                NotificationType.REJECT.getTitle(),
                message
        );
    }
}
