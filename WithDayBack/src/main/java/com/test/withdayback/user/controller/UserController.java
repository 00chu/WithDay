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

// 💡 @RestController: "나는 화면(HTML)을 반환하지 않고, 오직 데이터(JSON)만 반환하는 창구야!"라고 선언하는 스프링 부트의 핵심 원리.
// 프론트엔드(React)와 통신할 때는 무조건 이 어노테이션을 씁니다.
@RestController
// 💡 @RequestMapping: 이 창구의 기본 주소를 설정함. 즉, 아래의 모든 함수는 기본적으로 "/users" 로 시작하게 됨.
@RequestMapping("/users")
public class UserController {

    // 💡 @Autowired (의존성 주입 - DI 원리):
    // 개발자가 직접 `new UserService()`를 하지 않아도, 스프링 부트가 알아서 요리사(Service) 객체를 만들어서 이 컨트롤러에 연결(주입)해 줍니다.
    // 덕분에 코드가 결합도가 낮아져서 유지보수가 편해집니다.
    @Autowired
    private UserService userService;

    // ==========================================
    // 1. 일반 회원가입 (/users/signup)
    // ==========================================
    @PostMapping("/signup")
    // 💡 ResponseEntity<?>: 프론트엔드에게 단순히 데이터만 주는 게 아니라, HTTP 상태 코드(200 OK, 400 Bad Request 등)를 같이 포장해서 보내주는 박스 역할.
    public ResponseEntity<?> signup(
            // 💡 @RequestPart: 프론트엔드 api.js에서 `multipart/form-data`로 보냈기 때문에, @RequestBody가 아니라 @RequestPart로 쪼개서 받아야 함!
            @RequestPart("signupData") SignupRequestDTO signupRequest,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) { // required = false: 프사가 필수가 아님을 명시
        try {
            // 요리사(Service)에게 가입 처리를 맡김
            String result = userService.signup(signupRequest, profileImage);
            return ResponseEntity.ok(result); // 200 OK 상태코드와 함께 "success" 문자열 반환
        } catch (RuntimeException e) {
            // 에러가 터지면 프론트엔드의 axios 인터셉터가 잡을 수 있도록 400 Bad Request 상태코드와 에러 메시지를 보냄
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==========================================
    // 2. 일반 로그인 (/users/login)
    // ==========================================
    @PostMapping("/login")
    // 💡 @RequestBody: 프론트엔드에서 보낸 JSON 객체를 자바의 Map(Key-Value 형태)으로 쏙 변환해 주는 마법의 어노테이션.
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        // 요리사에게 이메일과 비번을 주고 검증을 맡김
        Map<String, Object> result = userService.login(email, password);

        // 결과가 null이면 (비번이 틀리거나 없는 이메일이면)
        if (result == null) {
            // 401 Unauthorized (인증 실패) 상태코드를 프론트로 던짐
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("이메일 또는 비밀번호가 일치하지 않습니다.");
        }
        // 로그인 성공 시 토큰과 유저 정보가 담긴 Map을 200 OK와 함께 반환
        return ResponseEntity.ok(result);
    }

    // ==========================================
    // 3. 구글 로그인 (신호만 던져주는 역할)
    // ==========================================
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> googleData) {
        try {
            Map<String, Object> result = userService.googleLogin(googleData);
            return ResponseEntity.ok(result); // 로그인 성공 또는 '가입 안됨(isRegistered: false)' 정보를 담아서 반환
        } catch (Exception e) {
            // 서버 내부 로직이 터지면 500 에러를 던짐
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("구글 로그인 처리 중 오류가 발생했습니다.");
        }
    }

    // ==========================================
    // 4. 이메일 인증 발송
    // ==========================================
    @PostMapping("/email-verification")
    public ResponseEntity<?> sendEmailVerification(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String authCode = userService.sendVerificationEmail(email); // 인증번호 생성 및 메일 발송
            return ResponseEntity.ok(authCode); // 생성된 인증번호를 프론트로 보내서 비교하게 함
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("이메일 발송에 실패했습니다.");
        }
    }

    // ==========================================
    // 5. 약관 정보 불러오기
    // ==========================================
    // @GetMapping: 데이터를 서버에 저장하는 게 아니라, 단순히 DB에서 '가져올(Read)' 때 사용.
    @GetMapping("/terms")
    public ResponseEntity<List<Terms>> getTerms() {
        return ResponseEntity.ok(userService.getAllTerms());
    }

    // ==========================================
    // 6. 소셜 로그인 진짜 회원가입
    // ==========================================
    @PostMapping("/social-signup")
    public ResponseEntity<?> socialSignup(@RequestBody SignupRequestDTO signupRequest) {
        try {
            // 특수 회원가입 정보를 통째로 서비스로 넘겨서 가입 완료 처리
            String result = userService.socialSignup(signupRequest);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}