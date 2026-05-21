package com.test.withdayback.participation.service;

import com.test.withdayback.common.notification.NotificationService;
import com.test.withdayback.participation.dao.ParticipationDao;
import com.test.withdayback.participation.dto.ParticipationApplicantDTO;
import com.test.withdayback.participation.dto.ParticipationApplyResponseDTO;
import com.test.withdayback.participation.dto.ParticipationStatusUpdateRequestDTO;
import com.test.withdayback.participation.dto.ParticipationStatusUpdateResponseDTO;
import com.test.withdayback.participation.dto.ParticipationRequestDTO;
import com.test.withdayback.participation.dto.MyScheduleResponseDTO;
import com.test.withdayback.participation.enums.ParticipationStatus;
import com.test.withdayback.participation.vo.Participation;
import com.test.withdayback.schedule.dao.ScheduleDao;
import com.test.withdayback.schedule.enums.ScheduleStatus;
import com.test.withdayback.schedule.vo.Schedule;
import com.test.withdayback.user.dao.UserDao;
import com.test.withdayback.user.vo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class ParticipationService {
    @Autowired
    private ParticipationDao participationDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private ScheduleDao scheduleDao;

    @Autowired
    private NotificationService notificationService;

    public List<MyScheduleResponseDTO> getMyParticipations(String email, List<String> statuses) {
        String normalizedEmail = normalizeEmail(email);
        List<String> normalizedStatuses = normalizeStatusFilters(statuses);

        if (normalizedEmail.isBlank() || normalizedStatuses.isEmpty()) {
            return List.of();
        }

        return participationDao.getMyParticipations(normalizedEmail, normalizedStatuses);
    }

    public List<MyScheduleResponseDTO> getMyHostingSchedules(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail.isBlank()) {
            return List.of();
        }

        return participationDao.getMyHostingSchedules(normalizedEmail);
    }

    public boolean cancelParticipation(Long participationId, String email) {
        if (participationId == null || email == null || email.isBlank()) {
            return false;
        }

        return participationDao.cancelParticipation(participationId, email) > 0;
    }

    public boolean deleteParticipation(Long participationId, String email) {
        if (participationId == null || email == null || email.isBlank()) {
            return false;
        }

        return participationDao.deleteParticipation(participationId, email) > 0;
    }

    @Transactional
    public ParticipationApplyResponseDTO applySchedule(ParticipationRequestDTO dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "신청 정보가 올바르지 않습니다.");
        }

        Long scheduleId = dto.getScheduleId();
        String email = dto.getEmail() == null ? "" : dto.getEmail().trim();

        if (scheduleId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "일정 정보가 필요합니다.");
        }

        if (email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로그인 사용자 정보가 필요합니다.");
        }

        User user = userDao.findByEmail(email);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자 정보를 찾을 수 없습니다.");
        }

        Schedule schedule = scheduleDao.selectScheduleById(scheduleId);
        if (schedule == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "일정 정보를 찾을 수 없습니다.");
        }

        if (schedule.getStatus() != ScheduleStatus.recruiting) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "모집 중인 일정만 신청할 수 있습니다.");
        }

        if (schedule.getUserId() != null && schedule.getUserId().longValue() == user.getId()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "호스트는 자신의 일정에 신청할 수 없습니다.");
        }

        Participation existing = participationDao.findByEmailAndScheduleId(email, scheduleId);
        if (existing != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 신청한 일정입니다.");
        }

        Participation participation = new Participation();
        participation.setUserId(user.getId());
        participation.setScheduleId(scheduleId);
        participation.setStatus(ParticipationStatus.PENDING);

        int inserted = participationDao.insertParticipation(participation);
        if (inserted <= 0 || participation.getId() == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "참여 신청에 실패했습니다.");
        }

        String senderNickName = userDao.findByEmail(dto.getEmail()).getNickname();

        notificationService.notifyApply(
                user.getId(),          // senderId
                senderNickName
        );

        return new ParticipationApplyResponseDTO(
                participation.getId(),
                scheduleId,
                email,
                participation.getStatus(),
                "참여 신청이 완료되었습니다."
        );
    }

    public List<ParticipationApplicantDTO> getScheduleApplicants(Long scheduleId, String email, String status) {
        if (scheduleId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "일정 정보가 필요합니다.");
        }

        String normalizedEmail = email == null ? "" : email.trim();
        if (normalizedEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로그인 사용자 정보가 필요합니다.");
        }

        User actor = userDao.findByEmail(normalizedEmail);
        if (actor == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자 정보를 찾을 수 없습니다.");
        }

        Schedule schedule = scheduleDao.selectScheduleById(scheduleId);
        if (schedule == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "일정 정보를 찾을 수 없습니다.");
        }

        if (schedule.getUserId() == null || schedule.getUserId().longValue() != actor.getId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "호스트만 신청자 목록을 볼 수 있습니다.");
        }

        String normalizedStatus = normalizeStatusFilter(status);
        return participationDao.getScheduleApplicants(scheduleId, normalizedStatus);
    }

    @Transactional
    public ParticipationStatusUpdateResponseDTO updateParticipationStatus(
            Long participationId,
            ParticipationStatusUpdateRequestDTO dto
    ) {
        if (participationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "참여 정보가 필요합니다.");
        }

        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "상태 변경 정보가 필요합니다.");
        }

        String email = dto.getEmail() == null ? "" : dto.getEmail().trim();
        if (email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로그인 사용자 정보가 필요합니다.");
        }

        ParticipationStatus targetStatus = dto.getStatus();
        if (targetStatus == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "변경할 상태가 필요합니다.");
        }

        if (targetStatus == ParticipationStatus.KICKED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "강퇴 상태는 직접 변경할 수 없습니다.");
        }

        Participation participation = participationDao.findById(participationId);
        if (participation == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "참여 정보를 찾을 수 없습니다.");
        }

        Schedule schedule = scheduleDao.selectScheduleById(participation.getScheduleId());
        if (schedule == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "일정 정보를 찾을 수 없습니다.");
        }

        User actor = userDao.findByEmail(email);
        if (actor == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자 정보를 찾을 수 없습니다.");
        }

        if (schedule.getUserId() == null || schedule.getUserId().longValue() != actor.getId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "호스트만 상태를 변경할 수 있습니다.");
        }

        if (schedule.getStatus() != ScheduleStatus.recruiting) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "모집 중인 일정만 상태를 변경할 수 있습니다.");
        }

        ParticipationStatus currentStatus = participation.getStatus();
        if (currentStatus == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "현재 상태를 확인할 수 없습니다.");
        }

        if (!currentStatus.canTransitionTo(targetStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "변경할 수 없는 상태 전이입니다.");
        }

        if (currentStatus == targetStatus) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 같은 상태입니다.");
        }

        if (targetStatus == ParticipationStatus.APPROVED) {
            int increased = scheduleDao.increaseCurrentParticipants(schedule.getId());
            if (increased <= 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "정원이 초과되어 승인할 수 없습니다.");
            }
        }

        int updated = participationDao.updateStatus(
                participationId,
                currentStatus.name(),
                targetStatus.name()
        );
        if (updated <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "상태 변경에 실패했습니다.");
        }

        if (currentStatus == ParticipationStatus.APPROVED && targetStatus == ParticipationStatus.CANCELLED) {
            int decreased = scheduleDao.decreaseCurrentParticipants(schedule.getId());
            if (decreased <= 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "정원 수를 조정할 수 없습니다.");
            }
        }

        Schedule updatedSchedule = scheduleDao.selectScheduleById(schedule.getId());
        if (updatedSchedule == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "일정 정보를 다시 불러오지 못했습니다.");
        }

        String senderNickName = userDao.findByEmail(dto.getEmail()).getNickname();

        if (targetStatus == ParticipationStatus.APPROVED) {
            notificationService.notifyApproved(
                    participation.getUserId(),  // receiverId
                    senderNickName
            );
        }

        if (targetStatus == ParticipationStatus.REJECTED) {
            notificationService.notifyRejected(
                    participation.getUserId(),  // receiverId
                    senderNickName
            );
        }

        return new ParticipationStatusUpdateResponseDTO(
                participationId,
                updatedSchedule.getId(),
                targetStatus,
                updatedSchedule.getCurrentParticipants(),
                updatedSchedule.getMaxParticipants(),
                OffsetDateTime.now(ZoneId.of("Asia/Seoul"))
        );
    }

    private String normalizeStatusFilter(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        try {
            return ParticipationStatus.fromValue(status).name();
        } catch (IllegalArgumentException exception) {
            String normalized = status.trim().toUpperCase(Locale.ROOT);
            if ("CANCELED".equals(normalized)) {
                return ParticipationStatus.CANCELLED.name();
            }
            throw exception;
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim();
    }

    private List<String> normalizeStatusFilters(List<String> statuses) {
        if (statuses == null || statuses.isEmpty()) {
            return List.of();
        }

        return statuses.stream()
                .map(this::normalizeStatusFilter)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }
}
