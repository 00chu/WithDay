package com.test.withdayback.schedule.controller;

import com.test.withdayback.schedule.dto.ScheduleRequestDTO;
import com.test.withdayback.schedule.dto.ScheduleResponseDTO;
import com.test.withdayback.schedule.service.ScheduleService;
import com.test.withdayback.schedule.vo.Schedule;
import com.test.withdayback.schedule.vo.ScheduleDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping("/schedules")
    public ResponseEntity<?> insertSchedule(
            @RequestPart("data") ScheduleRequestDTO dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        scheduleService.insertSchedule(dto, images);
        return ResponseEntity.ok("success");
    }
}
