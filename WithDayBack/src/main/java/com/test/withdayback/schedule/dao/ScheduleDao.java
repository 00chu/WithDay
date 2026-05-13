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

    int increaseCurrentParticipants(@Param("scheduleId") Long scheduleId);

    int decreaseCurrentParticipants(@Param("scheduleId") Long scheduleId);

    // 🌟 @Param을 사용해 파라미터 매핑
    List<Schedule> getAllSchedules(
            @Param("category") String category,
            @Param("keyword") String keyword);
            
    Long findUserIdByEmail(String email);

    void insertSchedule(Schedule schedule);

    void insertScheduleDetail(ScheduleDetail detail);

    void insertScheduleImage(
            @Param("scheduleId") Long scheduleId,
            @Param("imageUrls") List<String> imageUrls
    );
}
