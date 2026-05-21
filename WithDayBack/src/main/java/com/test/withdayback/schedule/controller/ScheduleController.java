package com.test.withdayback.schedule.controller;

import com.test.withdayback.schedule.dto.ScheduleRequestDTO;
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
     * 일정 상세 조회
     *
     * @param id
     * @return ResponseEntity
     */
    @GetMapping("/{id}")
    public ResponseEntity<ScheduleResponseDTO> getSchedule(
            @PathVariable("id") Long id
    ) {
        ScheduleResponseDTO result = scheduleService.getScheduleFullDetails(id);

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
     * 일정 조회
     *
     * @param category
     * @param keyword
     * @return ResponseEntity
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
