package com.test.withdayback.common.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ApplyService {

    private final NotificationService notificationService;

    public void apply(Long hostId, Long userId) {
        // 호스트에게 알림
        //notificationService.notifyApply(hostId, userId);
    }

    public void approve(Long userId, Long hostId) {
        // 승인 처리
        //notificationService.notifyApproved(userId, hostId);
    }

    public void rejected(Long userId, Long hostId) {
        // 거절 처리
        //notificationService.notifyRejected(userId, hostId);
    }

    public void kick(Long userId, Long hostId) {
        // 추방 처리
        //notificationService.notifyKick(userId, hostId);
    }
}