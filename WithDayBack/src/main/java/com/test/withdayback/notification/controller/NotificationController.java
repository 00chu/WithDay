package com.test.withdayback.notification.controller;

import com.test.withdayback.common.util.JwtUtil;
import com.test.withdayback.notification.service.NotificationService;
import com.test.withdayback.notification.vo.Notification;
import com.test.withdayback.user.service.UserService;
import com.test.withdayback.user.vo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin("*")
public class NotificationController {
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");

        String email = jwtUtil.getEmail(token);

        User user = userService.findByEmail(email);

        List<Notification> notifications =
                notificationService.getNotifications(user.getId());

        return ResponseEntity.ok(notifications);
    }
}

