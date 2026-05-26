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

    public ScheduleService(ScheduleDao scheduleDao, ParticipationDao participationDao) {
        this.scheduleDao = scheduleDao;
        this.participationDao = participationDao;
    }

    /*
     * 일정 상세 조회의 Service 흐름이다.
     * Controller는 id/email만 넘기고, Service는 화면에 필요한 여러 테이블 데이터를 조합한다.
     * schedule, schedule_detail, schedule_image, participation 상태가 서로 다른 테이블에 있기 때문에
     * DTO로 묶어 내려줘야 프론트가 여러 API를 순차 호출하지 않아도 된다.
     */
    public ScheduleResponseDTO getScheduleFullDetails(Long id, String viewerEmail) {
        /*
         * 일정 작성자의 email은 상세 화면에서 호스트 판별 기준으로 사용한다.
         * 이후 viewerEmail과 비교해 현재 사용자가 호스트인지 계산한다.
         */
        String email = scheduleDao.getEmailByScheduleId(id);

        /*
         * 1. 일정 기본 정보 조회
         * selectScheduleById는 삭제되지 않은 schedule row만 가져온다.
         * 상세 화면의 제목, 설명, 날짜, 모집 인원, 썸네일, 오픈채팅 링크 등이 이 객체에 들어 있다.
         */
        Schedule schedule = scheduleDao.selectScheduleById(id);

        if (schedule == null) return null;

        /*
         * 2. Day-by-Day 세부 계획 조회
         * 일정 본문 아래에 날짜별 계획을 순서대로 렌더링하기 위해 day_number 오름차순으로 가져온다.
         */
        List<ScheduleDetail> details = scheduleDao.selectDetailsByScheduleId(id);

        /*
         * 3. 이미지 목록 조회
         * 상세 페이지의 이미지 슬라이더와 썸네일 fallback을 위해 schedule_image row를 함께 내려준다.
         */
        List<ScheduleImage> images = scheduleDao.selectImageByScheduleId(id);

        ScheduleResponseDTO response = new ScheduleResponseDTO(email, schedule, details, images);

        /*
         * viewerEmail은 선택값이다.
         * 비로그인 사용자는 guest로 상세를 볼 수 있지만, 참여 버튼 상태와 채팅 링크 권한은 로그인 사용자일 때만 계산할 수 있다.
         */
        String normalizedViewerEmail = viewerEmail == null ? "" : viewerEmail.trim();
        boolean viewerIsHost = !normalizedViewerEmail.isBlank() && normalizedViewerEmail.equalsIgnoreCase(email);
        String viewerParticipationStatus = null;

        /*
         * 현재 사용자가 이 일정에 신청/승인된 적이 있는지 조회한다.
         * 이 값은 프론트 ApplyScheduleButton의 "참여 신청하기/신청 완료/참여 확정" 라벨 결정에 쓰인다.
         */
        if (!normalizedViewerEmail.isBlank()) {
            viewerParticipationStatus = participationDao.findScheduleParticipationStatus(id, normalizedViewerEmail);
        }

        /*
         * 오픈채팅 링크는 호스트 또는 승인된 참여자에게만 보여준다.
         * 권한이 없으면 schedule.chatLink를 null로 지워 내려보내 프론트가 실수로 링크를 렌더링하지 않게 한다.
         */
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

    /*
     * 홈/탐색 탭의 일정 리스트 조회 흐름이다.
     * Service는 별도 비즈니스 가공 없이 Controller에서 받은 필터를 Dao로 넘긴다.
     * 필터 조건 조립은 MyBatis dynamic SQL이 더 적합하므로 mapper에서 category/keyword/region 조건을 선택적으로 붙인다.
     */
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
