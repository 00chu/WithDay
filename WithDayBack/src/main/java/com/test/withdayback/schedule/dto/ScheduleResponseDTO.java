package com.test.withdayback.schedule.dto;

import com.test.withdayback.schedule.vo.Schedule;
import com.test.withdayback.schedule.vo.ScheduleDetail;
import com.test.withdayback.schedule.vo.ScheduleImage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("ScheduleResponse")
public class ScheduleResponseDTO {
    private Long id;
    private String userId;
    private Schedule schedule;
    private List<ScheduleDetail> details;
    private List<ScheduleImage> images;
}
