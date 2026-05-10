package com.test.withdayback.schedule.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.test.withdayback.schedule.dao.ScheduleDao;
import com.test.withdayback.schedule.dto.DetailScheduleRequestDTO;
import com.test.withdayback.schedule.dto.ScheduleRequestDTO;
import com.test.withdayback.schedule.dto.ScheduleResponseDTO;
import com.test.withdayback.schedule.vo.Schedule;
import com.test.withdayback.schedule.vo.ScheduleDetail;
import com.test.withdayback.schedule.vo.ScheduleImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
        // 1. 일정 기본 정보 조회
        Schedule schedule = scheduleDao.selectScheduleById(id);

        if (schedule == null) return null;

        // 2. 세부 계획 리스트 조회
        List<ScheduleDetail> details = scheduleDao.selectDetailsByScheduleId(id);

        // 3. 이미지 리스트 조회
        List<ScheduleImage> images = scheduleDao.selectImageByScheduleId(id);

        // 3. 조립
        return new ScheduleResponseDTO(schedule, details, images);
    }

    @Transactional
    public int insertSchedule(ScheduleRequestDTO postData,
                              List<DetailScheduleRequestDTO> detailSchedule,
                              List<MultipartFile> images) throws IOException {
        // email로 userId 불러옴
        Long userId = scheduleDao.findUserIdByEmail(postData.getMemberEmail());

        if (userId == null) {
            throw new RuntimeException("유저 없음");
        }
        postData.setUserId(userId);

        // postData insert
        int result1 = scheduleDao.insertSchedule(postData);
        // postDate insert 후 추가된 scheduleId를 받아옴.
        Long scheduleId = postData.getId();

        if (scheduleId == null) {
            throw new RuntimeException("scheduleId 생성 실패");
        }

        // 추가된 schedule id로 세부 일정 등록
        int result2 = 1;

        if (detailSchedule != null && !detailSchedule.isEmpty()) {
            result2 = scheduleDao.insertDetailSchedule(scheduleId, detailSchedule);
        }

        // 추가된 schedule id로 이미지 등록
        int result3 = 1;
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
            result3 = scheduleDao.insertScheduleImages(scheduleId, imageUrls);
        }

        if (result1 == 1 && result2 == detailSchedule.size() && result3 == imageUrls.size()) {
            return 1;
        } else {
            return 0;
        }
    }
}
