package com.test.withdayback.region.controller;

import com.test.withdayback.region.dao.RegionDao;
import com.test.withdayback.region.service.RegionService;
import com.test.withdayback.region.vo.Region;
import com.test.withdayback.schedule.dto.ScheduleResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/regions")
@CrossOrigin("*")
public class RegionController {

    @Autowired
    private RegionService regionService;

    @GetMapping()
    public ResponseEntity<List<Region>> getRegion() {
        List<Region> list = regionService.getRegion();
        return ResponseEntity.ok(list);
    }
}
