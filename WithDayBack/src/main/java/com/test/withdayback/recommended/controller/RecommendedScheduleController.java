package com.test.withdayback.recommended.controller;

import com.test.withdayback.recommended.dto.RecommendedScheduleRequestDTO;
import com.test.withdayback.recommended.dto.RecommendedScheduleResponseDTO;
import com.test.withdayback.recommended.service.RecommendedScheduleService;
import com.test.withdayback.common.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

// @RestController: 프론트엔드와 JSON 형태로 데이터를 주고받는 Controller
// @RequestMapping: 추천 일정 관련 API는 /recommended-schedules 주소로 시작
@RestController
@RequestMapping("/recommended-schedules")
public class RecommendedScheduleController {

    @Autowired
    private RecommendedScheduleService recommendedScheduleService;

    @Autowired
    private JwtUtil jwtUtil;

    // 추천 일정 목록 조회
    // 로그인한 사용자가 추천 일정 목록 페이지에 들어왔을 때 사용
    @GetMapping
    public ResponseEntity<?> getRecommendedScheduleList() {
        try {
            List<RecommendedScheduleResponseDTO> result =
                    recommendedScheduleService.getRecommendedScheduleList();

            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 추천 일정 상세 조회
    // 추천 일정 카드 클릭 후 상세 페이지에서 사용
    @GetMapping("/{id}")
    public ResponseEntity<?> getRecommendedScheduleById(@PathVariable Long id) {
        try {
            RecommendedScheduleResponseDTO result =
                    recommendedScheduleService.getRecommendedScheduleById(id);

            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 추천 일정 생성
    // 관리자만 추천 일정을 생성할 수 있음.
    // 프론트에서 JSON 데이터와 이미지 파일을 함께 보내므로 multipart/form-data로 받음.
    @PostMapping
    public ResponseEntity<?> insertRecommendedSchedule(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestPart("recommendedData") RecommendedScheduleRequestDTO recommendedRequest,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            // Authorization 헤더에서 Bearer 토큰 추출
            String token = authorizationHeader.replace("Bearer ", "");

            // 토큰에서 로그인한 유저 이메일 추출
            Claims claims = jwtUtil.parseClaims(token);
            String adminEmail = claims.getSubject();

            String result = recommendedScheduleService.insertRecommendedSchedule(
                    recommendedRequest,
                    images,
                    adminEmail
            );

            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("추천 일정 생성 중 오류가 발생했습니다.");
        }
    }
}