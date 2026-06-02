package com.test.withdayback.admin.controller;

import com.test.withdayback.admin.dto.AdminMemberRequest;
import com.test.withdayback.admin.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admins")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping(value = "/members")
    public ResponseEntity<?> selectAllMember(AdminMemberRequest dto) {

        return ResponseEntity.ok(
                adminService.selectAllMember(dto)
        );
    }

    @GetMapping(value = "/dashboards")
    public ResponseEntity<?> getDashboardData (@RequestParam(defaultValue = "daily") String period){
        return ResponseEntity.ok(adminService.getDashboardData(period));
    }
}