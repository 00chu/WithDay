package com.test.withdayback.schedule.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;


@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("ScheduleRequest")
public class ScheduleRequestDTO {
    private Long id;

    private Long userId;
    private String memberEmail;

    private String title;
    private String description;
    private String category;

    private String region;
    private String detailRegion;

    private String chatLink;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private LocalDateTime recruitStartDate;
    private LocalDateTime recruitEndDate;

    private Integer minParticipants;
    private Integer maxParticipants;

    private Integer minAge;
    private Integer maxAge;

    private String genderLimit;

    private Integer totalPrice;
    private Integer costType;
}
