package com.test.withdayback.admin.controller;

import com.test.withdayback.admin.service.AdminService;
import com.test.withdayback.user.vo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admins")
public class AdminController {
    @Autowired
    private AdminService adminService;

    @GetMapping(value = "/members")
    public ResponseEntity<?> selectAllMember(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String provider,
            @RequestParam(required = false) String status) {
        List<User> list = adminService.selectAllMember(keyword, gender, provider, status);
        return ResponseEntity.ok(list);
    }
}
