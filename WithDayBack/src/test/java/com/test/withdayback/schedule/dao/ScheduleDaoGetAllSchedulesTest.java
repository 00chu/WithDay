package com.test.withdayback.schedule.dao;

import com.test.withdayback.schedule.vo.Schedule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;

@MybatisTest
@ActiveProfiles("test")
class ScheduleDaoGetAllSchedulesTest {

    @Autowired
    private ScheduleDao scheduleDao;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("DROP TABLE IF EXISTS schedule");
        jdbcTemplate.execute("""
                CREATE TABLE schedule (
                    id BIGINT PRIMARY KEY,
                    user_id BIGINT NULL,
                    title VARCHAR(255) NULL,
                    description VARCHAR(255) NULL,
                    category VARCHAR(50) NULL,
                    region VARCHAR(100) NULL,
                    detail_region VARCHAR(100) NULL,
                    chat_link VARCHAR(255) NULL,
                    start_date DATE NULL,
                    end_date DATE NULL,
                    recruit_start_date DATE NULL,
                    recruit_end_date DATE NULL,
                    min_participants INT NULL,
                    max_participants INT NULL,
                    current_participants INT NULL,
                    age_min INT NULL,
                    age_max INT NULL,
                    gender_limit VARCHAR(20) NULL,
                    total_price INT NULL,
                    cost_type VARCHAR(50) NULL,
                    thumbnail_image VARCHAR(255) NULL,
                    view_count INT NULL,
                    status VARCHAR(20) NOT NULL,
                    is_public INT NULL,
                    cancel_deadline DATE NULL,
                    created_at TIMESTAMP NULL,
                    updated_at TIMESTAMP NULL,
                    deleted_at TIMESTAMP NULL
                )
                """);

        LocalDate today = LocalDate.now();

        insertSchedule(1L, "Open Travel", "Seoul mountain trip", "travel", "SEOUL",
                "recruiting", 1, 5, today.plusDays(2), null);
        insertSchedule(2L, "Full Travel", "Busan beach trip", "travel", "BUSAN",
                "closed", 5, 5, today.plusDays(2), null);
        insertSchedule(3L, "Expired Travel", "Daegu night walk", "travel", "DAEGU",
                "closed", 2, 5, today.minusDays(1), null);
        insertSchedule(4L, "Expired Full Travel", "Jeju full group", "travel", "JEJU",
                "closed", 4, 4, today.minusDays(1), null);
        insertSchedule(5L, "Cancelled Travel", "No longer active", "travel", "SEOUL",
                "canceled", 1, 5, today.plusDays(2), null);
        insertSchedule(6L, "Completed Travel", "Already done", "travel", "SEOUL",
                "completed", 1, 5, today.plusDays(2), null);
        insertSchedule(7L, "Deleted Travel", "Soft deleted", "travel", "SEOUL",
                "recruiting", 1, 5, today.plusDays(2), Timestamp.valueOf(today.atStartOfDay()));
        insertSchedule(8L, "Food Gathering", "Seoul dinner plan", "food", "SEOUL",
                "recruiting", 2, 6, today.plusDays(3), null);
    }

    @Test
    void getAllSchedulesShowsRecruitingAndFullClosedButHidesExpiredClosed() {
        List<Schedule> schedules = scheduleDao.getAllSchedules(null, null, null);

        assertEquals(3, schedules.size());
        assertIterableEquals(List.of(8L, 2L, 1L), schedules.stream().map(Schedule::getId).toList());
    }

    @Test
    void getAllSchedulesAppliesCategoryKeywordAndRegionFiltersOnTopOfVisibilityRule() {
        List<Schedule> schedules = scheduleDao.getAllSchedules("travel", "beach", " busan ");

        assertEquals(1, schedules.size());
        assertEquals(2L, schedules.get(0).getId());
    }

    @Test
    void getAllSchedulesKeepsFullClosedVisibleWhenRecruitEndDateIsToday() {
        insertSchedule(9L, "Today Full Travel", "Still visible today", "travel", "SEOUL",
                "closed", 3, 3, LocalDate.now(), null);

        List<Schedule> schedules = scheduleDao.getAllSchedules("travel", null, "seoul");

        assertIterableEquals(List.of(9L, 1L), schedules.stream().map(Schedule::getId).toList());
    }

    private void insertSchedule(
            Long id,
            String title,
            String description,
            String category,
            String region,
            String status,
            int currentParticipants,
            int maxParticipants,
            LocalDate recruitEndDate,
            Timestamp deletedAt
    ) {
        jdbcTemplate.update("""
                        INSERT INTO schedule (
                            id, user_id, title, description, category, region, detail_region, chat_link,
                            start_date, end_date, recruit_start_date, recruit_end_date,
                            min_participants, max_participants, current_participants,
                            age_min, age_max, gender_limit, total_price, cost_type,
                            thumbnail_image, view_count, status, is_public, cancel_deadline,
                            created_at, updated_at, deleted_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                id,
                1L,
                title,
                description,
                category,
                region,
                null,
                null,
                Date.valueOf(LocalDate.now().plusDays(10)),
                Date.valueOf(LocalDate.now().plusDays(12)),
                Date.valueOf(LocalDate.now().minusDays(1)),
                recruitEndDate == null ? null : Date.valueOf(recruitEndDate),
                1,
                maxParticipants,
                currentParticipants,
                null,
                null,
                null,
                null,
                null,
                null,
                0,
                status,
                1,
                null,
                Timestamp.valueOf(LocalDate.now().atStartOfDay()),
                Timestamp.valueOf(LocalDate.now().atStartOfDay()),
                deletedAt
        );
    }
}
