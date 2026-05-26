package com.test.withdayback.schedule.service;

import com.test.withdayback.participation.dao.ParticipationDao;
import com.test.withdayback.participation.enums.ParticipationStatus;
import com.test.withdayback.participation.vo.Participation;
import com.test.withdayback.schedule.dto.ScheduleExecutionResponseDTO;
import com.test.withdayback.schedule.dao.ScheduleDao;
import com.test.withdayback.schedule.dto.ScheduleResponseDTO;
import com.test.withdayback.schedule.enums.CostType;
import com.test.withdayback.schedule.enums.GenderLimit;
import com.test.withdayback.schedule.enums.ScheduleStatus;
import com.test.withdayback.schedule.vo.Schedule;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {

    @Mock
    private ScheduleDao scheduleDao;

    @Mock
    private ParticipationDao participationDao;

    @InjectMocks
    private ScheduleService scheduleService;

    @Test
    void increaseViewCountReturnsTrueWhenRowWasUpdated() {
        Long scheduleId = 1L;

        // update 대상이 1건이면 실제로 조회수가 증가한 것이다.
        when(scheduleDao.increaseViewCount(scheduleId)).thenReturn(1);

        boolean result = scheduleService.increaseViewCount(scheduleId);

        assertTrue(result);
        verify(scheduleDao).increaseViewCount(scheduleId);
    }

    @Test
    void increaseViewCountReturnsFalseWhenScheduleDoesNotExist() {
        Long scheduleId = 999L;

        // update 결과가 0이면 존재하지 않거나 삭제된 일정이라고 본다.
        when(scheduleDao.increaseViewCount(scheduleId)).thenReturn(0);

        boolean result = scheduleService.increaseViewCount(scheduleId);

        assertFalse(result);
        verify(scheduleDao).increaseViewCount(scheduleId);
    }

    @Test
    void getScheduleFullDetailsIncludesFieldsNeededByCard() {
        Long scheduleId = 7L;
        Schedule schedule = new Schedule();
        schedule.setStartDate("2026-05-20");
        schedule.setEndDate("2026-05-22");
        schedule.setRecruitEndDate("2026-05-18");
        schedule.setGenderLimit(GenderLimit.female);
        schedule.setCostType(CostType.host_covered);

        schedule.setIsBookmarked(Boolean.TRUE);
        when(scheduleDao.getEmailByScheduleId(scheduleId)).thenReturn("host@withday.test");
        when(scheduleDao.selectScheduleByIdForViewer(scheduleId, "")).thenReturn(schedule);
        when(scheduleDao.selectDetailsByScheduleId(scheduleId)).thenReturn(List.of());
        when(scheduleDao.selectImageByScheduleId(scheduleId)).thenReturn(List.of());

        ScheduleResponseDTO result = scheduleService.getScheduleFullDetails(scheduleId, "");

        assertNotNull(result);
        assertEquals("2026-05-20", result.getStartDate());
        assertEquals("2026-05-22", result.getEndDate());
        assertEquals("2026-05-18", result.getRecruitEndDate());
        assertEquals("female", result.getGenderLimit());
        assertEquals("host_covered", result.getCostType());
        assertTrue(result.getIsBookmarked());
    }

    @Test
    void getScheduleFullDetailsReturnsNullWhenScheduleDoesNotExist() {
        Long scheduleId = 99L;

        when(scheduleDao.getEmailByScheduleId(scheduleId)).thenReturn(null);
        when(scheduleDao.selectScheduleByIdForViewer(scheduleId, "")).thenReturn(null);

        ScheduleResponseDTO result = scheduleService.getScheduleFullDetails(scheduleId, "");

        assertNull(result);
    }

    @Test
    void getScheduleFullDetailsHidesChatLinkForPendingViewer() {
        Long scheduleId = 21L;
        Schedule schedule = new Schedule();
        schedule.setChatLink("https://open.kakao.com/test-room");

        when(scheduleDao.getEmailByScheduleId(scheduleId)).thenReturn("host@withday.test");
        when(scheduleDao.selectScheduleByIdForViewer(scheduleId, "guest@withday.test")).thenReturn(schedule);
        when(scheduleDao.selectDetailsByScheduleId(scheduleId)).thenReturn(List.of());
        when(scheduleDao.selectImageByScheduleId(scheduleId)).thenReturn(List.of());
        Participation participation = new Participation();
        participation.setId(201L);
        participation.setStatus(ParticipationStatus.PENDING);

        when(participationDao.findByEmailAndScheduleId("guest@withday.test", scheduleId))
                .thenReturn(participation);

        ScheduleResponseDTO result =
                scheduleService.getScheduleFullDetails(scheduleId, "guest@withday.test");

        assertNotNull(result);
        assertFalse(result.getViewerIsHost());
        assertFalse(result.getViewerCanAccessChatLink());
        assertEquals(201L, result.getViewerParticipationId());
        assertEquals("PENDING", result.getViewerParticipationStatus());
        assertNull(result.getSchedule().getChatLink());
    }

    @Test
    void getScheduleFullDetailsShowsChatLinkForApprovedViewer() {
        Long scheduleId = 22L;
        Schedule schedule = new Schedule();
        schedule.setChatLink("https://open.kakao.com/test-room");

        when(scheduleDao.getEmailByScheduleId(scheduleId)).thenReturn("host@withday.test");
        when(scheduleDao.selectScheduleByIdForViewer(scheduleId, "approved@withday.test")).thenReturn(schedule);
        when(scheduleDao.selectDetailsByScheduleId(scheduleId)).thenReturn(List.of());
        when(scheduleDao.selectImageByScheduleId(scheduleId)).thenReturn(List.of());
        Participation participation = new Participation();
        participation.setId(202L);
        participation.setStatus(ParticipationStatus.APPROVED);

        when(participationDao.findByEmailAndScheduleId("approved@withday.test", scheduleId))
                .thenReturn(participation);

        ScheduleResponseDTO result =
                scheduleService.getScheduleFullDetails(scheduleId, "approved@withday.test");

        assertNotNull(result);
        assertTrue(result.getViewerCanAccessChatLink());
        assertEquals(202L, result.getViewerParticipationId());
        assertEquals("APPROVED", result.getViewerParticipationStatus());
        assertEquals("https://open.kakao.com/test-room", result.getSchedule().getChatLink());
    }

    @Test
    void completeScheduleChangesRecruitingToCompletedForHost() {
        Long scheduleId = 30L;
        Schedule schedule = new Schedule();
        schedule.setId(scheduleId);
        schedule.setStatus(ScheduleStatus.recruiting);
        schedule.setCurrentParticipants(3);
        schedule.setMinParticipants(2);
        schedule.setMaxParticipants(5);

        Schedule completedSchedule = new Schedule();
        completedSchedule.setId(scheduleId);
        completedSchedule.setStatus(ScheduleStatus.completed);
        completedSchedule.setCurrentParticipants(3);
        completedSchedule.setMaxParticipants(5);

        when(scheduleDao.selectScheduleById(scheduleId)).thenReturn(schedule, completedSchedule);
        when(scheduleDao.getEmailByScheduleId(scheduleId)).thenReturn("host@withday.test");
        when(scheduleDao.completeSchedule(scheduleId, "recruiting")).thenReturn(1);

        ScheduleExecutionResponseDTO response =
                scheduleService.completeSchedule(scheduleId, "host@withday.test");

        assertEquals(scheduleId, response.getScheduleId());
        assertEquals("COMPLETED", response.getStatus());
        verify(scheduleDao).completeSchedule(scheduleId, "recruiting");
    }

    @Test
    void rollbackCompletedScheduleReturnsClosedWhenRecruitDeadlinePassed() {
        Long scheduleId = 31L;
        Schedule completedSchedule = new Schedule();
        completedSchedule.setId(scheduleId);
        completedSchedule.setStatus(ScheduleStatus.completed);
        completedSchedule.setRecruitEndDate("2000-01-01");
        completedSchedule.setCurrentParticipants(4);
        completedSchedule.setMaxParticipants(5);

        Schedule closedSchedule = new Schedule();
        closedSchedule.setId(scheduleId);
        closedSchedule.setStatus(ScheduleStatus.closed);
        closedSchedule.setRecruitEndDate("2000-01-01");
        closedSchedule.setCurrentParticipants(4);
        closedSchedule.setMaxParticipants(5);

        when(scheduleDao.selectScheduleById(scheduleId)).thenReturn(completedSchedule, closedSchedule);
        when(scheduleDao.getEmailByScheduleId(scheduleId)).thenReturn("host@withday.test");
        when(scheduleDao.rollbackCompletedSchedule(scheduleId, "closed")).thenReturn(1);

        ScheduleExecutionResponseDTO response =
                scheduleService.rollbackCompletedSchedule(scheduleId, "host@withday.test");

        assertEquals("CLOSED", response.getStatus());
        verify(scheduleDao).rollbackCompletedSchedule(scheduleId, "closed");
    }

    @Test
    void completeScheduleRejectsHostWhenMinParticipantsNotMet() {
        Long scheduleId = 32L;
        Schedule schedule = new Schedule();
        schedule.setId(scheduleId);
        schedule.setStatus(ScheduleStatus.recruiting);
        schedule.setCurrentParticipants(1);
        schedule.setMinParticipants(2);

        when(scheduleDao.selectScheduleById(scheduleId)).thenReturn(schedule);
        when(scheduleDao.getEmailByScheduleId(scheduleId)).thenReturn("host@withday.test");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> scheduleService.completeSchedule(scheduleId, "host@withday.test")
        );

        assertEquals("409 CONFLICT \"최소 인원이 충족되지 않아 실행할 수 없습니다.\"", exception.getMessage());
    }

    @Test
    void updateScheduleRejectsCompletedSchedule() {
        Long scheduleId = 33L;
        Schedule schedule = new Schedule();
        schedule.setId(scheduleId);
        schedule.setStatus(ScheduleStatus.completed);

        when(scheduleDao.selectScheduleById(scheduleId)).thenReturn(schedule);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> scheduleService.updateSchedule(scheduleId, new com.test.withdayback.schedule.dto.ScheduleRequestDTO(), List.of())
        );

        assertEquals("409 CONFLICT \"진행 중인 일정은 수정할 수 없습니다.\"", exception.getMessage());
    }

    @Test
    void deleteScheduleRejectsCompletedSchedule() {
        Long scheduleId = 34L;
        Schedule schedule = new Schedule();
        schedule.setId(scheduleId);
        schedule.setStatus(ScheduleStatus.completed);

        when(scheduleDao.selectScheduleById(scheduleId)).thenReturn(schedule);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> scheduleService.deleteSchedule(scheduleId)
        );

        assertEquals("409 CONFLICT \"진행 중인 일정은 삭제할 수 없습니다.\"", exception.getMessage());
    }
}
