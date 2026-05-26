package com.test.withdayback.participation.service;

import com.test.withdayback.notification.service.NotificationService;
import com.test.withdayback.participation.dao.ParticipationDao;
import com.test.withdayback.participation.dto.ParticipationStatusUpdateRequestDTO;
import com.test.withdayback.participation.dto.ParticipationStatusUpdateResponseDTO;
import com.test.withdayback.participation.enums.ParticipationStatus;
import com.test.withdayback.participation.vo.Participation;
import com.test.withdayback.schedule.dao.ScheduleDao;
import com.test.withdayback.schedule.enums.ScheduleStatus;
import com.test.withdayback.schedule.vo.Schedule;
import com.test.withdayback.user.dao.UserDao;
import com.test.withdayback.user.vo.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ParticipationServiceTest {

    @Mock
    private ParticipationDao participationDao;

    @Mock
    private UserDao userDao;

    @Mock
    private ScheduleDao scheduleDao;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ParticipationService participationService;

    @Test
    void cancelParticipationChangesApprovedToCanceledAndReopensSchedule() {
        Long participationId = 10L;
        User actor = new User();
        actor.setId(29L);
        actor.setEmail("user@withday.test");

        Participation participation = new Participation();
        participation.setId(participationId);
        participation.setUserId(29L);
        participation.setScheduleId(7L);
        participation.setStatus(ParticipationStatus.APPROVED);

        Schedule schedule = new Schedule();
        schedule.setId(7L);
        schedule.setStatus(ScheduleStatus.closed);
        schedule.setEndDate("2099-12-31");

        when(participationDao.findById(participationId)).thenReturn(participation);
        when(userDao.findByEmail("user@withday.test")).thenReturn(actor);
        when(scheduleDao.selectScheduleById(7L)).thenReturn(schedule);
        when(participationDao.cancelParticipation(
                participationId,
                "user@withday.test",
                "APPROVED",
                "canceled"
        )).thenReturn(1);
        when(scheduleDao.decreaseCurrentParticipants(7L)).thenReturn(1);

        participationService.cancelParticipation(participationId, "user@withday.test");

        verify(participationDao).cancelParticipation(
                participationId,
                "user@withday.test",
                "APPROVED",
                "canceled"
        );
        verify(scheduleDao).decreaseCurrentParticipants(7L);
        verify(scheduleDao).reopenScheduleWhenSlotAvailable(7L);
    }

    @Test
    void cancelParticipationRejectsAlreadyCanceledStatus() {
        Long participationId = 11L;
        User actor = new User();
        actor.setId(29L);

        Participation participation = new Participation();
        participation.setId(participationId);
        participation.setUserId(29L);
        participation.setScheduleId(8L);
        participation.setStatus(ParticipationStatus.CANCELED);

        Schedule schedule = new Schedule();
        schedule.setId(8L);
        schedule.setStatus(ScheduleStatus.recruiting);
        schedule.setEndDate("2099-12-31");

        when(participationDao.findById(participationId)).thenReturn(participation);
        when(userDao.findByEmail("user@withday.test")).thenReturn(actor);
        when(scheduleDao.selectScheduleById(8L)).thenReturn(schedule);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> participationService.cancelParticipation(participationId, "user@withday.test")
        );

        assertEquals("409 CONFLICT \"이미 취소된 참여입니다.\"", exception.getMessage());
        verify(participationDao, never()).cancelParticipation(participationId, "user@withday.test", "CANCELED", "canceled");
    }

    @Test
    void updateParticipationStatusKicksApprovedParticipant() {
        Long participationId = 12L;

        Participation participation = new Participation();
        participation.setId(participationId);
        participation.setUserId(41L);
        participation.setScheduleId(9L);
        participation.setStatus(ParticipationStatus.APPROVED);

        Schedule schedule = new Schedule();
        schedule.setId(9L);
        schedule.setUserId(77L);
        schedule.setTitle("주말 여행");
        schedule.setStatus(ScheduleStatus.closed);
        schedule.setCurrentParticipants(3);
        schedule.setMaxParticipants(3);
        schedule.setEndDate("2099-12-31");

        Schedule updatedSchedule = new Schedule();
        updatedSchedule.setId(9L);
        updatedSchedule.setUserId(77L);
        updatedSchedule.setTitle("주말 여행");
        updatedSchedule.setStatus(ScheduleStatus.recruiting);
        updatedSchedule.setCurrentParticipants(2);
        updatedSchedule.setMaxParticipants(3);
        updatedSchedule.setEndDate("2099-12-31");

        User host = new User();
        host.setId(77L);
        host.setEmail("host@withday.test");
        host.setNickname("호스트");

        User participantUser = new User();
        participantUser.setId(41L);
        participantUser.setEmail("guest@withday.test");

        ParticipationStatusUpdateRequestDTO dto = new ParticipationStatusUpdateRequestDTO(
                "host@withday.test",
                ParticipationStatus.KICKED,
                "운영 정책 위반"
        );

        when(participationDao.findById(participationId)).thenReturn(participation);
        when(scheduleDao.selectScheduleById(9L)).thenReturn(schedule, updatedSchedule, updatedSchedule);
        when(userDao.findByEmail("host@withday.test")).thenReturn(host);
        when(participationDao.updateStatus(participationId, "APPROVED", "kicked")).thenReturn(1);
        when(scheduleDao.decreaseCurrentParticipants(9L)).thenReturn(1);
        when(userDao.findById(41L)).thenReturn(participantUser);

        ParticipationStatusUpdateResponseDTO response =
                participationService.updateParticipationStatus(participationId, dto);

        assertEquals(ParticipationStatus.KICKED, response.getStatus());
        assertEquals(2, response.getCurrentParticipants());
        verify(notificationService).notifyKick(
                41L,
                "guest@withday.test",
                "호스트",
                "주말 여행"
        );
        verify(scheduleDao).reopenScheduleWhenSlotAvailable(9L);
    }

    @Test
    void updateParticipationStatusRejectsHostCanceledRequest() {
        ParticipationStatusUpdateRequestDTO dto = new ParticipationStatusUpdateRequestDTO(
                "host@withday.test",
                ParticipationStatus.CANCELED,
                ""
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> participationService.updateParticipationStatus(99L, dto)
        );

        assertEquals("400 BAD_REQUEST \"호스트는 취소 상태로 변경할 수 없습니다.\"", exception.getMessage());
        verify(participationDao, never()).findById(99L);
    }
}
