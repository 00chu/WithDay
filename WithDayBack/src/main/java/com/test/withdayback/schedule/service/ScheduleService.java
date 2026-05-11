package com.test.withdayback.schedule.service;

import com.test.withdayback.schedule.dao.ScheduleDao;
import com.test.withdayback.schedule.dto.ScheduleResponseDTO;
import com.test.withdayback.schedule.vo.Schedule;
import com.test.withdayback.schedule.vo.ScheduleDetail;
import com.test.withdayback.schedule.vo.ScheduleImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleService {

    @Autowired
    private final ScheduleDao scheduleDao;

    public ScheduleService(ScheduleDao scheduleDao) {
        this.scheduleDao = scheduleDao;
    }

    public ScheduleResponseDTO getScheduleFullDetails(Long id) {
        // 1. 일정 기본 정보 조회
        Schedule schedule = scheduleDao.selectScheduleById(id);

        if(schedule == null) return null;

        // 2. 세부 계획 리스트 조회
        List<ScheduleDetail> details = scheduleDao.selectDetailsByScheduleId(id);

        // 3. 이미지 리스트 조회
        List<ScheduleImage> images = scheduleDao.selectImageByScheduleId(id);

        // 3. 조립
        return new ScheduleResponseDTO(schedule, details, images);
    }

    // 🌟 파라미터를 받아서 Dao로 넘겨주도록 수정
    public List<Schedule> getAllSchedules(String category, String keyword) {
        return scheduleDao.getAllSchedules(category, keyword);
    }
}
