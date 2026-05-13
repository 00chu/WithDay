package com.test.withdayback.schedule.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.test.withdayback.schedule.dao.ScheduleDao;
import com.test.withdayback.schedule.dto.ScheduleRequestDTO;
import com.test.withdayback.schedule.dto.ScheduleResponseDTO;
import com.test.withdayback.schedule.vo.Schedule;
import com.test.withdayback.schedule.vo.ScheduleDetail;
import com.test.withdayback.schedule.vo.ScheduleImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ScheduleService {

    @Autowired
    private final ScheduleDao scheduleDao;

    @Autowired
    private Cloudinary cloudinary;

    public ScheduleService(ScheduleDao scheduleDao) {
        this.scheduleDao = scheduleDao;
    }

    public ScheduleResponseDTO getScheduleFullDetails(Long id) {
        String email = scheduleDao.getEmailByScheduleId(id);

        // 1. 일정 기본 정보 조회
        Schedule schedule = scheduleDao.selectScheduleById(id);

        if (schedule == null) return null;

        // 2. 세부 계획 리스트 조회
        List<ScheduleDetail> details = scheduleDao.selectDetailsByScheduleId(id);

        // 3. 이미지 리스트 조회
        List<ScheduleImage> images = scheduleDao.selectImageByScheduleId(id);

        // 3. 조립
        return new ScheduleResponseDTO(null, null, email, schedule, details, images);
    }

    // 🌟 파라미터를 받아서 Dao로 넘겨주도록 수정
    public List<Schedule> getAllSchedules(String category, String keyword) {
        return scheduleDao.getAllSchedules(category, keyword);
    }

    public void insertSchedule(ScheduleRequestDTO dto, List<MultipartFile> images) {

        Schedule schedule = dto.getSchedule();

        // 1. email → userId 변환
        Long userId = scheduleDao.findUserIdByEmail(dto.getEmail());
        schedule.setUserId(userId);

        // 2. schedule insert
        scheduleDao.insertSchedule(schedule);

        Long scheduleId = schedule.getId();

        // 3. detail insert
        if (dto.getDetailSchedule() != null) {
            for (ScheduleDetail detail : dto.getDetailSchedule()) {
                detail.setScheduleId(scheduleId);
                scheduleDao.insertScheduleDetail(detail);
            }
        }

        // 4. 이미지 insert (파일 저장은 따로 처리)
        List<String> imageUrls = new ArrayList<>();

        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (image != null && !image.isEmpty()) {
                    Map uploadParams = ObjectUtils.asMap(
                            "folder", "withday/schedule/images",
                            "use_filename", true,
                            "unique_filename", true
                    );
                    try {
                        Map uploadResult = cloudinary.uploader().upload(image.getBytes(), uploadParams);
                        imageUrls.add((String) uploadResult.get("secure_url"));
                    } catch (Exception e) {
                        throw new RuntimeException("이미지 업로드 실패", e);
                    }
                }
            }
            scheduleDao.insertScheduleImage(scheduleId, imageUrls);
        }
    }

}
