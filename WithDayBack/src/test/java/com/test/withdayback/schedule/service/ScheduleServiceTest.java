package com.test.withdayback.schedule.service;

import com.test.withdayback.schedule.dao.ScheduleDao;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {

    @Mock
    private ScheduleDao scheduleDao;

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
}
