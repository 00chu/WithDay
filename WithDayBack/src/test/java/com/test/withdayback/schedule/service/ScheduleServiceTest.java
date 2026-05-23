package com.test.withdayback.schedule.service;

import com.test.withdayback.participation.dao.ParticipationDao;
import com.test.withdayback.schedule.dao.ScheduleDao;
import com.test.withdayback.schedule.dto.ScheduleResponseDTO;
import com.test.withdayback.schedule.enums.CostType;
import com.test.withdayback.schedule.enums.GenderLimit;
import com.test.withdayback.schedule.vo.Schedule;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
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

        when(scheduleDao.getEmailByScheduleId(scheduleId)).thenReturn("host@withday.test");
        when(scheduleDao.selectScheduleById(scheduleId)).thenReturn(schedule);
        when(scheduleDao.selectDetailsByScheduleId(scheduleId)).thenReturn(List.of());
        when(scheduleDao.selectImageByScheduleId(scheduleId)).thenReturn(List.of());

        ScheduleResponseDTO result = scheduleService.getScheduleFullDetails(scheduleId, "");

        assertNotNull(result);
        assertEquals("2026-05-20", result.getStartDate());
        assertEquals("2026-05-22", result.getEndDate());
        assertEquals("2026-05-18", result.getRecruitEndDate());
        assertEquals("female", result.getGenderLimit());
        assertEquals("host_covered", result.getCostType());
    }

    @Test
    void getScheduleFullDetailsReturnsNullWhenScheduleDoesNotExist() {
        Long scheduleId = 99L;

        when(scheduleDao.getEmailByScheduleId(scheduleId)).thenReturn(null);
        when(scheduleDao.selectScheduleById(scheduleId)).thenReturn(null);

        ScheduleResponseDTO result = scheduleService.getScheduleFullDetails(scheduleId, "");

        assertNull(result);
    }

    @Test
    void getScheduleFullDetailsHidesChatLinkForPendingViewer() {
        Long scheduleId = 21L;
        Schedule schedule = new Schedule();
        schedule.setChatLink("https://open.kakao.com/test-room");

        when(scheduleDao.getEmailByScheduleId(scheduleId)).thenReturn("host@withday.test");
        when(scheduleDao.selectScheduleById(scheduleId)).thenReturn(schedule);
        when(scheduleDao.selectDetailsByScheduleId(scheduleId)).thenReturn(List.of());
        when(scheduleDao.selectImageByScheduleId(scheduleId)).thenReturn(List.of());
        when(participationDao.findScheduleParticipationStatus(scheduleId, "guest@withday.test"))
                .thenReturn("PENDING");

        ScheduleResponseDTO result =
                scheduleService.getScheduleFullDetails(scheduleId, "guest@withday.test");

        assertNotNull(result);
        assertFalse(result.getViewerIsHost());
        assertFalse(result.getViewerCanAccessChatLink());
        assertEquals("PENDING", result.getViewerParticipationStatus());
        assertNull(result.getSchedule().getChatLink());
    }

    @Test
    void getScheduleFullDetailsShowsChatLinkForApprovedViewer() {
        Long scheduleId = 22L;
        Schedule schedule = new Schedule();
        schedule.setChatLink("https://open.kakao.com/test-room");

        when(scheduleDao.getEmailByScheduleId(scheduleId)).thenReturn("host@withday.test");
        when(scheduleDao.selectScheduleById(scheduleId)).thenReturn(schedule);
        when(scheduleDao.selectDetailsByScheduleId(scheduleId)).thenReturn(List.of());
        when(scheduleDao.selectImageByScheduleId(scheduleId)).thenReturn(List.of());
        when(participationDao.findScheduleParticipationStatus(scheduleId, "approved@withday.test"))
                .thenReturn("APPROVED");

        ScheduleResponseDTO result =
                scheduleService.getScheduleFullDetails(scheduleId, "approved@withday.test");

        assertNotNull(result);
        assertTrue(result.getViewerCanAccessChatLink());
        assertEquals("https://open.kakao.com/test-room", result.getSchedule().getChatLink());
    }
}
