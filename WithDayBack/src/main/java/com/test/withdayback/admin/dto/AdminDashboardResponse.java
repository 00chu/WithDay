package com.test.withdayback.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminDashboardResponse {
    private int totalUserCount; // 어제까지 전체 회원 수
    private int nowTotalUserCount; // 현재 전체 회원 수
    private int totalScheduleCount; // 어제까지 전체 일정 수
    private int nowTotalScheduleCount; // 현재 전체 일정 수
    private int recommendedScheduleCount; // 추천 일정 수
    private int completedScheduleCount; // 시작된 일정 개수
    private int closedScheduleCount; // 마감된 일정 개수
}
