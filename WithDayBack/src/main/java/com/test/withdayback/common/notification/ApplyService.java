package com.test.withdayback.common.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

//참가 신청
public class ApplyService {
    private final NotificationService notificationService;

    public void apply(Long hostId, String senderNickname) {
        // 호스트에게 알림
        notificationService.notifyApply(hostId, senderNickname);
    }

    public void approve(Long userId, String senderNickname) {
        // 승인 처리
        notificationService.notifyApproved(userId, senderNickname);
    }

    public void rejected(Long userId, String senderNickname) {
        // 거절 처리
        notificationService.notifyRejected(userId, senderNickname);
    }

    public void kick(Long userId, String senderNickname) {
        // 추방 처리
        notificationService.notifyKick(userId, senderNickname);
    }
}