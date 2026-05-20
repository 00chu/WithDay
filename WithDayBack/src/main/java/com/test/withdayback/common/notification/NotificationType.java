package com.test.withdayback.common.notification;

public enum NotificationType {

    APPLY("참가 신청"),
    APPROVE("승인"),
    REJECT("거절");

    private final String title;

    NotificationType(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
    }
}
