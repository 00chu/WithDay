package com.test.withdayback.participation.controller;

import com.test.withdayback.participation.dto.MyScheduleResponseDTO;
import com.test.withdayback.participation.dto.ParticipationApplicantDTO;
import com.test.withdayback.participation.dto.ParticipationApplyResponseDTO;
import com.test.withdayback.participation.dto.ParticipationStatusUpdateRequestDTO;
import com.test.withdayback.participation.dto.ParticipationStatusUpdateResponseDTO;
import com.test.withdayback.participation.dto.ParticipationRequestDTO;
import com.test.withdayback.participation.service.ParticipationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/participations")
public class ParticipationController {

    @Autowired
    private ParticipationService participationService;

    /**
     * 내 참여/신청 일정 조회 (참여중 / 신청중 탭)
     * 프론트엔드 호출 예시: /participations/me?email=user@test.com&statuses=APPROVED,KICKED
     * @param email
     * @param statuses
     * @return
     */
    @GetMapping("/me")
    public ResponseEntity<List<MyScheduleResponseDTO>> getMyParticipations(
            @RequestParam String email,
            @RequestParam List<String> statuses) { // 여러 상태를 List로 받음

        System.out.printf("내 참여 일정 조회 요청 - email: %s, statuses: %s\n", email, statuses);
        List<MyScheduleResponseDTO> result = participationService.getMyParticipations(email, statuses);
        return ResponseEntity.ok(result);
    }

    /**
     * 내가 만든 일정 조회
     * @param email
     * @return
     */
    @GetMapping("/me/hosting")
    public ResponseEntity<List<MyScheduleResponseDTO>> getMyHostingSchedules(
            @RequestParam String email) {

        System.out.printf("내가 만든 일정 조회 요청 - email: %s\n", email);
        List<MyScheduleResponseDTO> result = participationService.getMyHostingSchedules(email);
        return ResponseEntity.ok(result);
    }

    /**
     * 일정별 신청자 목록 (호스트 전용)
     */
    @GetMapping("/schedules/{scheduleId}/applicants")
    public ResponseEntity<List<ParticipationApplicantDTO>> getScheduleApplicants(
            @PathVariable Long scheduleId,
            @RequestParam String email,
            @RequestParam(required = false) String status) {

        List<ParticipationApplicantDTO> result =
                participationService.getScheduleApplicants(scheduleId, email, status);
        return ResponseEntity.ok(result);
    }

    /**
     * 참여 신청 취소
     */
    @PatchMapping("/{participationId}/cancel")
    public ResponseEntity<?> cancelParticipation(
            @PathVariable Long participationId,
            @RequestParam String email) {

        boolean updated = participationService.cancelParticipation(participationId, email);
        if (!updated) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("취소할 신청 정보를 찾을 수 없습니다.");
        }

        return ResponseEntity.ok().build();
    }

    /**
     * 거절/강퇴된 참여 내역 삭제
     */
    @DeleteMapping("/{participationId}")
    public ResponseEntity<?> deleteParticipation(
            @PathVariable Long participationId,
            @RequestParam String email) {

        boolean deleted = participationService.deleteParticipation(participationId, email);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("삭제할 참여 정보를 찾을 수 없습니다.");
        }

        return ResponseEntity.ok().build();
    }

    /**
     * 일정 참여 신청 (사용자)
     * @param dto
     * @return
     */
    @PostMapping
    public ResponseEntity<ParticipationApplyResponseDTO> applySchedule(@RequestBody ParticipationRequestDTO dto) {
        ParticipationApplyResponseDTO result = participationService.applySchedule(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    /**
     * 참여 상태 변경 (호스트 전용)
     * Body 예시: { "email": "host@test.com", "status": "APPROVED", "reason": "정원 가능" }
     * @param participationId
     * @param dto
     * @return
     */
    @PatchMapping("/{participationId}/status")
    public ResponseEntity<ParticipationStatusUpdateResponseDTO> updateParticipationStatus(
            @PathVariable Long participationId,
            @RequestBody ParticipationStatusUpdateRequestDTO dto) {

        ParticipationStatusUpdateResponseDTO result =
                participationService.updateParticipationStatus(participationId, dto);
        return ResponseEntity.ok(result);
    }
}
