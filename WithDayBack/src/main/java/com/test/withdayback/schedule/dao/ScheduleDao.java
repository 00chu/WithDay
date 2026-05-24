package com.test.withdayback.schedule.dao;

import com.test.withdayback.schedule.vo.Schedule;
import com.test.withdayback.schedule.vo.ScheduleDetail;
import com.test.withdayback.schedule.vo.ScheduleImage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ScheduleDao {
    Schedule selectScheduleById(Long id);

    List<ScheduleDetail> selectDetailsByScheduleId(Long id);

    List<ScheduleImage> selectImageByScheduleId(Long id);

    /**
     * 조회수는 읽기-수정-쓰기 방식으로 처리하면 동시 요청에서 값이 유실될 수 있다.
     * 그래서 DB가 직접 원자적으로 +1 하도록 update 쿼리 한 번으로 처리한다.
     *
     * @param scheduleId 조회수를 증가시킬 일정 ID
     * @return 실제로 갱신된 행 수. 0이면 존재하지 않거나 삭제된 일정이다.
     */
    int increaseViewCount(@Param("scheduleId") Long scheduleId);

    int increaseCurrentParticipants(@Param("scheduleId") Long scheduleId);

    int decreaseCurrentParticipants(@Param("scheduleId") Long scheduleId);

    int closeScheduleWhenFull(@Param("scheduleId") Long scheduleId);

    int reopenScheduleWhenSlotAvailable(@Param("scheduleId") Long scheduleId);

    // Param을 사용해 파라미터 매핑
    List<Schedule> getAllSchedules(
            @Param("category") String category,
            @Param("keyword") String keyword,
            @Param("region") String region);
            
    Long findUserIdByEmail(String email);

    void insertSchedule(Schedule schedule);

    void insertScheduleDetail(ScheduleDetail detail);

    void insertScheduleImage(
            @Param("scheduleId") Long scheduleId,
            @Param("imageUrls") List<String> imageUrls
    );

    String getEmailByScheduleId(Long id);

    void updateSchedule(Schedule schedule);

    void deleteScheduleDetail(Long scheduleId);

    void deleteScheduleImages(@Param("deletedImageIds") List<Long> deletedImageIds);

    int deleteSchedule(Long scheduleId);

    void updateThumbnail(Long scheduleId, String url);

    int getScheduleImageCount(Long scheduleId);

    String getThumbnailImageUrl(Long scheduleId);

    void updateScheduleImage(Long scheduleId, List<String> imageUrls);

    int closeExpiredSchedules();
}
