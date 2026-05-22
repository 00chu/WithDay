package com.test.withdayback.scheduler;

import com.test.withdayback.schedule.dao.ScheduleDao;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScheduleCloseScheduler {

    @Autowired
    private ScheduleDao scheduleDao;

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    public void closeExpiredSchedules(){
        scheduleDao.closeExpiredSchedules();
    }
}
