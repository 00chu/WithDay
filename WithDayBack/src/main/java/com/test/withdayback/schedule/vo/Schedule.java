package com.test.withdayback.schedule.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("Schedule")
public class Schedule {
    private Long id;
    private Integer userId;
    private String title;
    private String description;
    private ScheduleCategory category;
    private String region;
    private String startDate;
    private String endDate;
    private String recruitStartDate;
    private String recruitEndDate;
    private Integer minParticipants;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private GenderLimit genderLimit;
    private Integer ageMin;
    private Integer ageMax;
    private Integer totalPrice;
    private CostType costType;
    private String chatLink;
    private String thumbnailImage;
    private Integer viewCount;
    private ScheduleStatus status;
    private Integer isPublic;
    private String meetingLocation;
    private String meetingTime;
    private String cancelDeadline;
    private String createdAt;
    private String updatedAt;
    private String deletedAt;
}

enum ScheduleCategory {
    travel, popup, meal, activity, culture, hobby
}

enum GenderLimit {
    all, male, female
}

enum CostType {
    per_person, host_covered, free, custom
}

enum ScheduleStatus {
    recruiting, closed, cancelled, completed
}