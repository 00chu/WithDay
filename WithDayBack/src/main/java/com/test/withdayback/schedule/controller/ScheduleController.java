package com.test.withdayback.schedule.controller;

import com.test.withdayback.schedule.dto.DetailScheduleRequestDTO;
import com.test.withdayback.schedule.dto.ScheduleRequestDTO;
import com.test.withdayback.schedule.dto.ScheduleResponseDTO;
import com.test.withdayback.schedule.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/schedules")
@CrossOrigin("*")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    /**
     * 일정 상세 조회
     * @param id
     * @return ResponseEntity
     */
    @GetMapping("/{id}")
    public ResponseEntity<ScheduleResponseDTO> getSchedule(@PathVariable Long id) {
        ScheduleResponseDTO result = scheduleService.getScheduleFullDetails(id);

        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    // 일정 등록
    @PostMapping(value = "/insert-schedule", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> insertSchedule(
            @RequestPart("postData") ScheduleRequestDTO postData,
            @RequestPart("detailSchedule") List<DetailScheduleRequestDTO> detailSchedule,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) throws IOException {
        System.out.println(postData);
        System.out.println(detailSchedule);
        System.out.println(images);

        int result = scheduleService.insertSchedule(postData, detailSchedule, images);

        return ResponseEntity.ok(result);
    }
}
