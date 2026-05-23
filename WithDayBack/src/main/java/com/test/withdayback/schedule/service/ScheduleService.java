package com.test.withdayback.schedule.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.test.withdayback.participation.dao.ParticipationDao;
import com.test.withdayback.participation.enums.ParticipationStatus;
import com.test.withdayback.schedule.dao.ScheduleDao;
import com.test.withdayback.schedule.dto.ScheduleRequestDTO;
import com.test.withdayback.schedule.dto.ScheduleResponseDTO;
import com.test.withdayback.schedule.vo.Schedule;
import com.test.withdayback.schedule.vo.ScheduleDetail;
import com.test.withdayback.schedule.vo.ScheduleImage;
import com.test.withdayback.user.dao.UserDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ScheduleService {

    private final ScheduleDao scheduleDao;
    private final ParticipationDao participationDao;

    @Autowired
    private Cloudinary cloudinary;
    @Autowired
    private UserDao userDao;

    public ScheduleService(ScheduleDao scheduleDao, ParticipationDao participationDao) {
        this.scheduleDao = scheduleDao;
        this.participationDao = participationDao;
    }

    public ScheduleResponseDTO getScheduleFullDetails(Long id, String viewerEmail) {
        String email = scheduleDao.getEmailByScheduleId(id);

        // 1. 일정 기본 정보 조회
        Schedule schedule = scheduleDao.selectScheduleById(id);

        if (schedule == null) return null;

        // 2. 세부 계획 리스트 조회
        List<ScheduleDetail> details = scheduleDao.selectDetailsByScheduleId(id);

        // 3. 이미지 리스트 조회
        List<ScheduleImage> images = scheduleDao.selectImageByScheduleId(id);

        ScheduleResponseDTO response = new ScheduleResponseDTO(email, schedule, details, images);

        String normalizedViewerEmail = viewerEmail == null ? "" : viewerEmail.trim();
        boolean viewerIsHost = !normalizedViewerEmail.isBlank() && normalizedViewerEmail.equalsIgnoreCase(email);
        String viewerParticipationStatus = null;

        if (!normalizedViewerEmail.isBlank()) {
            viewerParticipationStatus = participationDao.findScheduleParticipationStatus(id, normalizedViewerEmail);
        }

        boolean viewerCanAccessChatLink = viewerIsHost
                || ParticipationStatus.APPROVED.name().equals(viewerParticipationStatus);

        if (!viewerCanAccessChatLink) {
            schedule.setChatLink(null);
        }

        response.setViewerIsHost(viewerIsHost);
        response.setViewerParticipationStatus(viewerParticipationStatus);
        response.setViewerCanAccessChatLink(viewerCanAccessChatLink);

        return response;
    }

    /**
     * 상세 페이지 진입 시 조회수를 1 증가시킨다.
     * <p>
     * 별도 API로 분리해두면 GET 상세 조회가 캐시/프리패치/자동 재시도에 휘말려
     * 의도치 않게 조회수가 더 오르는 문제를 줄일 수 있다.
     *
     * @param id 일정 ID
     * @return true면 증가 성공, false면 대상 일정이 없어서 증가하지 못한 경우
     */
    @Transactional
    public boolean increaseViewCount(Long id) {
        return scheduleDao.increaseViewCount(id) > 0;
    }

    // 🌟 파라미터를 받아서 Dao로 넘겨주도록 수정
    public List<Schedule> getAllSchedules(String category, String keyword, String region) {
        return scheduleDao.getAllSchedules(category, keyword, region);
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
                        if (imageUrls.size() == 1) {
                            scheduleDao.updateThumbnail(scheduleId, imageUrls.get(0));
                        }
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

        int imageCount = scheduleDao.getScheduleImageCount(scheduleId);

        // 삭제할 이미지 삭제
        if (dto.getDeletedImageIds() != null && !dto.getDeletedImageIds().isEmpty()) {
            scheduleDao.deleteScheduleImages(dto.getDeletedImageIds());
        }

        // 기존 이미지 전체 삭제
        if (imageCount == Objects.requireNonNull(dto.getDeletedImageIds()).size()) {
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
        // 기존 이미지 일부 삭제
        else {
            // 새 이미지 업로드 + thumbnail 지정
            List<String> imageUrls = new ArrayList<>();
            if (images != null && !images.isEmpty()) {
                for (MultipartFile image : images) {
                    if (image != null && !image.isEmpty()) {
                        Map uploadParams = ObjectUtils.asMap("folder",
                                "withday/schedule/images", "use_filename", true, "unique_filename", true);
                        try {
                            Map uploadResult = cloudinary.uploader().upload(image.getBytes(), uploadParams);
                            imageUrls.add((String) uploadResult.get("secure_url"));
                        } catch (Exception e) {
                            throw new RuntimeException("이미지 업로드 실패", e);
                        }
                    }
                }

                if (!imageUrls.isEmpty()) {
                    scheduleDao.updateScheduleImage(scheduleId, imageUrls);
                }
            }
        }
        // 썸네일 이미지 등록
        String thumbnailUrl = scheduleDao.getThumbnailImageUrl(scheduleId);
        scheduleDao.updateThumbnail(scheduleId, thumbnailUrl);
    }



    public int deleteSchedule(Long scheduleId) {
        return scheduleDao.deleteSchedule(scheduleId);
    }
}
