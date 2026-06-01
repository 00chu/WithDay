package com.test.withdayback.admin.controller;

import com.test.withdayback.admin.dto.AdminMemberRequest;
import com.test.withdayback.admin.service.AdminService;
import com.test.withdayback.user.vo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admins")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/members")
    public ResponseEntity<?> selectAllMember(AdminMemberRequest dto) {

        return ResponseEntity.ok(
                adminService.selectAllMember(dto)
        );
    }
}