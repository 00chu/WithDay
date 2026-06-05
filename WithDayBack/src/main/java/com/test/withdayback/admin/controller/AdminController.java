package com.test.withdayback.admin.controller;

import com.test.withdayback.admin.dto.AdminMemberRequest;
import com.test.withdayback.admin.service.AdminService;
import com.test.withdayback.schedule.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admins")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // 회원 조회
    @GetMapping(value = "/members")
    public ResponseEntity<?> selectAllMember(AdminMemberRequest dto) {
        return ResponseEntity.ok(
                adminService.selectAllMember(dto)
        );
    }

    // 대시보드 데이터 조회
    @GetMapping(value = "/dashboards")
    public ResponseEntity<?> getDashboardData (@RequestParam(defaultValue = "daily") String period){
        return ResponseEntity.ok(adminService.getDashboardData(period));
    }

    // 일정 조회
    @GetMapping("/schedules")
    public ResponseEntity<?> selectAllSchedule(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String detailRegion,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Map<String, Object> result = adminService.selectAllSchedule(
                keyword,
                region,
                detailRegion,
                status,
                page,
                size
        );

        return ResponseEntity.ok(result);
    }

    // 일정 공개 여부 변경
    @PatchMapping("/schedules/public/{scheduleId}")
    public ResponseEntity<?> updateSchedulePublic(
            @PathVariable Long scheduleId
    ) {
        int result = adminService.updateSchedulePublic(scheduleId);
        return ResponseEntity.ok(result);
    }

    // 일정 삭제
    @DeleteMapping("/schedules/delete/{scheduleId}")
    public ResponseEntity<?> deleteSchedule(
            @PathVariable Long scheduleId
    ) {
        int result = adminService.deleteSchedule(scheduleId);
        return ResponseEntity.ok(result);
    }
}