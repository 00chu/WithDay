package com.test.withdayback.notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

//참가 신청
public class ApplyService {
    private final NotificationService notificationService;

    public void apply(Long hostId, String senderNickname, String title,long scheduleId) {
        // 호스트에게 알림
        notificationService.notifyApply(hostId, senderNickname, title, scheduleId);
    }

    public void approve(Long userId, String senderNickname, String title) {
        // 승인 처리
        notificationService.notifyApproved(userId, senderNickname, title);
    }

    public void rejected(Long userId, String senderNickname, String title) {
        // 거절 처리
        notificationService.notifyRejected(userId, senderNickname, title);
    }

    public void kick(Long userId, String senderNickname, String title) {
        // 추방 처리
        notificationService.notifyKick(userId, senderNickname, title);
    }
}