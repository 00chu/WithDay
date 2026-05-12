package com.test.withdayback.user.controller;

import com.test.withdayback.user.dto.SignupRequestDTO;
import com.test.withdayback.user.vo.Terms;
import com.test.withdayback.user.vo.User;
import com.test.withdayback.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping(value = "/signup", consumes = {"multipart/form-data"})
    public ResponseEntity<?> signup(
            @RequestPart("signupData") SignupRequestDTO signupRequest,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        // 💡 403 에러 방지 및 깔끔한 에러 메시지 반환을 위해 try-catch 추가
        try {
            String result = userService.signup(signupRequest, profileImage);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        Map<String, Object> loginResult = userService.login(user.getEmail(), user.getPassword());

        if (loginResult != null) {
            return ResponseEntity.ok(loginResult);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("이메일 또는 비밀번호가 틀렸습니다.");
        }
    }

    // 💡 구글 로그인 전용 엔드포인트 추가
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> googleData) {
        try {
            Map<String, Object> result = userService.googleLogin(googleData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("구글 로그인 처리 중 오류가 발생했습니다.");
        }
    }

    @PostMapping("/social-signup")
    public ResponseEntity<?> socialSignup(@RequestBody SignupRequestDTO signupRequest) {
        try {
            String result = userService.socialSignup(signupRequest);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/terms")
    public ResponseEntity<List<Terms>> getTerms() {
        List<Terms> termsList = userService.getAllTerms();
        return ResponseEntity.ok(termsList);
    }

    @PostMapping("/email-verification")
    public ResponseEntity<?> sendMail(@RequestBody Map<String, String> requestData) {
        String receiverEmail = requestData.get("email");

        // Controller는 가볍게! 복잡한 일은 UserService에게 토스합니다.
        String authCode = userService.sendVerificationEmail(receiverEmail);

        return ResponseEntity.ok(authCode);
    }
}