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
    private String email;
    private String startDate;
    private String endDate;
    private String recruitEndDate;
    private String genderLimit;
    private String costType;
    private Schedule schedule;
    private List<ScheduleDetail> details;
    private List<ScheduleImage> images;

    public ScheduleResponseDTO(String email, Schedule schedule, List<ScheduleDetail> details, List<ScheduleImage> images) {
        this.email = email;
        this.schedule = schedule;
        this.details = details;
        this.images = images;
        this.startDate = schedule != null ? schedule.getStartDate() : null;
        this.endDate = schedule != null ? schedule.getEndDate() : null;
        this.recruitEndDate = schedule != null ? schedule.getRecruitEndDate() : null;
        this.genderLimit = schedule != null && schedule.getGenderLimit() != null
                ? schedule.getGenderLimit().name()
                : null;
        this.costType = schedule != null && schedule.getCostType() != null
                ? schedule.getCostType().name()
                : null;
    }
}
