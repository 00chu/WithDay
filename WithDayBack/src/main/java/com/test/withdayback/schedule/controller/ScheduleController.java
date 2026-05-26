package com.test.withdayback.schedule.controller;

import com.test.withdayback.schedule.dto.ScheduleRequestDTO;
import com.test.withdayback.schedule.dto.ScheduleExecutionResponseDTO;
import com.test.withdayback.schedule.dto.ScheduleResponseDTO;
import com.test.withdayback.schedule.service.ScheduleService;
import com.test.withdayback.schedule.vo.Schedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/schedules")
@CrossOrigin("*")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    /**
     * 일정 상세 조회 API
     *
     * 상세 페이지는 단순 schedule row만으로 화면을 만들 수 없다.
     * 기본 일정 정보, Day-by-Day 세부 일정, 이미지 목록, 현재 사용자의 참여 상태를 함께 내려줘야
     * 프론트가 상세 본문, 참여 버튼, 호스트 신청자 관리, 오픈채팅 링크 노출 여부를 한 번에 판단할 수 있다.
     *
     * email은 선택 파라미터다.
     * 비로그인 사용자는 email 없이 상세를 볼 수 있고, 로그인 사용자는 email을 보내 viewerIsHost/viewerParticipationStatus 계산을 받는다.
     *
     * @param id 상세 조회할 일정 ID
     * @param email 현재 로그인 사용자의 email. 없으면 guest 관점으로 응답한다.
     * @return 일정이 존재하면 ScheduleResponseDTO, 삭제되었거나 없으면 404
     */
    @GetMapping("/{id}")
    public ResponseEntity<ScheduleResponseDTO> getSchedule(
            @PathVariable("id") Long id,
            @RequestParam(required = false) String email
    ) {
        ScheduleResponseDTO result = scheduleService.getScheduleFullDetails(id, email);
        System.out.println(result);

        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 상세 페이지 진입 시 조회수를 1 증가시킨다.
     *
     * 조회수 증가는 쓰기 작업이기 때문에 GET 상세 조회에 합치지 않고 별도 엔드포인트로 분리한다.
     * 이렇게 두면 프론트가 "언제 1회 증가시킬지"를 더 명확하게 제어할 수 있다.
     *
     * @param id 조회수를 증가시킬 일정 ID
     * @return 증가 성공 시 204, 대상 일정이 없으면 404
     */
    @PostMapping("/{id}/view")
    public ResponseEntity<Void> increaseViewCount(@PathVariable Long id) {
        boolean updated = scheduleService.increaseViewCount(id);

        if (!updated) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }


    /**
     * 홈/탐색 탭에서 사용하는 일정 리스트 조회 API
     *
     * 프론트 Home.jsx와 ExplorePage.jsx가 모두 이 endpoint를 사용한다.
     * Home은 전체 목록을 받아 가까운 일정 8개만 보여주고,
     * Explore는 category/keyword/region 파라미터를 조합해 필터링된 목록을 카드 그리드로 보여준다.
     *
     * Controller는 HTTP query parameter만 받고 실제 필터 조합은 Service/Mapper에 위임한다.
     * 이렇게 해두면 화면이 늘어나도 같은 리스트 API를 재사용할 수 있고, SQL 조건은 mapper 한 곳에서 관리된다.
     *
     * @param category travel, food 같은 카테고리 코드. null이면 전체 카테고리 조회.
     * @param keyword 제목/설명 검색어. null이면 검색 조건 없음.
     * @param region Header에서 선택한 지역. null이면 전체 지역 조회.
     * @return 조건에 맞는 일정 목록
     */
    @GetMapping
    public ResponseEntity<List<Schedule>> getAllSchedules(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region
    ) {
        List<Schedule> list = scheduleService.getAllSchedules(category, keyword, region);
        if (list == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(list);
    }

    /**
     * 호스트가 일정을 "실행 중(completed)" 상태로 전환하는 API다.
     *
     * 이 endpoint를 별도로 두는 이유:
     * - 일반 일정 수정 API와 섞으면 "status만 바꾸는 강한 정책 액션"의 의미가 흐려진다.
     * - 실행은 최소 인원, 호스트 권한, 상태 전이 가능 여부를 같이 검증해야 하므로 목적형 API가 더 안전하다.
     *
     * Controller는 HTTP 입력만 받고,
     * 실제 정책 판단은 Service가 수행한다.
     */
    @PostMapping("/{scheduleId}/complete")
    public ResponseEntity<ScheduleExecutionResponseDTO> completeSchedule(
            @PathVariable Long scheduleId,
            @RequestParam String email
    ) {
        ScheduleExecutionResponseDTO result = scheduleService.completeSchedule(scheduleId, email);
        return ResponseEntity.ok(result);
    }

    /**
     * completed 상태를 다시 recruiting 또는 closed로 되돌리는 실행 취소 API다.
     *
     * 복귀 상태는 Controller가 결정하지 않는다.
     * 모집 마감일이 지났는지에 따라 recruiting/closed를 나누는 정책은 Service 한 곳에서 관리해야
     * 프론트와 다른 엔드포인트가 같은 규칙을 재사용할 수 있다.
     */
    @PostMapping("/{scheduleId}/complete/rollback")
    public ResponseEntity<ScheduleExecutionResponseDTO> rollbackCompletedSchedule(
            @PathVariable Long scheduleId,
            @RequestParam String email
    ) {
        ScheduleExecutionResponseDTO result = scheduleService.rollbackCompletedSchedule(scheduleId, email);
        return ResponseEntity.ok(result);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> insertSchedule(
            @RequestPart("data") ScheduleRequestDTO dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        scheduleService.insertSchedule(dto, images);
        return ResponseEntity.ok("success");
    }

    @PutMapping(
            value = "/{scheduleId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<String> updateSchedule(
            @PathVariable("scheduleId") Long scheduleId,
            @RequestPart("data") ScheduleRequestDTO dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        if (images == null) {
            images = new ArrayList<>();
        }
        scheduleService.updateSchedule(scheduleId, dto, images);

        return ResponseEntity.ok("success");
    }

    @DeleteMapping(value = "/{scheduleId}")
    public ResponseEntity<?> deleteSchedule(
            @PathVariable("scheduleId") Long scheduleId
    ) {
        int result = scheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.ok(result);
    }
}
