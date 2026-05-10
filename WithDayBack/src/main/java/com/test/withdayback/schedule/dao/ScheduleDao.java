package com.test.withdayback.schedule.dao;

import com.test.withdayback.schedule.dto.DetailScheduleRequestDTO;
import com.test.withdayback.schedule.dto.ScheduleRequestDTO;
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

    Long findUserIdByEmail(String email);

    int insertSchedule(ScheduleRequestDTO postData);

    int insertDetailSchedule(
            @Param("scheduleId") Long scheduleId,
            @Param("detailSchedule") List<DetailScheduleRequestDTO> detailSchedule
    );

    int insertScheduleImages(Long scheduleId, List<String> imageUrls);
}
