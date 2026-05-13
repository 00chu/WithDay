package com.test.withdayback.user.controller;

import com.test.withdayback.user.dto.SignupRequestDTO;
import com.test.withdayback.user.service.UserService;
import com.test.withdayback.user.vo.Terms;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // 1. 일반 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @RequestPart("signupData") SignupRequestDTO signupRequest,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        try {
            String result = userService.signup(signupRequest, profileImage);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. 일반 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        Map<String, Object> result = userService.login(email, password);

        if (result == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("이메일 또는 비밀번호가 일치하지 않습니다.");
        }
        return ResponseEntity.ok(result);
    }

    // 3. 구글 로그인 (신호만 던져주는 역할)
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> googleData) {
        try {
            Map<String, Object> result = userService.googleLogin(googleData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("구글 로그인 처리 중 오류가 발생했습니다.");
        }
    }

    // 4. 이메일 인증 발송
    @PostMapping("/email-verification")
    public ResponseEntity<?> sendEmailVerification(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String authCode = userService.sendVerificationEmail(email);
            return ResponseEntity.ok(authCode);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("이메일 발송에 실패했습니다.");
        }
    }

    // 5. 약관 정보 불러오기
    @GetMapping("/terms")
    public ResponseEntity<List<Terms>> getTerms() {
        return ResponseEntity.ok(userService.getAllTerms());
    }


    // 6. 소셜 로그인 진짜 회원가입 (POST)
    @PostMapping("/social-signup")
    public ResponseEntity<?> socialSignup(@RequestBody SignupRequestDTO signupRequest) {
        try {
            String result = userService.socialSignup(signupRequest);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}