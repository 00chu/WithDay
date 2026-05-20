package com.test.withdayback.participation.dao;

import com.test.withdayback.participation.dto.MyScheduleResponseDTO;
import com.test.withdayback.participation.dto.ParticipationApplicantDTO;
import com.test.withdayback.participation.vo.Participation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ParticipationDao {
    Participation findById(@Param("participationId") Long participationId);

    Participation findByEmailAndScheduleId(
            @Param("email") String email,
            @Param("scheduleId") Long scheduleId
    );

    int insertParticipation(Participation participation);

    int updateStatus(
            @Param("participationId") Long participationId,
            @Param("currentStatus") String currentStatus,
            @Param("targetStatus") String targetStatus
    );

    List<ParticipationApplicantDTO> getScheduleApplicants(
            @Param("scheduleId") Long scheduleId,
            @Param("status") String status
    );

    List<MyScheduleResponseDTO> getMyParticipations(
            @Param("email") String email,
            @Param("statuses") List<String> statuses
    );

    List<MyScheduleResponseDTO> getMyHostingSchedules(@Param("email") String email);

    int cancelParticipation(
            @Param("participationId") Long participationId,
            @Param("email") String email,
            @Param("currentStatus") String currentStatus,
            @Param("targetStatus") String targetStatus
    );

    int deleteParticipation(
            @Param("participationId") Long participationId,
            @Param("email") String email
    );
}
