package com.test.withdayback.schedule.controller;

import com.test.withdayback.schedule.dto.ScheduleResponseDTO;
import com.test.withdayback.schedule.service.ScheduleService;
import com.test.withdayback.schedule.vo.Schedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("schedules")
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


    /**
     * 일정 조회
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
}
