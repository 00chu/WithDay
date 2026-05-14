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
    public ResponseEntity<ScheduleResponseDTO> getSchedule(@PathVariable Long id) {
        ScheduleResponseDTO result = scheduleService.getScheduleFullDetails(id);

        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
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
            @RequestParam(required = false) String keyword
    ) {
        List<Schedule> list = scheduleService.getAllSchedules(category, keyword);
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
            @PathVariable Long scheduleId,
            @RequestPart("data") ScheduleRequestDTO dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        if (images == null) {
            images = new ArrayList<>();
        }

        System.out.println(images.size());
        scheduleService.updateSchedule(scheduleId, dto, images);

        return ResponseEntity.ok("success");
    }

    @DeleteMapping(value = "/{scheduleId}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long scheduleId){
        int result = scheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.ok(result);
    }
}
