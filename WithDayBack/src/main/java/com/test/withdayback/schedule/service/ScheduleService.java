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
        return new ScheduleResponseDTO(email, schedule, details, images);
    }

    public List<Schedule> getAllSchedules(String category, String keyword) {
        return scheduleDao.getAllSchedules(category, keyword);
    }

    @Transactional
    public void insertSchedule(ScheduleRequestDTO dto, List<MultipartFile> images) {
        Schedule schedule = dto.getSchedule();

        // email로 userId get
        Long userId = scheduleDao.findUserIdByEmail(dto.getEmail());
        schedule.setUserId(userId);

        // schedule insert
        scheduleDao.insertSchedule(schedule);

        Long scheduleId = schedule.getId();

        // detail insert
        if (dto.getDetailSchedule() != null) {
            for (ScheduleDetail detail : dto.getDetailSchedule()) {
                detail.setScheduleId(scheduleId);
                scheduleDao.insertScheduleDetail(detail);
            }
        }

        // 이미지 insert
        List<String> imageUrls = new ArrayList<>();

        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (image != null && !image.isEmpty()) {
                    Map uploadParams = ObjectUtils.asMap("folder", "withday/schedule/images", "use_filename", true, "unique_filename", true);
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

    @Transactional
    public void updateSchedule(Long scheduleId, ScheduleRequestDTO dto, List<MultipartFile> images) {
        Schedule schedule = dto.getSchedule();

        // email로 userId get
        Long userId = scheduleDao.findUserIdByEmail(dto.getEmail());

        schedule.setUserId(userId);
        schedule.setId(scheduleId);

        // schedule update
        scheduleDao.updateSchedule(schedule);

        // 기존 detail 삭제
        scheduleDao.deleteScheduleDetail(scheduleId);

        // detail 재insert
        if (dto.getDetailSchedule() != null) {
            for (ScheduleDetail detail : dto.getDetailSchedule()) {
                detail.setScheduleId(scheduleId);
                scheduleDao.insertScheduleDetail(detail);
            }
        }

        // 삭제할 이미지 삭제
        if (dto.getDeletedImageIds() != null && !dto.getDeletedImageIds().isEmpty()) {
            scheduleDao.deleteScheduleImages(dto.getDeletedImageIds());
        }

        // 새 이미지 업로드 + insert
        List<String> imageUrls = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (image != null && !image.isEmpty()) {
                    Map uploadParams = ObjectUtils.asMap("folder", "withday/schedule/images", "use_filename", true, "unique_filename", true);

                    try {
                        Map uploadResult = cloudinary.uploader().upload(image.getBytes(), uploadParams);
                        imageUrls.add((String) uploadResult.get("secure_url"));
                    } catch (Exception e) {
                        throw new RuntimeException("이미지 업로드 실패", e);
                    }
                }
            }

            if (!imageUrls.isEmpty()) {
                scheduleDao.insertScheduleImage(scheduleId, imageUrls);
            }
        }
    }

    public int deleteSchedule(Long scheduleId) {
        int result = scheduleDao.deleteSchedule(scheduleId);
        return result;
    }
}
